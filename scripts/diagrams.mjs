// Generates the pipeline diagrams as light and dark SVGs.
// Usage: node scripts/diagrams.mjs images
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { THEMES, style, f, label, processor, store, trigger, flow, edge, bracket, other, external, internal, app, human } from "./shapes.mjs";

const out = process.argv[2];
mkdirSync(out, { recursive: true });

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
  external(70, 8, { name: "external system" }));
svg("def_internal", 140, 100, "Internal system",
  internal(70, 8, { name: "internal system" }));
svg("def_other", 140, 100, "Other",
  other(70, 8, { code: "NAME", name: "other" }));

const flowDef = (name, title, text, opts) =>
  svg(name, 200, 64, title, flow(16, 22, 184, 22, opts) + label(100, 52, text));
flowDef("def_flow", "Flow", "flow", {});
flowDef("def_flow_async", "Asynchronous flow", "asynchronous", { mark: "A" });
flowDef("def_flow_streaming", "Streaming or evented flow", "streaming or evented", { mark: "N" });
flowDef("def_flow_sync", "Synchronous flow", "synchronous", { both: true });
flowDef("def_flow_queued", "Queued flow", "queued", { mark: "Q" });

// --- miscellaneous --------------------------------------------------------------

svg("def_misc_user_facing", 140, 100, "User facing app",
  app(70, 8, { name: "user facing app" }));
svg("def_misc_kafka", 160, 100, "Other system: Kafka",
  other(80, 8, { w: 120, code: "KAFKA", name: "name of stream" }));
svg("def_misc_human", 120, 104, "Human",
  human(60, 8, { name: "human" }));
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
  s += processor(480, row, { r: col.r, name: "report generator" });
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
