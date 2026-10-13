// Converts the Pipeline Diagrams text format to Mermaid, for places that render
// Mermaid but not our format (GitHub, Notion, chat tools). Two levels:
//   basic:  standard Mermaid shapes (Mermaid 11.3 or newer), works everywhere
//   icons:  the real shapes from the "pd" icon pack, names below; needs the pack
//           registered (mermaid.registerIconPacks, or mmdc --iconPacksNamesAndUrls)
// No Node APIs here; bundled into assets/js/pipeline-diagrams.js too.
import { parse, CODES } from "./pipeline-dsl.mjs";

const RESERVED = new Set(["end", "graph", "flowchart", "subgraph", "style", "class", "classDef", "click", "linkStyle", "direction", "default"]);
const q = (s) => `"${String(s).replace(/"/g, "#quot;").replace(/\n/g, "<br>")}"`;

export const codeSlug = (code) =>
  code.toLowerCase().replace(/#/g, "sharp").replace(/\+/g, "plus").replace(/\./g, "-dot").replace(/λ/g, "lambda");

// icon name in the pack for a shape, or null when the pack has no icon for it
export function iconName(nd) {
  const base = { processor: "processor", lambda: "lambda", store: "store", trigger: "trigger", external: "external", internal: "internal", app: "app", human: "human", list: "list" }[nd.kind];
  if (!base) return null;
  if (!nd.code) return base;
  return CODES[nd.kind]?.includes(nd.code) ? `${base}-${codeSlug(nd.code)}` : null;
}

export function toMermaid(src, { icons = false } = {}) {
  const model = typeof src === "string" ? parse(src) : src;
  const ids = new Map();
  const used = new Set();
  const mid = (id) => {
    if (ids.has(id)) return ids.get(id);
    let m = id.replace(/-/g, "_");
    if (RESERVED.has(m)) m = `n_${m}`;
    while (used.has(m)) m += "_";
    used.add(m);
    ids.set(id, m);
    return m;
  };
  const out = [];
  if (model.title) out.push("---", `title: ${q(model.title)}`, "---");
  out.push(`flowchart ${model.direction === "TB" ? "TB" : "LR"}`);

  const textOf = (nd) => [nd.code, nd.name].filter(Boolean).join("\n");
  const node = (nd, ind) => {
    const id = mid(nd.id);
    if (icons) {
      const icon = iconName(nd);
      if (icon) {
        const text = [nd.name, nd.items?.join(", ")].filter(Boolean).join("\n");
        return `${ind}${id}@{ icon: "pd:${icon}", label: ${q(text || " ")}, pos: "b", h: 48 }`;
      }
    }
    switch (nd.kind) {
      case "processor": return `${ind}${id}@{ shape: circle, label: ${q(textOf(nd) || " ")} }`;
      case "lambda": return `${ind}${id}@{ shape: circle, label: ${q(["λ" + (nd.code ? " " + nd.code : ""), nd.name].filter(Boolean).join("\n"))} }`;
      case "store": return `${ind}${id}@{ shape: div-rect, label: ${q(textOf(nd) || " ")} }`;
      case "trigger": return `${ind}${id}@{ shape: tri, label: ${q(textOf(nd) || " ")} }`;
      case "other": return `${ind}${id}@{ shape: rect, label: ${q(textOf(nd) || " ")} }`;
      case "external": return `${ind}${id}@{ shape: rect, label: ${q(nd.name || " ")} }\n${ind}class ${id} external`;
      case "internal": return `${ind}${id}@{ shape: lin-rect, label: ${q(nd.name || " ")} }`;
      case "app": return `${ind}${id}@{ shape: win-pane, label: ${q(nd.name || " ")} }`;
      case "human": return `${ind}${id}@{ shape: stadium, label: ${q("👤 " + (nd.name || ""))} }`;
      case "list": return `${ind}${id}@{ shape: procs, label: ${q([nd.name, nd.items?.join(", ")].filter(Boolean).join("\n") || " ")} }`;
    }
  };

  // groups become subgraphs, with their shapes declared inside
  const gid = (g) => `group_${g.id + 1}`;
  const written = new Set();
  const writeGroup = (g, ind) => {
    out.push(`${ind}subgraph ${gid(g)}[${q(g.name)}]`);
    for (const id of g.nodes) { out.push(node(model.nodes.find((nd) => nd.id === id), ind + "  ")); written.add(id); }
    for (const ch of g.children) writeGroup(ch, ind + "  ");
    out.push(`${ind}end`);
  };
  for (const nd of model.nodes) if (!nd.group) { out.push(node(nd, "  ")); written.add(nd.id); }
  for (const g of model.groups) if (!g.parent) writeGroup(g, "  ");

  // flows; marks become letters on the label, notes on a flow join its label
  const end = (x) => (x.node ? mid(x.node.id) : gid(x.groupRef));
  for (const e of model.edges) {
    if (e.from.node && e.from.node === e.to.node) continue;
    const text = [[e.mark, e.name].filter(Boolean).join(": "), ...e.notes.map((nt) => nt.lines.join("\n"))].filter(Boolean).join("\n");
    const arrow = e.both ? "<-->" : "-->";
    out.push(`  ${end(e.from)} ${arrow}${text ? `|${q(text)}|` : ""} ${end(e.to)}`);
  }
  // notes on shapes: a comment shape linked with a dotted line
  let k = 0;
  for (const nd of model.nodes)
    for (const nt of nd.notes) {
      const id = `note_${++k}`;
      out.push(`  ${id}@{ shape: braces, label: ${q(nt.lines.join("\n"))} }`, `  ${mid(nd.id)} -.- ${id}`);
    }
  if (model.nodes.some((nd) => nd.kind === "external") && !(icons && model.nodes.every((nd) => nd.kind !== "external" || iconName(nd))))
    out.push("  classDef external fill:#d0d7de,stroke:#1f2328,color:#1f2328");
  return out.join("\n") + "\n";
}

// --- the "pd" icon pack, in Iconify JSON format -------------------------------------------

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"';
const text = (t, x, y) => {
  const size = t.length <= 2 ? 17 : t.length === 3 ? 14 : 11;
  return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="700" fill="currentColor">${t.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`;
};
const BODIES = {
  processor: (c) => `<circle ${S} cx="32" cy="32" r="26"/>${c ? text(c, 32, 32) : ""}`,
  lambda: (c) => `<circle ${S} cx="32" cy="32" r="26"/><path ${S} d="M13.6 13.6L50.4 50.4M32 32L13.6 50.4"/>${c ? text(c, 43, 23).replace(/font-size="\d+"/, 'font-size="12"') : ""}`,
  store: (c) => `<rect ${S} x="10" y="5" width="44" height="54"/><path ${S} d="M10 16H54"/>${c ? text(c, 32, 38) : ""}`,
  trigger: (c) => `<path ${S} d="M32 5L60 58H4Z"/>${c ? text(c, 32, 42) : ""}`,
  external: () => `<rect x="7" y="7" width="50" height="50" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="2"/>`,
  internal: () => `<rect ${S} x="7" y="7" width="50" height="50"/><path ${S} d="M7 7L57 57"/>`,
  app: () => `<rect ${S} x="7" y="7" width="50" height="50"/><path ${S} d="M7 7L57 57M57 7L7 57"/>`,
  human: () => `<circle ${S} cx="32" cy="17" r="12"/><path ${S} d="M9 59V50A23 18 0 0 1 55 50V59Z"/>`,
  list: () => [14, 26, 38, 50].map((x) => `<circle ${S} cx="${x}" cy="32" r="12"/>`).join(""),
};

export function iconPack() {
  const icons = {};
  for (const [kind, body] of Object.entries(BODIES)) {
    icons[kind] = { body: body() };
    for (const code of CODES[kind] || []) icons[`${kind}-${codeSlug(code)}`] = { body: body(code) };
  }
  return { prefix: "pd", width: 64, height: 64, icons };
}
