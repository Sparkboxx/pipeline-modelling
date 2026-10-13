// Pipeline Diagrams as text: a tiny line-based language, an automatic
// left-to-right layout and an SVG renderer that uses the shared shapes.
// No Node APIs here, so the same code runs in the browser (see templates.mjs,
// which bundles it into assets/js/pipeline-diagrams.js).
//
//   trigger report M "create report"     kind id [CODE] ["name"]
//   store items S3 "items"
//   processor collector "data collector"
//   lambda resize PY "resize"
//   report -> collector                  flows: ->  <->  -A->  -N->  -Q->
//   items, stats -> collector -> reports chains and lists
//   collector -A-> reports "nightly"     optional flow name
//   group "reporting pipeline": collector reports
//   note collector "m4.xlarge\nmin: 0"     annotation, or as a block:
//   note collector:
//     - m4.xlarge
//     - min: 0
import { THEMES, style, f, esc, label, bracket, processor, store, trigger, flow, other, external, app, human } from "./shapes.mjs";

export const KINDS = ["processor", "lambda", "store", "trigger", "other", "external", "app", "human", "list"];
const ARROWS = { "->": {}, "<->": { both: true }, "-A->": { mark: "A" }, "-N->": { mark: "N" }, "-Q->": { mark: "Q" } };

// --- parser ------------------------------------------------------------------------

