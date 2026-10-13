// Generates the downloadable templates from the shared shape definitions:
//   - an icon pack (plain SVGs, for PowerPoint, Keynote, Miro, Lucidchart, ...)
//   - an Excalidraw library (.excalidrawlib)
//   - a draw.io / diagrams.net shape library (.xml)
//   - assets/js/pipeline-diagrams.js, the text renderer for the browser, and the
//     same code as an Obsidian plugin (integrations/obsidian/main.js)
//   - the "pd" icon pack for Mermaid, and the agent guide as a download and as a
//     Claude skill (integrations/claude-skill/)
// Usage: node scripts/templates.mjs downloads
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { deflateRawSync, crc32 } from "node:zlib";
import { THEMES, f, processor, store, trigger, flow, other, external, app, human, MARKS } from "./shapes.mjs";
import { iconPack } from "./pipeline-mermaid.mjs";

const out = process.argv[2] || "downloads";
mkdirSync(out, { recursive: true });

// --- the catalog ---------------------------------------------------------------
// One entry per shape in the notation. Every output below is generated from
// this list, so adding a shape here adds it everywhere.

const CATALOG = [
  { id: "processor", title: "Processor", kind: "processor" },
  { id: "processor-lambda", title: "Lambda processor", kind: "processor", lambda: true },
  { id: "data-store", title: "Data store", kind: "store" },
  { id: "trigger", title: "Trigger", kind: "trigger" },
  { id: "trigger-manual", title: "Manual trigger", kind: "trigger", code: "M" },
  { id: "trigger-timed", title: "Timed trigger", kind: "trigger", code: "L" },
  { id: "trigger-event", title: "Event trigger", kind: "trigger", code: "E" },
  { id: "flow", title: "Flow", kind: "flow" },
  { id: "flow-sync", title: "Synchronous flow", kind: "flow", both: true },
  { id: "flow-async", title: "Asynchronous flow", kind: "flow", mark: "A" },
  { id: "flow-streaming", title: "Streaming flow", kind: "flow", mark: "N" },
  { id: "flow-queued", title: "Queued flow", kind: "flow", mark: "Q" },
  { id: "other", title: "Other system", kind: "other" },
  { id: "external", title: "External system", kind: "external" },
  { id: "user-facing-app", title: "User facing app", kind: "app" },
  { id: "human", title: "Human", kind: "human" },
  { id: "annotation", title: "Annotation", kind: "annotation" },
  { id: "list", title: "List of processors", kind: "list" },
  { id: "grouping", title: "Grouping", kind: "group" },
];

// Placeholder text used in the editable libraries. Letter codes and names are
// meant to be overwritten by the user.
const NAME = { processor: "name", store: "name", external: "name", other: "name", app: "name", human: "name" };

// --- icon pack -----------------------------------------------------------------
// Clean SVGs without names: the shape only. Colors are inline attributes, not
// CSS, because PowerPoint's "Convert to Shape", Keynote and Miro handle those
// best. Letters on triggers are drawn as strokes, so they don't depend on fonts.

const LETTERS = {
  M: "M-6 7V-7L0 2L6 -7V7",
  L: "M-4 -7V7H5",
  E: "M5 -7H-5V7H5M-5 0H3",
};

function iconBody(e) {
  switch (e.kind) {
    case "processor":
      return [64, 64, processor(32, 32, { r: 28, lambda: e.lambda })];
    case "store":
      return [56, 64, store(28, 2, { w: 52, h: 60 })];
    case "trigger": {
      let s = trigger(34, 2, { w: 64, h: 64 });
      if (e.code) s += `<path class="s" transform="translate(34 46)" d="${LETTERS[e.code]}"/>`;
      return [68, 68, s];
    }
    case "flow":
      return [128, 24, flow(4, 12, 124, 12, e)];
    case "other":
      return [112, 64, other(56, 2, { w: 108, h: 60 })];
    case "external":
      return [64, 64, external(32, 2)];
    case "app":
      return [64, 64, app(32, 2)];
    case "human":
      return [64, 68, human(32, 3)];
    case "annotation":
      return [124, 74, `<path class="s" d="M11 2H2V72H11M113 2H122V72H113"/>`];
    case "list":
      return [108, 52, [26, 44, 62, 80].map((x) => processor(x, 26, { r: 24, fill: true })).join("")];
    case "group":
      return [160, 100, `<rect class="s d" x="2" y="2" width="156" height="96" rx="2"/>`];
  }
}

