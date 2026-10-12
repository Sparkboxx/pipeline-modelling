// Generates the pipeline diagrams as light and dark SVGs.
// Usage: node scripts/diagrams.mjs images
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2];
mkdirSync(out, { recursive: true });

// Each diagram is written twice, <name>.svg and <name>-dark.svg, with fixed
// colors. Pages pick one with <picture> and a prefers-color-scheme media query;
// a media query inside the SVG itself is not reliable in Safari.
const THEMES = {
  "": { ink: "#1f2328", label: "#424a53", bg: "#ffffff", fill: "#d0d7de", ok: "#1a7f37", no: "#cf222e" },
  "-dark": { ink: "#e6edf3", label: "#b7bdc8", bg: "#0f1216", fill: "#3d444d", ok: "#3fb950", no: "#f85149" },
};

const style = (c) => `<style>
.s{fill:none;stroke:${c.ink};stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.d{stroke-dasharray:7 5}
.h{fill:${c.ink}}
.bg{fill:${c.bg}}
.x{fill:${c.fill};stroke:${c.ink};stroke-width:1.6}
text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif;fill:${c.ink}}
.l{font-size:12.5px;fill:${c.label};text-anchor:middle}
.k{font-size:15px;font-weight:600;text-anchor:middle;dominant-baseline:central}
.t{font-size:12.5px}
.ok{fill:${c.ok};font-size:12px;font-weight:700;letter-spacing:.1em}
.no{fill:${c.no};font-size:12px;font-weight:700;letter-spacing:.1em}
</style>`;

const f = (n) => +n.toFixed(1);