export function parse(src) {
  const nodes = new Map(), edges = [], groups = [], notes = [];
  let title = "Pipeline diagram";
  let block = null; // the note whose indented lines we are reading
  const fail = (n, msg) => { throw new Error(`line ${n}: ${msg}`); };
  src.split("\n").forEach((raw, i) => {
    const n = i + 1;
    // strip comments outside quotes
    const line = raw.replace(/("[^"]*")|#.*$/g, (m, q) => q || "").trim();
    if (block && /^\s/.test(raw) && line) { block.lines.push(line); return; }
    if (block && !block.lines.length) fail(block.line, `note ${block.target} has no text. Indent the lines below it, or use: note ${block.target} "text"`);
    block = null;
    if (!line) return;
    const tokens = line.match(/"[^"]*"|<->|-[ANQ]->|->|,|:|[^\s,:"]+/g);
    const unq = (t) => t.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
    const head = tokens[0];

    if (head === "title") { title = unq(tokens[1] || ""); return; }
    if (head === "note") {
      const target = tokens[1];
      if (!target || /^"/.test(target)) fail(n, 'note needs the id of a shape: note collector "text"');
      const text = tokens.slice(2).find((t) => /^"/.test(t));
      const note = { target, lines: text ? unq(text).split("\n") : [], line: n };
      notes.push(note);
      if (!text) {
        if (tokens[2] !== ":") fail(n, `note ${target} needs text: note ${target} "text", or end the line with ":" and indent the lines below it`);
        block = note;
      }
      return;
    }
    if (head === "group") {
      if (!/^"/.test(tokens[1] || "")) fail(n, 'group needs a quoted name: group "name": a b c');
      const members = tokens.slice(2).filter((t) => t !== ":" && t !== ",");
      groups.push({ name: unq(tokens[1]), members, line: n });
      return;
    }
    if (KINDS.includes(head)) {
      const [, id, ...rest] = tokens;
      if (!id || /^"/.test(id)) fail(n, `${head} needs an id, e.g. ${head} my_${head} "my ${head}"`);
      if (nodes.has(id)) fail(n, `"${id}" is declared twice`);
      const code = rest.find((t) => !/^"/.test(t));
      const name = rest.find((t) => /^"/.test(t));
      nodes.set(id, { id, kind: head, code, name: name ? unq(name) : head === "other" || head === "trigger" ? "" : id, line: n });
      return;
    }
    // flows: a, b -> c -A-> d "name"
    const opIdx = tokens.findIndex((t) => t in ARROWS);
    if (opIdx < 0) fail(n, `can't read "${line}". Expected a declaration (${KINDS.join(", ")}), a flow (a -> b), group or title`);
    let name = "";
    if (/^"/.test(tokens.at(-1))) name = unq(tokens.pop());
    const parts = [[]], ops = [];
    for (const t of tokens) {
      if (t in ARROWS) { ops.push(ARROWS[t]); parts.push([]); }
      else if (t !== ",") parts.at(-1).push(t);
    }
    if (parts.some((p) => !p.length)) fail(n, "a flow needs something on both sides of the arrow");
    ops.forEach((op, k) => {
      for (const a of parts[k]) for (const b of parts[k + 1])
        edges.push({ from: a, to: b, ...op, name: k === ops.length - 1 ? name : "", line: n });
    });
  });
  if (block && !block.lines.length) fail(block.line, `note ${block.target} has no text. Indent the lines below it, or use: note ${block.target} "text"`);
  for (const e of edges)
    for (const id of [e.from, e.to])
      if (!nodes.has(id)) fail(e.line, `"${id}" is not declared. Add e.g.: processor ${id} "${id}"`);
  for (const g of groups)
    for (const id of g.members) if (!nodes.has(id)) fail(g.line, `group member "${id}" is not declared`);
  for (const nt of notes) {
    if (!nodes.has(nt.target)) fail(nt.line, `note on "${nt.target}", which is not declared`);
    (nodes.get(nt.target).notes ||= []).push(nt.lines);
  }
  return { title, nodes: [...nodes.values()], edges, groups };
}

// --- sizes -------------------------------------------------------------------------

const NOTE_DX = 18, NOTE_GAP = 12;
const textWidth = (s) => Math.max(0, ...String(s).split("\n").map((l) => l.length * 7));

function size(nd) {
  const [w, h] = {
    processor: [56, 56], lambda: [56, 56], store: [52, 60], trigger: [64, 60],
    other: [Math.max(108, textWidth(nd.code || "") * 1.3 + 28), 60],
    external: [60, 60], app: [60, 60], human: [56, 62], list: [94, 40],
  }[nd.kind];
  const lines = nd.name ? nd.name.split("\n").length : 0;
  const below = lines ? 8 + lines * 15 : 0; // room for the name under the shape
  // notes stack above the shape, starting a little right of its centre
  const notes = (nd.notes || []).map((ls) => ({ lines: ls, w: Math.max(80, textWidth(ls.join("\n")) * 1.05 + 32), h: ls.length * 19 + 15 }));
  const above = notes.reduce((sum, nt) => sum + nt.h + NOTE_GAP, 0);
  const half = Math.max(w, textWidth(nd.name || "")) / 2;
  return { w, h, below, above, notes, left: half, right: Math.max(half, ...notes.map((nt) => NOTE_DX + nt.w)) };
}

// --- layout ------------------------------------------------------------------------
// Layered, left to right: rank by longest path, order by barycenter, then nudge
// nodes toward their neighbours so straight chains become straight lines.

export function layout(model) {
  const { nodes, edges } = model;
  const by = new Map(nodes.map((nd, i) => [nd.id, Object.assign(nd, size(nd), { i })]));
  const out = new Map(nodes.map((nd) => [nd.id, []])), inc = new Map(nodes.map((nd) => [nd.id, []]));

  // drop edges that close a cycle, for ranking only
  const state = new Map(), dag = [];
  const visit = (id) => {
    state.set(id, 1);
    for (const e of edges.filter((e) => e.from === id)) {
      if (state.get(e.to) === 1) continue;
      dag.push(e);
      if (!state.get(e.to)) visit(e.to);
    }
    state.set(id, 2);
  };
  nodes.forEach((nd) => state.get(nd.id) || visit(nd.id));
  for (const e of dag) if (e.from !== e.to) out.get(e.from).push(e.to), inc.get(e.to).push(e.from);

  const rank = new Map();
  const rk = (id) => {
    if (!rank.has(id)) rank.set(id, inc.get(id).length ? Math.max(...inc.get(id).map(rk)) + 1 : 0);
    return rank.get(id);
  };
  nodes.forEach((nd) => rk(nd.id));
  // sources sit right before the first node they feed (stores next to their reader)
  for (const nd of nodes)
    if (!inc.get(nd.id).length && out.get(nd.id).length) rank.set(nd.id, Math.min(...out.get(nd.id).map((t) => rank.get(t))) - 1);

  // a note goes to the right of its shape when nothing connects there (like the
  // annotation in the notation), and above it otherwise, so flows stay clear
  for (const nd of nodes) {
    if (!nd.notes.length) continue;
    const r = rank.get(nd.id);
    if (edges.some((e) => (e.from === nd.id && rank.get(e.to) > r) || (e.to === nd.id && rank.get(e.from) > r))) continue;
    const total = nd.notes.reduce((sum, nt) => sum + nt.h, 0) + NOTE_GAP * (nd.notes.length - 1);
    nd.noteX = Math.max(nd.w / 2 + 40, nd.left + 12);
    nd.above = Math.max(0, total / 2 - nd.h / 2);
    nd.below = Math.max(nd.below, total / 2 - nd.h / 2);
    nd.right = nd.noteX + Math.max(...nd.notes.map((nt) => nt.w));
  }

  const nr = Math.max(0, ...rank.values()) + 1;
  const cols = Array.from({ length: nr }, () => []);
  nodes.forEach((nd) => cols[rank.get(nd.id)].push(nd));
  const nb = (id) => [...out.get(id), ...inc.get(id)];
  const pos = () => new Map(cols.flatMap((c) => c.map((nd, k) => [nd.id, k / Math.max(1, c.length - 1)])));
  for (let it = 0; it < 6; it++) {
    const p = pos();
    for (const c of cols) {
      const bc = (nd) => { const ns = nb(nd.id); return ns.length ? ns.reduce((s, id) => s + p.get(id), 0) / ns.length : p.get(nd.id); };
      c.sort((a, b) => bc(a) - bc(b) || a.i - b.i);
    }
  }

  // x: columns wide enough for shape and name
  const GAP_X = 64, GAP_Y = 34;
  let x = 0;
  for (const c of cols) {
    const wl = Math.max(...c.map((nd) => nd.left), 20), wr = Math.max(...c.map((nd) => nd.right), 20);
    c.forEach((nd) => (nd.cx = x + wl));
    x += wl + wr + GAP_X;
  }
  // y: stack, then relax toward neighbours while keeping order and spacing
  const ext = (nd) => [nd.h / 2 + nd.above, nd.h / 2 + nd.below];
  for (const c of cols) {
    let y = 0;
    for (const nd of c) { nd.cy = y + nd.above + nd.h / 2; y += nd.above + nd.h + nd.below + GAP_Y; }
    const mid = (y - GAP_Y) / 2;
    c.forEach((nd) => (nd.cy -= mid));
  }
  // Sweep right, then left: each node wants the median y of its neighbours in
  // the column it was reached from; a least-squares fit keeps the order and the
  // spacing within the column (pool adjacent violators).
  const median = (v) => { v.sort((a, b) => a - b); const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
  const place = (c, want) => {
    const off = [0];
    for (let k = 1; k < c.length; k++) off[k] = off[k - 1] + ext(c[k - 1])[1] + GAP_Y + ext(c[k])[0];
    const blocks = [];
    c.forEach((nd, k) => {
      blocks.push({ sum: want[k] - off[k], n: 1 });
      while (blocks.length > 1 && blocks.at(-2).sum / blocks.at(-2).n > blocks.at(-1).sum / blocks.at(-1).n) {
        const b = blocks.pop(); blocks.at(-1).sum += b.sum; blocks.at(-1).n += b.n;
      }
    });
    let k = 0;
    for (const b of blocks) for (let j = 0; j < b.n; j++, k++) c[k].cy = b.sum / b.n + off[k];
  };
  const rankOf = (id) => rank.get(id);
  for (let it = 0; it < 8; it++) {
    const forward = it % 2 === 0;
    const order = forward ? cols.map((_, k) => k) : cols.map((_, k) => cols.length - 1 - k);
    for (const k of order) {
      const c = cols[k];
      const want = c.map((nd) => {
        const side = nb(nd.id).filter((id) => (forward ? rankOf(id) < k : rankOf(id) > k)).map((id) => by.get(id).cy);
        const all = nb(nd.id).map((id) => by.get(id).cy);
        return side.length ? median(side) : all.length && it > 3 ? median(all) : nd.cy;
      });
      place(c, want);
    }
  }
  // widen the gap between two columns when flows between them are steep, so
  // arrows don't cut through the names under the shapes
  let shift = 0;
  cols.forEach((c, k) => {
    c.forEach((nd) => (nd.cx += shift));
    const next = cols[k + 1];
    if (!next) return;
    const steep = Math.max(0, ...dag.filter((e) => c.includes(by.get(e.from)) && next.includes(by.get(e.to)))
      .map((e) => Math.abs(by.get(e.from).cy - by.get(e.to).cy)));
    const left = Math.max(...c.map((nd) => nd.right)), right = Math.max(...next.map((nd) => nd.left));
    shift += Math.max(0, steep * 0.75 - (GAP_X + left + right) + 60);
  });
  // move to the origin and snap to whole pixels, so straight chains stay straight
  const x0 = Math.min(...nodes.map((nd) => nd.cx - nd.left)), y0 = Math.min(...nodes.map((nd) => nd.cy - nd.h / 2 - nd.above));
  nodes.forEach((nd) => { nd.cx = Math.round(nd.cx - x0); nd.cy = Math.round(nd.cy - y0); });
  return model;
}

// --- rendering -----------------------------------------------------------------------

// where a ray from the shape centre towards (tx, ty) leaves the shape, plus a gap
function boundary(nd, tx, ty, gap = 5) {
  const dx = tx - nd.cx, dy = ty - nd.cy, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  if (nd.kind === "processor" || nd.kind === "lambda") return [nd.cx + ux * (28 + gap), nd.cy + uy * (28 + gap)];
  let poly;
  const hw = nd.w / 2, hh = nd.h / 2;
  if (nd.kind === "trigger") poly = [[0, -hh], [hw, hh], [-hw, hh]];
  else poly = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
  let best = Infinity;
  for (let k = 0; k < poly.length; k++) {
    const [ax, ay] = poly[k], [bx, by] = poly[(k + 1) % poly.length];
    const ex = bx - ax, ey = by - ay, den = ux * ey - uy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = (ax * ey - ay * ex) / den, s = (ax * uy - ay * ux) / den;
    if (t > 0 && s >= 0 && s <= 1) best = Math.min(best, t);
  }
  if (!isFinite(best)) best = Math.max(hw, hh);
  return [nd.cx + ux * (best + gap), nd.cy + uy * (best + gap)];
}

function shape(nd) {
  const { cx, cy, w, h } = nd, top = cy - h / 2, o = { code: nd.code, name: nd.name };
  switch (nd.kind) {
    case "processor": return processor(cx, cy, { r: 26, ...o });
    case "lambda": return processor(cx, cy, { r: 26, lambda: true, ...o });
    case "store": return store(cx, top, { w, h, ...o });
    case "trigger": return trigger(cx, top, { w, h, ...o });
    case "other": return other(cx, top, { w, h, ...o });
    case "external": return external(cx, top, { w, h, name: nd.name });
    case "app": return app(cx, top, { w, h, name: nd.name });
    case "human": return human(cx, top, { name: nd.name });
    case "list": {
      let s = [cx - 27, cx - 9, cx + 9, cx + 27].map((x) => processor(x, cy, { r: 20, fill: true })).join("");
      if (nd.name) s += label(cx, top + h + 18, nd.name);
      return s;
    }
  }
}

export function render(src, { pad = 24 } = {}) {
  const model = layout(parse(src));
  const by = new Map(model.nodes.map((nd) => [nd.id, nd]));
  let body = "";

  // groups first, so they sit behind everything
  const boxes = model.groups.map((g) => {
    const ms = g.members.map((id) => by.get(id));
    const x0 = Math.min(...ms.map((m) => m.cx - m.left)) - 16, x1 = Math.max(...ms.map((m) => m.cx + m.right)) + 16;
    const y0 = Math.min(...ms.map((m) => m.cy - m.h / 2 - m.above)) - 16, y1 = Math.max(...ms.map((m) => m.cy + m.h / 2 + m.below)) + 12;
    return { g, x0, x1, y0, y1 };
  });
  for (const { g, x0, x1, y0, y1 } of boxes) {
    body += `<rect class="s d" x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" rx="2"/>`;
    body += `<text class="t" x="${f(x1)}" y="${f(y0 - 8)}" text-anchor="end" style="font-weight:600">${esc(g.name)}</text>`;
  }
  for (const nd of model.nodes) body += shape(nd);
  // notes: brackets to the right of the shape or stacked above it, each linked
  // to the shape by a plain line
  for (const nd of model.nodes) {
    const total = nd.notes.reduce((sum, nt) => sum + nt.h, 0) + NOTE_GAP * (nd.notes.length - 1);
    let top = nd.cy - total / 2, bottom = nd.cy - nd.h / 2 - NOTE_GAP;
    for (const nt of nd.notes) {
      const right = nd.noteX !== undefined;
      const x = nd.cx + (right ? nd.noteX : NOTE_DX), y0 = right ? top : bottom - nt.h, y = y0 + nt.h / 2;
      body += bracket(x, y0, nt.w, nt.h, nt.lines);
      const [x1, y1] = boundary(nd, x, y, 2);
      body += flow(x1, y1, x, y, { none: true });
      top += nt.h + NOTE_GAP;
      bottom = y0 - NOTE_GAP;
    }
  }
  for (const e of model.edges) {
    const a = by.get(e.from), b = by.get(e.to);
    if (a === b) continue;
    const [x1, y1] = boundary(a, b.cx, b.cy), [x2, y2] = boundary(b, a.cx, a.cy);
    body += flow(x1, y1, x2, y2, e);
    if (e.name) body += `<text class="l" x="${f((x1 + x2) / 2)}" y="${f((y1 + y2) / 2 - (e.mark ? 16 : 8))}">${esc(e.name)}</text>`;
  }

  // fit the view box around everything
  const xs = [], ys = [];
  for (const nd of model.nodes) xs.push(nd.cx - nd.left, nd.cx + nd.right), ys.push(nd.cy - nd.h / 2 - nd.above, nd.cy + nd.h / 2 + nd.below);
  for (const b of boxes) xs.push(b.x0, b.x1), ys.push(b.y0 - 24, b.y1);
  const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad;
  const W = Math.ceil(Math.max(...xs) + pad - minX), H = Math.ceil(Math.max(...ys) + pad - minY);
  const svg = (c) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${f(minX)} ${f(minY)} ${W} ${H}" role="img" aria-label="${esc(model.title)}">
<title>${esc(model.title)}</title>
${style(c)}
${body}
</svg>
`;
  return { light: svg(THEMES[""]), dark: svg(THEMES["-dark"]), model };
}