// replace the CSS classes used by shapes.mjs with presentation attributes
function inline(body, c) {
  const stroke = `fill="none" stroke="${c.ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"`;
  return body
    .replace(/ class="s d"/g, ` ${stroke} stroke-dasharray="7 5"`)
    .replace(/ class="s"/g, ` ${stroke}`)
    .replace(/ class="h"/g, ` fill="${c.ink}"`)
    .replace(/ class="bg"/g, ` fill="${c.bg}"`)
    .replace(/ class="x"/g, ` fill="${c.fill}" stroke="${c.ink}" stroke-width="1.6"`);
}

const SCALE = 2; // icons are drawn at twice the size of the site diagrams
const ICON_SETS = { "dark-lines": THEMES[""], "light-lines": THEMES["-dark"] };
const zipFiles = [];

rmSync(join(out, "icons"), { recursive: true, force: true });
for (const [set, colors] of Object.entries(ICON_SETS)) {
  mkdirSync(join(out, "icons", set), { recursive: true });
  for (const e of CATALOG) {
    const [w, h, body] = iconBody(e);
    const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * SCALE}" height="${h * SCALE}" viewBox="0 0 ${w} ${h}">
<title>${e.title}</title>
${inline(body, colors)}
</svg>
`;
    writeFileSync(join(out, "icons", set, `${e.id}.svg`), doc);
    zipFiles.push([`pipeline-diagrams-icons/${set}/${e.id}.svg`, doc]);
  }
}
zipFiles.push([
  "pipeline-diagrams-icons/README.txt",
  `Pipeline Diagrams icon pack - https://pipeline-diagrams.com/templates.html

dark-lines/   icons for light backgrounds
light-lines/  icons for dark backgrounds

PowerPoint: Insert > Pictures, then right click > Convert to Shape to edit
lines and colors. Add letter codes and names as text boxes.
Keynote: drag the SVG in. Miro: upload as custom shapes (paid plans) or as
images. Lucidchart: Shapes > Import SVG.
`,
]);
writeFileSync(join(out, "pipeline-diagrams-icons.zip"), zip(zipFiles));

// --- Excalidraw library ---------------------------------------------------------
// Native Excalidraw elements (not images), so everything stays editable: letter
// codes are text bound to the shape, names are separate text elements, and
// arrows drawn later bind to the shapes. Each item is one group.

// deterministic ids and seeds, so regenerating gives the same file
function hash(s) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
  return h;
}
const B62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const eid = (s) => {
  let n = hash(s), m = hash(s + "#"), r = "";
  for (let i = 0; i < 10; i++) (r += B62[n % 62]), (n = Math.floor(n / 62) || m), (m = hash(r));
  return r;
};

// turn a simple SVG path (M, L, H and V only, absolute) into lists of points
function markStrokes(d) {
  const strokes = [];
  for (const [cmd, ...n] of d.match(/[MLHV][^MLHV]*/g).map((s) => [s[0], ...s.slice(1).trim().split(/[\s,]+/).map(Number)])) {
    const cur = strokes.at(-1), [px, py] = cur ? cur.at(-1) : [0, 0];
    if (cmd === "M") strokes.push([[n[0], n[1]]]);
    else cur.push(cmd === "L" ? [n[0], n[1]] : cmd === "H" ? [n[0], py] : [px, n[0]]);
  }
  return strokes;
}

const INK = "#1e1e1e", GREY = "#ced4da";
const CREATED = 1791763200000; // fixed, so the file doesn't change on every run

function excalidrawItem(e) {
  const els = [];
  const group = eid(e.id + ":group");
  const base = (type, key, x, y, w, h, extra = {}) => {
    const el = {
      id: eid(`${e.id}:${key}`), type, x: f(x), y: f(y), width: f(w), height: f(h), angle: 0,
      strokeColor: INK, backgroundColor: "transparent", fillStyle: "solid", strokeWidth: 2,
      strokeStyle: "solid", roughness: 1, opacity: 100, groupIds: [group], frameId: null,
      roundness: null, seed: hash(`${e.id}:${key}:seed`) % 2 ** 31, version: 1,
      versionNonce: hash(`${e.id}:${key}:nonce`) % 2 ** 31, isDeleted: false, boundElements: [],
      updated: CREATED, link: null, locked: false, ...extra,
    };
    els.push(el);
    return el;
  };
  const text = (key, x, y, str, { size = 16, container, align = "center" } = {}) => {
    const lines = str.split("\n");
    const w = Math.max(...lines.map((l) => l.length)) * size * 0.55, h = lines.length * size * 1.25;
    const el = base("text", key, align === "center" ? x - w / 2 : x, y, w, h, {
      text: str, originalText: str, fontSize: size, fontFamily: 5, textAlign: align,
      verticalAlign: container ? "middle" : "top", containerId: container ? container.id : null,
      autoResize: true, lineHeight: 1.25,
    });
    if (container) {
      container.boundElements.push({ type: "text", id: el.id });
      el.y = f(container.y + container.height / 2 - h / 2);
    }
    return el;
  };
  const line = (key, pts, extra = {}) => {
    const [x0, y0] = pts[0];
    const rel = pts.map(([x, y]) => [f(x - x0), f(y - y0)]);
    const xs = rel.map((p) => p[0]), ys = rel.map((p) => p[1]);
    return base("line", key, x0, y0, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), {
      points: rel, startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: null,
      lastCommittedPoint: null, ...extra,
    });
  };
  const name = (x, y) => text("name", x, y, NAME[e.kind] || "name", { size: 16 });

  switch (e.kind) {
    case "processor": {
      const c = base("ellipse", "shape", 0, 0, 60, 60, { roundness: { type: 2 } });
      if (e.lambda) {
        const d = 30 * 0.707;
        line("l1", [[30 - d, 30 - d], [30 + d, 30 + d]]);
        line("l2", [[30, 30], [30 - d, 30 + d]]);
      } else text("code", 30, 0, "P", { size: 20, container: c });
      name(30, 68);
      break;
    }
    case "store": {
      const r = base("rectangle", "shape", 0, 0, 52, 60);
      line("bar", [[0, 12], [52, 12]]);
      text("code", 26, 0, "S3", { size: 20, container: r });
      name(26, 68);
      break;
    }
    case "trigger":
      line("shape", [[32, 0], [64, 60], [0, 60], [32, 0]], { polygon: true });
      if (e.code) text("code", 32, 30, e.code, { size: 20 });
      text("name", 32, 68, "name", { size: 16 });
      break;
    case "flow":
      base("arrow", "shape", 0, 0, 160, 0, {
        points: [[0, 0], [160, 0]], startBinding: null, endBinding: null, lastCommittedPoint: null,
        startArrowhead: e.both ? "triangle" : null, endArrowhead: "triangle", roundness: { type: 2 },
      });
      // the A, N or tick is drawn on the middle of the line, like on a whiteboard
      if (e.mark) markStrokes(MARKS[e.mark]).forEach((s, i) => line(`mark${i}`, s.map(([x, y]) => [80 + x * 1.4, y * 1.4])));
      break;
    case "other": {
      const r = base("rectangle", "shape", 0, 0, 120, 60);
      text("code", 60, 0, "NAME", { size: 20, container: r });
      break;
    }
    case "external":
      base("rectangle", "shape", 0, 0, 60, 60, { backgroundColor: GREY, fillStyle: "solid" });
      name(30, 68);
      break;
    case "app":
      base("rectangle", "shape", 0, 0, 60, 60);
      line("x1", [[0, 0], [60, 60]]);
      line("x2", [[60, 0], [0, 60]]);
      name(30, 68);
      break;
    case "human":
      base("ellipse", "shape", 15, 0, 30, 30, { roundness: { type: 2 } });
      line("body", [[2, 62], [2, 52], [10, 40], [30, 35], [50, 40], [58, 52], [58, 62], [2, 62]], { polygon: true, roundness: { type: 2 } });
      name(30, 70);
      break;
    case "annotation":
      line("left", [[10, 0], [0, 0], [0, 80], [10, 80]]);
      line("right", [[190, 0], [200, 0], [200, 80], [190, 80]]);
      text("text", 14, 10, "- m4.xlarge\n- min: 0\n- max: 10", { size: 16, align: "left" });
      break;
    case "list":
      [0, 18, 36, 54].forEach((x, i) =>
        base("ellipse", `c${i}`, x, 0, 48, 48, { backgroundColor: "#ffffff", fillStyle: "solid", roundness: { type: 2 } }));
      break;
    case "group":
      base("rectangle", "shape", 0, 0, 300, 160, { strokeStyle: "dashed" });
      text("label", 300, -26, "group name", { size: 16 }).x = f(300 - 10 * 16 * 0.55);
      break;
  }
  return { id: eid(e.id), status: "unpublished", created: CREATED, name: e.title, elements: els };
}

const excalidrawlib = {
  type: "excalidrawlib",
  version: 2,
  source: "https://pipeline-diagrams.com",
  libraryItems: CATALOG.map(excalidrawItem),
};
writeFileSync(join(out, "pipeline-diagrams.excalidrawlib"), JSON.stringify(excalidrawlib, null, 2) + "\n");

// --- draw.io library ------------------------------------------------------------
// Native draw.io cells, so letter codes and names are editable text and arrows
// stay attached. Shapes draw.io doesn't have are inline stencils. Colors are
// left to the theme, so the shapes also work in dark mode.

const xesc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// draw.io stencils are stored as deflated, URI-encoded, base64 XML
const stencil = (xml) => `shape=stencil(${deflateRawSync(encodeURIComponent(xml)).toString("base64")})`;

const STENCILS = {
  store: stencil(`<shape w="52" h="60" aspect="variable" strokewidth="inherit"><background><rect x="0" y="0" w="52" h="60"/></background><foreground><fillstroke/><path><move x="0" y="12"/><line x="52" y="12"/></path><stroke/></foreground></shape>`),
  lambda: stencil(`<shape w="60" h="60" aspect="fixed" strokewidth="inherit"><background><ellipse x="0" y="0" w="60" h="60"/></background><foreground><fillstroke/><path><move x="8.79" y="8.79"/><line x="51.21" y="51.21"/><move x="30" y="30"/><line x="8.79" y="51.21"/></path><stroke/></foreground></shape>`),
  app: stencil(`<shape w="60" h="60" aspect="variable" strokewidth="inherit"><background><rect x="0" y="0" w="60" h="60"/></background><foreground><fillstroke/><path><move x="0" y="0"/><line x="60" y="60"/><move x="60" y="0"/><line x="0" y="60"/></path><stroke/></foreground></shape>`),
  human: stencil(`<shape w="56" h="62" aspect="fixed" strokewidth="inherit"><background><ellipse x="13" y="0" w="30" h="30"/></background><foreground><fillstroke/><path><move x="0" y="62"/><line x="0" y="50"/><arc rx="28" ry="22" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="56" y="50"/><line x="56" y="62"/><close/></path><fillstroke/></foreground></shape>`),
  list: stencil(`<shape w="102" h="48" aspect="fixed" strokewidth="inherit"><background><ellipse x="0" y="0" w="48" h="48"/></background><foreground><fillstroke/><ellipse x="18" y="0" w="48" h="48"/><fillstroke/><ellipse x="36" y="0" w="48" h="48"/><fillstroke/><ellipse x="54" y="0" w="48" h="48"/><fillstroke/></foreground></shape>`),
};

const COMMON = "html=1;whiteSpace=wrap;strokeWidth=1.5;fontSize=15;fontStyle=1;";
const NAME_STYLE = "text;html=1;whiteSpace=wrap;align=center;verticalAlign=top;fontSize=12;strokeColor=none;fillColor=none;connectable=0;";

function drawioEntry(e) {
  const cells = [];
  const v = (id, value, style, x, y, w, h, parent = 1) =>
    cells.push(`<mxCell id="${id}" value="${xesc(value)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
  // the shape is cell 2; its name is a child text cell below it, so it moves along
  const shape = (value, style, sw, sh, ew, name = "name") => {
    const x = (ew - sw) / 2;
    v(2, value, style, x, 0, sw, sh);
    if (name) v(3, name, NAME_STYLE, -x, sh + 2, ew, 20, 2);
    return [ew, sh + 22];
  };
  let size;
  switch (e.kind) {
    case "processor":
      size = e.lambda
        ? shape("", `${STENCILS.lambda};perimeter=ellipsePerimeter;${COMMON}`, 60, 60, 100)
        : shape("P", `ellipse;aspect=fixed;${COMMON}`, 60, 60, 100);
      break;
    case "store":
      size = shape("S3", `${STENCILS.store};${COMMON}spacingTop=12;`, 52, 60, 100);
      break;
    case "trigger":
      size = shape(e.code || "", `triangle;direction=north;${COMMON}verticalAlign=bottom;spacingBottom=2;`, 64, 60, 100);
      break;
    case "other":
      size = shape("NAME", `rounded=0;${COMMON}`, 120, 60, 120, "");
      break;
    case "external":
      size = shape("", `rounded=0;fillColor=#d0d7de;${COMMON}`, 60, 60, 100);
      break;
    case "app":
      size = shape("", `${STENCILS.app};${COMMON}`, 60, 60, 100);
      break;
    case "human":
      size = shape("", `${STENCILS.human};${COMMON}`, 56, 62, 100);
      break;
    case "list":
      size = shape("", `${STENCILS.list};${COMMON}`, 102, 48, 102, "");
      break;
    case "annotation":
      v(2, "- m4.xlarge<br>- min: 0<br>- max: 10", `shape=partialRectangle;top=0;bottom=0;fillColor=none;html=1;whiteSpace=wrap;strokeWidth=1.5;align=left;verticalAlign=top;spacingLeft=10;spacingTop=6;fontSize=12;`, 0, 0, 160, 70);
      size = [160, 70];
      break;
    case "group":
      v(2, "group name", `rounded=0;dashed=1;dashPattern=7 5;fillColor=none;container=1;collapsible=0;html=1;strokeWidth=1.5;labelPosition=center;verticalLabelPosition=top;align=right;verticalAlign=bottom;fontStyle=1;fontSize=12;`, 0, 20, 240, 140);
      size = [240, 160];
      break;
    case "flow": {
      const ends = `endArrow=block;endFill=1;endSize=8;${e.both ? "startArrow=block;startFill=1;startSize=8;" : "startArrow=none;"}`;
      // the A, N or tick sits on the middle of the line as an edge label
      const mark = { A: "A", N: "N", Q: "|" }[e.mark] || "";
      cells.push(`<mxCell id="2" value="${mark}" style="${ends}html=1;rounded=0;strokeWidth=1.5;fontSize=${e.mark === "Q" ? 22 : 16};labelBackgroundColor=none;" edge="1" parent="1"><mxGeometry width="160" height="20" relative="1" as="geometry"><mxPoint x="0" y="10" as="sourcePoint"/><mxPoint x="160" y="10" as="targetPoint"/></mxGeometry></mxCell>`);
      size = [160, 20];
      break;
    }
  }
  const xml = `<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells.join("")}</root></mxGraphModel>`;
  return { xml, w: size[0], h: size[1], aspect: "fixed", title: e.title };
}

