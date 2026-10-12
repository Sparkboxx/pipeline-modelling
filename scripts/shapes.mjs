// Shared shape definitions for Pipeline Diagrams. Used by diagrams.mjs (the
// site images) and templates.mjs (icon pack and tool libraries), so every
// output comes from one source.

// Each diagram is written twice, <name>.svg and <name>-dark.svg, with fixed
// colors. Pages pick one with <picture> and a prefers-color-scheme media query;
// a media query inside the SVG itself is not reliable in Safari.
export const THEMES = {
  "": { ink: "#1f2328", label: "#424a53", bg: "#ffffff", fill: "#d0d7de", ok: "#1a7f37", no: "#cf222e" },
  "-dark": { ink: "#e6edf3", label: "#b7bdc8", bg: "#0f1216", fill: "#3d444d", ok: "#3fb950", no: "#f85149" },
};

export const style = (c) => `<style>
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

export const f = (n) => +n.toFixed(1);

export function label(x, y, text, cls = "l") {
  const lines = String(text).split("\n");
  if (lines.length === 1) return `<text class="${cls}" x="${f(x)}" y="${f(y)}">${esc(text)}</text>`;
  const spans = lines.map((t, i) => `<tspan x="${f(x)}" dy="${i ? 15 : 0}">${esc(t)}</tspan>`).join("");
  return `<text class="${cls}" x="${f(x)}" y="${f(y)}">${spans}</text>`;
}

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// --- basic shapes -----------------------------------------------------------

export function processor(cx, cy, { r = 26, code, lambda, name, fill } = {}) {
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
export function store(cx, top, { w = 52, h = 60, code, name } = {}) {
  const x = cx - w / 2;
  let s = `<rect class="s" x="${f(x)}" y="${top}" width="${w}" height="${h}"/>`;
  s += `<path class="s" d="M${f(x)} ${f(top + h * 0.2)}H${f(x + w)}"/>`;
  if (code) s += `<text class="k" x="${f(cx)}" y="${f(top + h * 0.6)}">${esc(code)}</text>`;
  if (name) s += label(cx, top + h + 18, name);
  return s;
}

// trigger: (cx, top) anchored, returns triangle with height h
export function trigger(cx, top, { w = 64, h = 64, code, name } = {}) {
  let s = `<path class="s" d="M${f(cx)} ${top}L${f(cx + w / 2)} ${top + h}H${f(cx - w / 2)}Z"/>`;
  if (code) s += `<text class="k" x="${f(cx)}" y="${f(top + h * 0.66)}">${esc(code)}</text>`;
  if (name) s += label(cx, top + h + 18, name);
  return s;
}

export function head(x, y, ang) {
  const L = 10, W = 4;
  const bx = x - L * Math.cos(ang), by = y - L * Math.sin(ang);
  const px = -Math.sin(ang) * W, py = Math.cos(ang) * W;
  return `<path class="h" d="M${f(x)} ${f(y)}L${f(bx + px)} ${f(by + py)}L${f(bx - px)} ${f(by - py)}Z"/>`;
}

export const MARKS = {
  A: "M-6 6L0 -10L6 6",
  N: "M-5 6V-7L5 6V-7",
  Q: "M0 -9V5",
};

// flow line from (x1,y1) to (x2,y2)
export function flow(x1, y1, x2, y2, { both, none, mark } = {}) {
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
export function edge(cx, cy, r, tx, ty, gap = 4) {
  const a = Math.atan2(ty - cy, tx - cx);
  return [cx + (r + gap) * Math.cos(a), cy + (r + gap) * Math.sin(a)];
}

export function bracket(x, y, w, h, lines) {
  const t = 9;
  let s = `<path class="s" d="M${x + t} ${y}H${x}V${y + h}H${x + t}"/>`;
  s += `<path class="s" d="M${x + w - t} ${y}H${x + w}V${y + h}H${x + w - t}"/>`;
  lines.forEach((ln, i) => (s += `<text class="t" x="${x + 14}" y="${y + 22 + i * 19}">${esc(ln)}</text>`));
  return s;
}

// other system: (cx, top) anchored rectangle with the system name inside
export function other(cx, top, { w = 108, h = 60, code, name } = {}) {
  let s = `<rect class="s" x="${f(cx - w / 2)}" y="${top}" width="${w}" height="${h}"/>`;
  if (code) s += `<text class="k" x="${f(cx)}" y="${f(top + h / 2)}">${esc(code)}</text>`;
  if (name) s += label(cx, top + h + 18, name);
  return s;
}

// external system: (cx, top) anchored filled rectangle
export function external(cx, top, { w = 60, h = 60, name } = {}) {
  let s = `<rect class="x" x="${f(cx - w / 2)}" y="${top}" width="${w}" height="${h}"/>`;
  if (name) s += label(cx, top + h + 18, name);
  return s;
}

// user facing app: (cx, top) anchored square with a cross
export function app(cx, top, { w = 60, h = 60, name } = {}) {
  const x = cx - w / 2;
  let s = `<rect class="s" x="${f(x)}" y="${top}" width="${w}" height="${h}"/>`;
  s += `<path class="s" d="M${f(x)} ${top}L${f(x + w)} ${top + h}M${f(x + w)} ${top}L${f(x)} ${top + h}"/>`;
  if (name) s += label(cx, top + h + 18, name);
  return s;
}

// human: (cx, top) anchored head and shoulders, 62 high
export function human(cx, top, { name } = {}) {
  let s = `<circle class="s" cx="${f(cx)}" cy="${top + 16}" r="15"/>`;
  s += `<path class="s" d="M${f(cx - 28)} ${top + 62}V${top + 50}A28 22 0 0 1 ${f(cx + 28)} ${top + 50}V${top + 62}Z"/>`;
  if (name) s += label(cx, top + 80, name);
  return s;
}

