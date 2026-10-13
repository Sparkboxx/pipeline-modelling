// Tests for the text format and its tools. Run: node --test scripts/test/*.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync, spawn } from "node:child_process";
import vm from "node:vm";
import { parse, check, render } from "../pipeline-dsl.mjs";
import { toMermaid, iconPack } from "../pipeline-mermaid.mjs";
import { diagramHtml } from "../../integrations/html.mjs";
import markdownItPlugin from "../../integrations/markdown-it.mjs";
import remarkPlugin from "../../integrations/remark.mjs";

const root = new URL("../../", import.meta.url).pathname;
const errorsOf = (src) => check(src).errors.map((e) => `${e.line}: ${e.message}`);
const warningsOf = (src) => check(src).warnings.map((e) => `${e.line}: ${e.message}`);
const node = (m, id) => m.nodes.find((n) => n.id === id);
const flows = (m) => m.edges.map((e) => [e.from.id ?? `group:${e.from.group}`, e.to.id ?? `group:${e.to.group}`, e.mark || (e.both ? "<->" : ""), e.name]);

// --- lines, comments and text ---

test("arrows work with and without spaces", () => {
  const m = parse("processor a\nprocessor b\nprocessor c\na->b\nb -> c");
  assert.deepEqual(flows(m), [["a", "b", "", ""], ["b", "c", "", ""]]);
});

test("# is a comment only at the start or after a space, so C# keeps its #", () => {
  const m = parse('# a comment\nprocessor x C# "x"  # another comment');
  assert.equal(node(m, "x").code, "C#");
  assert.equal(node(m, "x").name, "x");
});

test("%% lines are comments too", () => {
  assert.equal(parse("%% mermaid style\nprocessor a").nodes.length, 1);
});

test("names support \\n and \\\"", () => {
  const m = parse('processor a "say \\"hi\\"\\nnow"');
  assert.equal(node(m, "a").name, 'say "hi"\nnow');
});

test("ids start with a letter and use letters, digits, _ and -", () => {
  assert.deepEqual(parse("processor s3-raw_1").nodes.map((n) => n.id), ["s3-raw_1"]);
  assert.match(errorsOf("processor 1abc")[0], /not a valid id/);
});

test("a missing closing quote is an error", () => {
  assert.match(errorsOf('processor a "abc')[0], /closing quote/);
});

// --- statements ---

test("title and direction", () => {
  const m = parse('title "My pipeline"\ndirection TB\nprocessor a');
  assert.equal(m.title, "My pipeline");
  assert.equal(m.direction, "TB");
  assert.equal(parse("direction TD").direction, "TB");
  assert.match(errorsOf("direction XY")[0], /LR .* or TB/);
});

test("shapes: code, name, defaults", () => {
  const m = parse('store items S3 "items"\nstore other_s "named" D\nprocessor p\ntrigger t M\nother k KAFKA');
  assert.deepEqual([node(m, "items").code, node(m, "items").name], ["S3", "items"]);
  assert.deepEqual([node(m, "other_s").code, node(m, "other_s").name], ["D", "named"]);
  assert.equal(node(m, "p").name, "p");
  assert.equal(node(m, "t").name, "");
  assert.equal(node(m, "k").name, "");
});

test("trigger aliases", () => {
  const m = parse("trigger a manual\ntrigger b timed\ntrigger c event");
  assert.deepEqual(m.nodes.map((n) => n.code), ["M", "L", "E"]);
});