const drawio = CATALOG.map(drawioEntry);
// the JSON is the text content of <mxlibrary>, so it is XML-escaped (draw.io
// does the same when it saves an uncompressed library)
const textEsc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
writeFileSync(join(out, "pipeline-diagrams.drawio.xml"), `<mxlibrary>${textEsc(JSON.stringify(drawio, null, 2))}</mxlibrary>\n`);

// --- browser bundle of the text renderer ------------------------------------------
// The modules are plain ES modules; strip the import/export lines and wrap them in
// one classic script, so pages need no build step and no module MIME types.
// Exposes window.PipelineDiagrams and the <pipeline-diagram> element. The same
// code, wrapped differently, is the Obsidian plugin.

{
  const here = new URL(".", import.meta.url);
  const src = ["shapes.mjs", "pipeline-dsl.mjs", "pipeline-mermaid.mjs", "pipeline-browser.mjs"]
    .map((file) => readFileSync(new URL(file, here), "utf8"))
    .join("\n")
    .replace(/^import[^;]+;\n/gm, "")
    .replace(/^export /gm, "");
  const api = "{ VERSION, KINDS, CODES, parse, check, layout, render, toMermaid, iconPack, renderAll }";
  const bundle = `// Generated by scripts/templates.mjs from scripts/shapes.mjs, pipeline-dsl.mjs,
// pipeline-mermaid.mjs and pipeline-browser.mjs. Do not edit.
(function () {
${src}
window.PipelineDiagrams = ${api};
})();
`;
  const dir = new URL("../assets/js/", here);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL("pipeline-diagrams.js", dir), bundle);

  const plugin = `// Pipeline Diagrams for Obsidian. Generated by scripts/templates.mjs. Do not edit.
const { Plugin } = require("obsidian");
${bundle}
module.exports = class PipelineDiagramsPlugin extends Plugin {
  onload() {
    this.registerMarkdownCodeBlockProcessor("pipeline", (source, el) => {
      const d = document.createElement("pipeline-diagram");
      d.source = source;
      el.appendChild(d);
    });
    // Obsidian switches themes with a class on <body>; redraw when it does
    this.registerEvent(this.app.workspace.on("css-change", () => {
      document.querySelectorAll("pipeline-diagram").forEach((d) => d.update());
    }));
  }
};
`;
  writeFileSync(new URL("../integrations/obsidian/main.js", here), plugin);

  // the icon pack for Mermaid's icon nodes (toMermaid with icons: true)
  writeFileSync(join(out, "pipeline-diagrams-icons.json"), JSON.stringify(iconPack(), null, 2) + "\n");

  // the agent guide, as a download and as a Claude skill
  const guide = readFileSync(new URL("../integrations/agent-guide.md", here), "utf8");
  writeFileSync(join(out, "pipeline-diagrams-agent-guide.md"), guide);
  const skillDir = new URL("../integrations/claude-skill/pipeline-diagrams/", here);
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(new URL("SKILL.md", skillDir), `---
name: pipeline-diagrams
description: Draw data pipeline diagrams (processors, data stores, triggers, flows, groups) with the Pipeline Diagrams text format in a \`\`\`pipeline code block. Use when asked to draw, sketch, model or explain a data pipeline, ETL job, event stream or data flow between systems.
---

${guide}`);
}