function svg(name, w, h, title, body) {
  for (const [suffix, colors] of Object.entries(THEMES)) {
    const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}">
<title>${title}</title>
${style(colors)}
${body}
</svg>
`;
    writeFileSync(join(out, `${name}${suffix}.svg`), doc);
  }
}

function label(x, y, text, cls = "l") {
  const lines = String(text).split("\n");
  if (lines.length === 1) return `<text class="${cls}" x="${f(x)}" y="${f(y)}">${esc(text)}</text>`;
  const spans = lines.map((t, i) => `<tspan x="${f(x)}" dy="${i ? 15 : 0}">${esc(t)}</tspan>`).join("");
  return `<text class="${cls}" x="${f(x)}" y="${f(y)}">${spans}</text>`;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// --- basic shapes -----------------------------------------------------------

function processor(cx, cy, { r = 26, code, lambda, name, fill } = {}) {
  let s = fill ? `<circle class="bg" cx="${f(cx)}" cy="${f(cy)}" r="${r}"/>` : "";
  s += `<circle class="s" cx="${f(cx)}" cy="${f(cy)}" r="${r}"/>`;
  if (lambda) {
    // a big λ: a full diagonal from top left to bottom right, plus a leg
    // from the center to the bottom left
    const d = r * 0.707;
    s += `<path class="s" d="M${f(cx - d)} ${f(cy - d)}L${f(cx + d)} ${f(cy + d)}M${f(cx)} ${f(cy)}L${f(cx - d)} ${f(cy + d)}"/>`;
    if (code) s += `<text class="k" x="${f(cx + r * 0.42)}" y="${f(cy - r * 0.3)}" style="font-size:13px">${esc(code)}</text>`;
  } else if (code) {
    const big = code === "λ" ? ' style="font-size:24px;font-weight:400"' : "";
    s += `<text class="k" x="${f(cx)}" y="${f(cy)}"${big}>${esc(code)}</text>`;
  }
  if (name) s += label(cx, cy + r + 18, name);
  return s;
}

// data store: (cx, top) anchored
function store(cx, top, { w = 52, h = 60, code, name } = {}) {
  const x = cx - w / 2;
  let s = `<rect class="s" x="${f(x)}" y="${top}" width="${w}" height="${h}"/>`;
  s += `<path class="s" d="M${f(x)} ${f(top + h * 0.2)}H${f(x + w)}"/>`;
  if (code) s += `<text class="k" x="${f(cx)}" y="${f(top + h * 0.6)}">${esc(code)}</text>`;
  if (name) s += label(cx, top + h + 18, name);
  return s;
}

// trigger: (cx, top) anchored, returns triangle with height h
function trigger(cx, top, { w = 64, h = 64, code, name } = {}) {
  let s = `<path class="s" d="M${f(cx)} ${top}L${f(cx + w / 2)} ${top + h}H${f(cx - w / 2)}Z"/>`;
  if (code) s += `<text class="k" x="${f(cx)}" y="${f(top + h * 0.66)}">${esc(code)}</text>`;
  if (name) s += label(cx, top + h + 18, name);
  return s;
}

function head(x, y, ang) {
  const L = 10, W = 4;
  const bx = x - L * Math.cos(ang), by = y - L * Math.sin(ang);
  const px = -Math.sin(ang) * W, py = Math.cos(ang) * W;
  return `<path class="h" d="M${f(x)} ${f(y)}L${f(bx + px)} ${f(by + py)}L${f(bx - px)} ${f(by - py)}Z"/>`;
}

const MARKS = {
  A: "M-6 6L0 -10L6 6",
  N: "M-5 6V-7L5 6V-7",
  Q: "M0 -9V5",
};

// flow line from (x1,y1) to (x2,y2)
function flow(x1, y1, x2, y2, { both, none, mark } = {}) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const pull = 8;
  const ex = none ? x2 : x2 - pull * Math.cos(ang), ey = none ? y2 : y2 - pull * Math.sin(ang);
  const sx = both ? x1 + pull * Math.cos(ang) : x1, sy = both ? y1 + pull * Math.sin(ang) : y1;
  let s = `<path class="s" d="M${f(sx)} ${f(sy)}L${f(ex)} ${f(ey)}"/>`;
  if (!none) s += head(x2, y2, ang);
  if (both) s += head(x1, y1, ang + Math.PI);
  if (mark) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    s += `<path class="s" transform="translate(${f(mx)} ${f(my)}) rotate(${f((ang * 180) / Math.PI)})" d="${MARKS[mark]}"/>`;
  }
  return s;
}

// point on circle boundary towards (tx,ty), with a gap
function edge(cx, cy, r, tx, ty, gap = 4) {
  const a = Math.atan2(ty - cy, tx - cx);
  return [cx + (r + gap) * Math.cos(a), cy + (r + gap) * Math.sin(a)];
}

function bracket(x, y, w, h, lines) {
  const t = 9;
  let s = `<path class="s" d="M${x + t} ${y}H${x}V${y + h}H${x + t}"/>`;
  s += `<path class="s" d="M${x + w - t} ${y}H${x + w}V${y + h}H${x + w - t}"/>`;
  lines.forEach((ln, i) => (s += `<text class="t" x="${x + 14}" y="${y + 22 + i * 19}">${esc(ln)}</text>`));
  return s;
}

// --- basic shape definitions --------------------------------------------------

svg("def_processor", 120, 100, "Processor", processor(60, 36, { r: 28, name: "processor" }));
svg("def_processor_lambda", 120, 100, "Lambda processor", processor(60, 36, { r: 28, lambda: true, name: "lambda" }));
svg("def_processor_kafka_stream", 120, 116, "Kafka stream processor", processor(60, 36, { r: 28, code: "K", name: "Kafka stream\nprocessor" }));
svg("def_data_store", 120, 104, "Data store", store(60, 8, { name: "data store" }));
svg("def_trigger", 120, 104, "Trigger", trigger(60, 8, { name: "trigger" }));
svg("def_trigger_manual", 120, 104, "Manual trigger", trigger(60, 8, { code: "M", name: "manual" }));
svg("def_trigger_timed", 120, 104, "Timed trigger", trigger(60, 8, { code: "L", name: "timed" }));
svg("def_trigger_event", 120, 104, "Event trigger", trigger(60, 8, { code: "E", name: "event" }));
svg("def_external", 140, 100, "External system",
  `<rect class="x" x="40" y="8" width="60" height="60"/>` + label(70, 86, "external system"));
svg("def_other", 140, 100, "Other",
  `<rect class="s" x="16" y="8" width="108" height="60"/><text class="k" x="70" y="38">NAME</text>` + label(70, 86, "other"));

const flowDef = (name, title, text, opts) =>
  svg(name, 200, 64, title, flow(16, 22, 184, 22, opts) + label(100, 52, text));
flowDef("def_flow", "Flow", "flow", {});
flowDef("def_flow_async", "Asynchronous flow", "asynchronous", { mark: "A" });
flowDef("def_flow_streaming", "Streaming or evented flow", "streaming or evented", { mark: "N" });
flowDef("def_flow_sync", "Synchronous flow", "synchronous", { both: true });
flowDef("def_flow_queued", "Queued flow", "queued", { mark: "Q" });

// --- miscellaneous --------------------------------------------------------------

svg("def_misc_user_facing", 140, 100, "User facing app",
  `<rect class="s" x="40" y="8" width="60" height="60"/><path class="s" d="M40 8L100 68M100 8L40 68"/>` + label(70, 86, "user facing app"));
svg("def_misc_kafka", 160, 100, "Other system: Kafka",
  `<rect class="s" x="20" y="8" width="120" height="60"/><text class="k" x="80" y="38">KAFKA</text>` + label(80, 86, "name of stream"));
svg("def_misc_human", 120, 104, "Human",
  `<circle class="s" cx="60" cy="24" r="15"/><path class="s" d="M32 70V58A28 22 0 0 1 88 58V70Z"/>` + label(60, 88, "human"));
svg("def_misc_annotations", 330, 136, "Annotation",
  processor(44, 62, { r: 26, name: "processor" }) +
  `<path class="s" d="M70 62H128"/>` +
  bracket(128, 12, 190, 100, ["- m4.xlarge", "- min: 0", "- max: 10", "- AMI: ami-1234abcd"]));
{
  let s = "";
  [36, 54, 72, 90].forEach((x) => (s += processor(x, 34, { r: 24, fill: true })));
  s += `<path class="s" d="M90 58V82"/>`;
  s += bracket(16, 82, 150, 96, ["- processor a", "- processor b", "- processor c", "- processor …"]);
  svg("def_misc_lists", 182, 190, "List of processors", s);
}

// --- composite diagrams -----------------------------------------------------------

function reportingPipeline(dy, grouped) {
  const row = 214 + dy;
  const col = { r: 34 };
  let s = "";
  const stores = [[130, "items"], [260, "statistics"], [390, "user data"]];
  for (const [x, n] of stores) {
    s += store(x, 10 + dy, { name: n });
    const [ex, ey] = edge(260, row, col.r, x, 106 + dy);
    s += flow(x, 104 + dy, ex, ey);
  }
  s += trigger(56, row - 34, { w: 72, h: 68, name: "create report" });
  s += processor(260, row, { r: col.r, name: "data collector" });
  s += processor(480, row, { r: col.r, name: "html_report_generator" });
  s += store(690, row - 34, { h: 68, name: "reports" });
  s += flow(80, row, 260 - col.r - 4, row);
  s += flow(260 + col.r + 4, row, 480 - col.r - 4, row);
  s += flow(480 + col.r + 4, row, 690 - 26 - 4, row);
  if (grouped) {
    s += `<rect class="s d" x="10" y="${row - 62}" width="730" height="132" rx="2"/>`;
    s += `<text class="t" x="740" y="${row - 70}" text-anchor="end" style="font-weight:600">reporting pipeline</text>`;
  }
  return s;
}
svg("example_pipeline", 750, 280, "Example pipeline", reportingPipeline(0, false));
svg("def_misc_grouping", 750, 300, "Grouping", reportingPipeline(0, true));

{
  const rows = [
    [["P", "Python or PHP"], ["R", "R or Ruby"], ["J", "JavaScript\nor Java"], ["C", "C, C++ or C#"], ["L", "Lambda or Lua"], ["Q", "Query"], ["λ", "Lambda"], ["PHP", "PHP"]],
    [["PY", "Python"], ["R.", "R"], ["RB", "Ruby"], ["JS", "JavaScript"], ["J.", "Java"], ["L.", "Lua"], ["C.", "C"], ["C+", "C++"]],
    [["C#", "C#"], ["LN", "Lambda\nJavaScript (Node)"], ["LP", "Lambda Python"], ["LC", "Lambda C#"], ["JS", "Lambda\nJavaScript", true], ["P", "Lambda Python", true], ["", "Lambda", true]],
  ];
  let s = "";
  rows.forEach((row, ri) =>
    row.forEach(([code, name, lambda], ci) => {
      s += processor(60 + ci * 120, 36 + ri * 118, { r: 26, code, name, lambda });
    })
  );
  svg("processors_examples", 960, 352, "Processor letter codes", s);
}

svg("data_storage_examples", 400, 230, "Data store letter codes",
  [["", "storage"], ["D", "DynamoDB"], ["P", "Postgresql"], ["S3", "S3"], ["R", "Redis or\nRedshift"], ["M", "MySQL"], ["MC", "Memcached"], ["A", "Aurora"]]
    .map(([code, name], i) => store(50 + (i % 4) * 100, 8 + Math.floor(i / 4) * 112, { code, name })).join(""));

function rightWrong(right) {
  let s = `<text class="${right ? "ok" : "no"}" x="10" y="20">${right ? "RIGHT" : "WRONG"}</text>`;
  s += trigger(60, 76, { w: 76, h: 76 });
  if (right) {
    s += processor(210, 114, { r: 38, name: "processor" });
    s += store(350, 84, { w: 64, h: 60, name: "data store" });
    s += flow(84, 114, 168, 114) + flow(252, 114, 314, 114);
  } else {
    s += processor(210, 114, { r: 38 });
    s += `<text class="t" x="150" y="166">processor</text>`;
    s += store(350, 84, { w: 64, h: 60 });
    s += `<text class="t" transform="translate(392 82) rotate(90)">data store</text>`;
    s += flow(84, 114, 172, 114, { none: true }) + flow(248, 114, 318, 114, { none: true });
  }
  return s;
}
svg("modelling_right", 410, 180, "Right: modelled according to the rules", rightWrong(true));
svg("modelling_wrong", 410, 180, "Wrong: labels on the side and no arrow heads", rightWrong(false));

// small mark for the site header and favicon
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<style>.s{fill:none;stroke:#6366f1;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}</style>
<path class="s" d="M11 22L19 40H3Z"/><circle class="s" cx="32" cy="32" r="8"/><rect class="s" x="47" y="22" width="14" height="20"/><path class="s" d="M47 27H61"/>
<path class="s" d="M17 32H23M41 32H47"/>
</svg>
`;
writeFileSync(join(out, "mark.svg"), mark);
console.log("ok");