test("warnings: unknown codes, codes that are not used, extra words", () => {
  const w = warningsOf('external e X "e"\nprocessor p ZZ\nstore s S4\nprocessor q PY "q" extra');
  assert.match(w[0], /external doesn't use a code/);
  assert.match(w[1], /unknown processor code "ZZ"/);
  assert.match(w[2], /unknown store code "S4"/);
  assert.match(w[3], /extra words are ignored: extra/);
});

test("list members", () => {
  const m = parse('list w "workers": by_country, by_device, "by hour"');
  assert.deepEqual(node(m, "w").items, ["by_country", "by_device", "by hour"]);
  assert.match(errorsOf('processor p "p": a, b')[0], /only a list has members/);
});

// --- flows ---

test("chains, lists and all arrow types", () => {
  const m = parse("processor a\nprocessor b\nprocessor c\nprocessor d\na, b -> c <-> d\na -A-> d\nb -N-> d\nc -Q-> a");
  assert.deepEqual(flows(m), [
    ["a", "c", "", ""], ["b", "c", "", ""], ["c", "d", "<->", ""],
    ["a", "d", "A", ""], ["b", "d", "N", ""], ["c", "a", "Q", ""],
  ]);
});

test("flow names: after an arrow or at the end of the line", () => {
  const m = parse('processor a\nprocessor b\nprocessor c\na -> "first" b -A-> c "last"');
  assert.deepEqual(flows(m).map((f) => f[3]), ["first", "last"]);
  assert.match(errorsOf('processor a\nprocessor b\na -> "x" b "y"')[0], /already has a name/);
});

test("reversed arrows: a <- b is b -> a, in chains and notes", () => {
  const base = "processor a\nprocessor b\nprocessor c\n";
  assert.deepEqual(flows(parse(base + "a <- b")), [["b", "a", "", ""]]);
  assert.deepEqual(flows(parse(base + 'a<-A-b "nightly"')), [["b", "a", "A", "nightly"]]);
  assert.deepEqual(flows(parse(base + "a <- b -> c")), [["b", "a", "", ""], ["b", "c", "", ""]]);
  assert.deepEqual(flows(parse(base + "a, b <-Q- c")), [["c", "a", "Q", ""], ["c", "b", "Q", ""]]);
  assert.deepEqual(flows(parse(base + 'group "g": a\ngroup "g" <-N- b')), [["b", "group:g", "N", ""]]);
  assert.deepEqual(parse(base + 'b -> a\nnote a <- b "x"').edges[0].notes.map((n) => n.lines), [["x"]]);
  assert.match(errorsOf(base + "a <-A-> b")[0], /points both ways/);
});

test("flows to and from a group", () => {
  const m = parse('external crm\nprocessor a\nprocessor b\ngroup "g": a b\na -> b\ncrm -> group "g"\ngroup "g" -> crm');
  assert.deepEqual(flows(m).slice(1).map((f) => f.slice(0, 2)), [["crm", "group:g"], ["group:g", "crm"]]);
  assert.match(errorsOf('processor a\na -> group "nope"')[0], /there is no group "nope"/);
});

test("plain flows both ways suggest one synchronous flow", () => {
  const w = warningsOf("processor api\nstore db P\napi -> db\ndb -> api");
  assert.equal(w.length, 1);
  assert.match(w[0], /^4: flows go both ways between "api" and "db". For a request and its response, use one synchronous flow: api <-> db/);
  assert.deepEqual(warningsOf("processor a\nprocessor b\na -> b\nb -A-> a"), [], "a marked flow back is fine");
  assert.deepEqual(warningsOf("processor a\nprocessor b\na <-> b"), []);
});

test("the view box holds long flows routed around other shapes", () => {
  const { light } = render("trigger t E\nprocessor a\nprocessor b\nprocessor c\nstore s S3\nstore x S3\nstore y S3\nt -> a -> b -> c -> s\na -> x\nb -> y\nt -> s");
  const [, y, , h] = light.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
  const ys = [...light.matchAll(/C([-\d. ]+)/g)].flatMap((m) => m[1].trim().split(/\s+/).map(Number).filter((_, i) => i % 2 === 1));
  assert.ok(Math.max(...ys) <= y + h - 8, `a curve reaches ${Math.max(...ys)}, the image ends at ${y + h}`);
});

test("Secrets Manager and SSM are known store codes", () => {
  assert.deepEqual(warningsOf("store secrets SM\nstore params SSM"), []);
});

test("a flow to itself is a warning", () => {
  assert.match(warningsOf("processor a\na -> a")[0], /to itself is not drawn/);
});

// --- groups ---

test("group blocks nest, and a colon group inside a block is a child", () => {
  const m = parse('group "aws" {\n  group "vpc" {\n    processor a\n  }\n  store s S3\n  processor b\n  group "inner": b\n}\nprocessor c');
  assert.equal(node(m, "a").group.name, "vpc");
  assert.equal(node(m, "a").group.parent.name, "aws");
  assert.equal(node(m, "s").group.name, "aws");
  assert.equal(node(m, "b").group.name, "inner");
  assert.equal(node(m, "b").group.parent.name, "aws");
  assert.equal(node(m, "c").group, null);
});

test("group errors", () => {
  assert.match(errorsOf('group "g" {\nprocessor a')[0], /not closed/);
  assert.match(errorsOf("}")[0], /no open group/);
  assert.match(errorsOf('processor a\ngroup "g1": a\ngroup "g2": a')[0], /already in group "g1"/);
  assert.match(errorsOf("group g: a")[0], /needs a name in quotes/);
});

// --- notes ---

test("notes: inline, block, sides and on flows", () => {
  const m = parse('processor a\nprocessor b\na -> b\nnote a "one\\ntwo"\nnote left a "L"\nnote below b:\n  - x\n  - y\nnote a -> b "hourly"');
  assert.deepEqual(node(m, "a").notes.map((n) => [n.side, n.lines]), [[null, ["one", "two"]], ["left", ["L"]]]);
  assert.deepEqual(node(m, "b").notes.map((n) => [n.side, n.lines]), [["below", ["- x", "- y"]]]);
  assert.deepEqual(m.edges[0].notes.map((n) => n.lines), [["hourly"]]);
});

test("note errors", () => {
  assert.match(errorsOf('note x "y"')[0], /note on "x" is not declared/);
  assert.match(errorsOf("processor c\nnote c")[0], /needs text/);
  assert.match(errorsOf("processor c\nnote c:\nprocessor d")[0], /has no text/);
  assert.match(errorsOf('processor a\nprocessor b\nnote a -> b "x"')[0], /there is no flow a -> b/);
});

// --- errors ---

test("all errors at once, sorted, with suggestions", () => {
  const errs = errorsOf('procesor a\nprocessor b\nb -> c\nb -> \nprocessor collector\ncolector -> collector');
  assert.equal(errs.length, 4);
  assert.match(errs[0], /^1: "procesor" is not a statement. Did you mean processor\?/);
  assert.match(errs[1], /^3: "c" is not declared. Add e.g.: processor c "c"$/);
  assert.match(errs[2], /^4: a flow needs something on both sides/);
  assert.match(errs[3], /did you mean collector\?/);
  assert.throws(() => parse("procesor a"), (e) => Array.isArray(e.errors) && e.errors.length === 1);
});

// --- layout and rendering ---

const box = (n) => [n.cx - n.ext.l, n.cy - n.ext.t, n.cx + n.ext.r, n.cy + n.ext.b];
const overlap = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

test("shapes never overlap, notes included", () => {
  const src = readFileSync(join(root, "scripts/examples/clickstream.pipeline"), "utf8") + '\nnote export "m5.large\\nspot"\nnote left raw "kept 90 days"';
  const { model } = render(src);
  for (const a of model.nodes) for (const b of model.nodes) if (a !== b) assert.ok(!overlap(box(a), box(b)), `${a.id} overlaps ${b.id}`);
});

test("shapes outside a group stay out of its box", () => {
  const src = 'external shop\nother kafka KAFKA\nprocessor enrich\nstore raw S3\nprocessor audit\nstore archive S3\nshop -N-> kafka -N-> enrich -> raw\nshop -> audit -> archive\nraw -> archive\ngroup "streaming": kafka enrich raw';
  const { model } = render(src);
  const members = model.nodes.filter((n) => n.group);
  const b = members.map(box).reduce((a, c) => [Math.min(a[0], c[0]) - 16, Math.min(a[1], c[1]) - 16, Math.max(a[2], c[2]) + 16, Math.max(a[3], c[3]) + 16]);
  for (const n of model.nodes.filter((n) => !n.group)) assert.ok(!overlap(box(n), b), `${n.id} is inside the group box`);
});

test("direction: columns run left to right, or top to bottom", () => {
  const lr = render("processor a\nprocessor b\na -> b").model, tb = render("direction TB\nprocessor a\nprocessor b\na -> b").model;
  assert.ok(node(lr, "b").cx > node(lr, "a").cx && node(lr, "b").cy === node(lr, "a").cy);
  assert.ok(node(tb, "b").cy > node(tb, "a").cy && node(tb, "b").cx === node(tb, "a").cx);
});

test("render gives a light and a dark SVG with the title", () => {
  const { light, dark, warnings } = render('title "T & co"\nprocessor a PY\nnote a "x"');
  assert.match(light, /^<svg [^>]*viewBox/);
  assert.match(light, /<title>T &amp; co<\/title>/);
  assert.match(light, /#1f2328/);
  assert.match(dark, /#e6edf3/);
  assert.deepEqual(warnings, []);
});

test("an empty diagram is a valid, empty SVG", () => {
  for (const src of ["", "# only a comment\n", 'title "Empty"']) {
    const { light } = render(src);
    assert.doesNotMatch(light, /Infinity|NaN/);
    assert.match(light, /viewBox="-?\d+(\.\d+)? -?\d+(\.\d+)? \d+ \d+"/);
  }
});

// every pipeline block in the docs must parse and render without errors
test("all documented examples render", () => {
  const files = ["text-format.md", "templates.md", "install.md", "index.md", "diagrams-as-code.md", "agents.md", "browser.md", "readme.md", "integrations/agent-guide.md"];
  let count = 0;
  for (const f of files) {
    const md = readFileSync(join(root, f), "utf8");
    for (const m of md.matchAll(/^```pipeline\n([\s\S]*?)^```$/gm)) {
      assert.deepEqual(errorsOf(m[1]), [], `${f}: ${m[1].slice(0, 60)}`);
      render(m[1]);
      count++;
    }
  }
  for (const f of readdirSync(join(root, "scripts/examples"))) {
    render(readFileSync(join(root, "scripts/examples", f), "utf8"));
    count++;
  }
  assert.ok(count >= 10, `only ${count} examples found`);
});

// --- Mermaid ---

test("Mermaid, basic: shapes, groups, notes, marks", () => {
  const m = toMermaid('title "T"\ndirection TB\nprocessor end PY "e"\nstore s S3 "s"\ngroup "g": s\nend -A-> s "nightly"\nnote s "kept"');
  assert.match(m, /^---\ntitle: "T"\n---\nflowchart TB/);
  assert.match(m, /n_end@\{ shape: circle, label: "PY<br>e" \}/);
  assert.match(m, /subgraph group_1\["g"\]\n\s+s@\{ shape: div-rect, label: "S3<br>s" \}\n\s+end/);
  assert.match(m, /n_end -->\|"A: nightly"\| s/);
  assert.match(m, /note_1@\{ shape: braces, label: "kept" \}\n\s+s -.- note_1/);
});

test("Mermaid, icons: icon nodes for known codes, shapes otherwise", () => {
  const m = toMermaid("processor a PY\nstore b XX\nother k KAFKA", { icons: true });
  assert.match(m, /a@\{ icon: "pd:processor-py", label: "a", pos: "b", h: 48 \}/);
  assert.match(m, /b@\{ shape: div-rect/);
  assert.match(m, /k@\{ shape: rect, label: "KAFKA" \}/);
  const pack = iconPack();
  assert.equal(pack.prefix, "pd");
  for (const name of ["processor", "processor-py", "processor-csharp", "lambda-js", "store-s3", "trigger-l", "external", "app", "human", "list"])
    assert.ok(pack.icons[name], name);
});

// --- integrations ---

test("HTML helper, markdown-it and remark plugins", () => {
  assert.match(diagramHtml("processor a"), /^<picture class="pipeline-diagram"><source srcset="data:image\/svg\+xml,/);
  assert.match(diagramHtml("procesor a"), /^<pre class="pipeline-error">line 1/);
  const md = { renderer: { rules: { fence: () => "<pre>code</pre>" } } };
  markdownItPlugin(md);
  assert.match(md.renderer.rules.fence([{ info: "pipeline", content: "processor a" }], 0), /<picture/);
  assert.equal(md.renderer.rules.fence([{ info: "js", content: "x" }], 0), "<pre>code</pre>");
  const tree = { type: "root", children: [{ type: "code", lang: "pipeline", value: "processor a" }, { type: "code", lang: "js", value: "x" }] };
  remarkPlugin()(tree);
  assert.equal(tree.children[0].type, "html");
  assert.equal(tree.children[1].type, "code");
});

test("the browser bundle exposes the API", () => {
  const window = {};
  vm.runInNewContext(readFileSync(join(root, "assets/js/pipeline-diagrams.js"), "utf8"), { window, URL, encodeURIComponent });
  const P = window.PipelineDiagrams;
  for (const k of ["parse", "check", "render", "toMermaid", "iconPack", "renderAll"]) assert.equal(typeof P[k], "function", k);
  assert.match(P.render("processor a").light, /<svg/);
});

// --- command line ---

const cli = (args, input) => spawnSync(process.execPath, [join(root, "scripts/render-pipeline.mjs"), ...args], { input, encoding: "utf8" });

test("command line: check, Mermaid, stdin", () => {
  assert.equal(cli(["-", "--check"], "processor a").status, 0);
  const bad = cli(["-", "--check"], "procesor a");
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /stdin:1: error: "procesor" is not a statement/);
  assert.match(cli(["-", "--mermaid"], "processor a PY").stdout, /a@\{ shape: circle/);
  assert.match(cli(["-"], "processor a").stdout, /^<svg/);
});

test("Markdown renderer: inserts pictures, updates in place, checks, Mermaid", () => {
  const dir = mkdtempSync(join(tmpdir(), "pd-md-"));
  const file = join(dir, "doc.md");
  writeFileSync(file, "# Doc\n\n```pipeline\nprocessor a\nprocessor b\na -> b\n```\n\nText.\n");
  const run = (...args) => spawnSync(process.execPath, [join(root, "scripts/render-markdown.mjs"), ...args], { cwd: dir, encoding: "utf8" });
  assert.equal(run("doc.md").status, 0);
  const once = readFileSync(file, "utf8");
  assert.match(once, /<!-- pipeline-diagrams:begin -->\n<picture><source srcset="diagrams\/doc-[0-9a-f]{8}-dark.svg"/);
  assert.equal(readdirSync(join(dir, "diagrams")).length, 2);
  assert.equal(run("doc.md").status, 0);
  assert.equal(readFileSync(file, "utf8"), once, "running twice changes nothing");
  assert.equal(run("doc.md", "--check").status, 0);
  writeFileSync(file, once.replace("a -> b", "b -> a"));
  assert.equal(run("doc.md", "--check").status, 1);
  assert.equal(run("doc.md").status, 0);
  assert.equal(readdirSync(join(dir, "diagrams")).length, 2, "old SVG files are removed");
  assert.equal(run("doc.md", "--mermaid").status, 0);
  assert.match(readFileSync(file, "utf8"), /<!-- pipeline-diagrams:begin -->\n```mermaid\nflowchart LR/);
  writeFileSync(file, "```pipeline\nprocesor a\n```\n");
  const bad = run("doc.md");
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /doc.md:2: "procesor"/);
});

// --- MCP server ---

test("MCP server: initialize, list and call tools", async () => {
  const child = spawn(process.execPath, [join(root, "integrations/mcp/server.mjs")]);
  const replies = new Map();
  let buf = "";
  child.stdout.on("data", (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) { const msg = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1); replies.set(msg.id, msg); }
  });
  const send = (id, method, params) => child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  send(1, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } });
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  send(2, "tools/list");
  send(3, "tools/call", { name: "render_pipeline", arguments: { source: "processor a\nnote a \"x\"" } });
  send(4, "tools/call", { name: "check_pipeline", arguments: { source: "procesor a" } });
  send(5, "tools/call", { name: "pipeline_to_mermaid", arguments: { source: "processor a" } });
  send(6, "tools/call", { name: "pipeline_guide", arguments: {} });
  send(7, "nope");
  for (let t = 0; t < 100 && replies.size < 7; t++) await new Promise((r) => setTimeout(r, 30));
  child.kill();
  assert.equal(replies.get(1).result.serverInfo.name, "pipeline-diagrams");
  assert.deepEqual(replies.get(2).result.tools.map((t) => t.name), ["render_pipeline", "check_pipeline", "pipeline_to_mermaid", "pipeline_guide"]);
  assert.match(replies.get(3).result.content[0].text, /^<svg/);
  assert.equal(replies.get(4).result.isError, true);
  assert.match(replies.get(4).result.content[0].text, /line 1: "procesor"/);
  assert.match(replies.get(5).result.content[0].text, /flowchart LR/);
  assert.match(replies.get(6).result.content[0].text, /# Pipeline Diagrams/);
  assert.equal(replies.get(7).error.code, -32601);
});

test("the offline viewer holds the renderer and loads nothing from outside", () => {
  const html = readFileSync(join(root, "downloads/pipeline-diagrams-viewer.html"), "utf8");
  assert.ok(html.includes(readFileSync(join(root, "assets/js/pipeline-diagrams.js"), "utf8")), "the bundle is inlined and up to date");
  assert.doesNotMatch(html, /<(script|link|img|iframe)[^>]+(src|href)=/i, "no external scripts, styles, images or frames");
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.equal(scripts.length, 2);
  for (const js of scripts) new vm.Script(js); // both parse
});

test("generated files are up to date", () => {
  const bundle = readFileSync(join(root, "assets/js/pipeline-diagrams.js"), "utf8");
  for (const f of ["shapes.mjs", "pipeline-dsl.mjs", "pipeline-mermaid.mjs", "pipeline-browser.mjs"]) {
    const body = readFileSync(join(root, "scripts", f), "utf8").replace(/^import[^;]+;\n/gm, "").replace(/^export /gm, "");
    assert.ok(bundle.includes(body), `assets/js/pipeline-diagrams.js is out of date (${f}); run node scripts/templates.mjs downloads`);
  }
  assert.ok(existsSync(join(root, "integrations/claude-skill/pipeline-diagrams/SKILL.md")));
});