// --- a minimal zip writer (stored, no compression) ------------------------------
// Fixed timestamps keep the archive byte-for-byte reproducible.

function zip(files) {
  const local = [], central = [];
  let offset = 0;
  for (const [name, content] of files) {
    const data = Buffer.from(content), fname = Buffer.from(name), crc = crc32(data);
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(10, 4); h.writeUInt16LE(0x0800, 6);
    h.writeUInt16LE(0, 8); h.writeUInt16LE(0, 10); h.writeUInt16LE(0x21, 12);
    h.writeUInt32LE(crc, 14); h.writeUInt32LE(data.length, 18); h.writeUInt32LE(data.length, 22);
    h.writeUInt16LE(fname.length, 26); h.writeUInt16LE(0, 28);
    local.push(h, fname, data);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(10, 6); c.writeUInt16LE(0x0800, 8);
    c.writeUInt16LE(0, 10); c.writeUInt16LE(0, 12); c.writeUInt16LE(0x21, 14);
    c.writeUInt32LE(crc, 16); c.writeUInt32LE(data.length, 20); c.writeUInt32LE(data.length, 24);
    c.writeUInt16LE(fname.length, 28); c.writeUInt32LE(offset, 42);
    central.push(c, fname);
    offset += 30 + fname.length + data.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cd, end]);
}

console.log(`ok: ${CATALOG.length} shapes`);
