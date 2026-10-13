#!/usr/bin/env node
// Renders the ```pipeline blocks in Markdown files, for places that don't render
// the format themselves (GitHub). Right after each block it writes, between two
// HTML comments, either a <picture> with light and dark SVG files, or with
// --mermaid a ```mermaid block. Running it again updates those parts in place.
//
// Usage: node scripts/render-markdown.mjs [files or folders...] [--out diagrams] [--mermaid] [--check]
//   --out      folder for the SVG files (default: diagrams), relative to the working directory
//   --mermaid  insert a Mermaid version instead of SVG images
//   --check    change nothing; exit 1 when a diagram has errors or a file is out of date
// Also used by the GitHub Action in action.yml.
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, relative, dirname, basename, sep } from "node:path";
import { createHash } from "node:crypto";
import { render, check } from "./pipeline-dsl.mjs";
import { toMermaid } from "./pipeline-mermaid.mjs";

const argv = process.argv.slice(2);
const opt = (name, fallback) => { const i = argv.indexOf(name); return i >= 0 ? argv.splice(i, 2)[1] : fallback; };
const outDir = opt("--out", "diagrams");
const mermaid = argv.includes("--mermaid"), checkOnly = argv.includes("--check");
const paths = argv.filter((a) => !a.startsWith("--"));
if (!paths.length) paths.push(".");

const SKIP = new Set(["node_modules", ".git", "_site", "vendor", ".jekyll-cache"]);
const files = [];
const walk = (p) => {
  const st = statSync(p);
  if (st.isDirectory()) { for (const name of readdirSync(p)) if (!SKIP.has(name) && !name.startsWith(".")) walk(join(p, name)); }
  else if (/\.(md|markdown)$/i.test(p)) files.push(p);
};
paths.forEach(walk);

const BEGIN = "<!-- pipeline-diagrams:begin -->", END = "<!-- pipeline-diagrams:end -->";
const posix = (p) => p.split(sep).join("/");
let failed = false, stale = false;
const keep = new Set();
const prefixes = new Set();

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  const out = [];
  const slug = posix(relative(".", file)).replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  prefixes.add(slug);
  let i = 0, n = 0;
  while (i < lines.length) {
    const open = lines[i].match(/^(\s*)(`{3,}|~{3,})\s*pipeline\s*$/);
    if (!open) { out.push(lines[i++]); continue; }
    // the block itself
    const fence = open[2], start = i;
    out.push(lines[i++]);
    const body = [];
    while (i < lines.length && !lines[i].trim().startsWith(fence)) { body.push(lines[i]); out.push(lines[i++]); }
    if (i < lines.length) out.push(lines[i++]);
    // drop a generated part that follows it (after at most one empty line)
    let j = i;
    if (lines[j] === "" && lines[j + 1] === BEGIN) j++;
    if (lines[j] === BEGIN) {
      while (j < lines.length && lines[j] !== END) j++;
      i = j + 1;
    }
    const src = body.join("\n");
    const { errors } = check(src);
    if (errors.length) {
      failed = true;
      for (const e of errors) console.error(`${file}:${start + 1 + e.line}: ${e.message}`);
      continue;
    }
    n++;
    let part;
    if (mermaid) {
      part = ["```mermaid", toMermaid(src).trimEnd(), "```"];
    } else {
      const hash = createHash("sha1").update(src).digest("hex").slice(0, 8);
      const name = `${slug}-${hash}`;
      keep.add(name);
      const { light, dark, model } = render(src);
      if (!checkOnly) {
        mkdirSync(outDir, { recursive: true });
        writeFileSync(join(outDir, `${name}.svg`), light);
        writeFileSync(join(outDir, `${name}-dark.svg`), dark);
      } else if (!existsSync(join(outDir, `${name}.svg`))) stale = true;
      const rel = posix(relative(dirname(file), join(outDir, name)));
      const alt = (model.title || "Pipeline diagram").replace(/"/g, "&quot;");
      part = [`<picture><source srcset="${rel}-dark.svg" media="(prefers-color-scheme: dark)"><img src="${rel}.svg" alt="${alt}"></picture>`];
    }
    out.push("", BEGIN, ...part, END);
  }
  const next = out.join("\n");
  if (next !== text) {
    if (checkOnly) { stale = true; console.error(`${file}: diagrams are out of date`); }
    else { writeFileSync(file, next); console.log(`${file}: ${n} diagram${n === 1 ? "" : "s"}`); }
  }
}

// remove SVG files of diagrams that no longer exist
if (!mermaid && !checkOnly && existsSync(outDir))
  for (const f of readdirSync(outDir)) {
    const m = f.match(/^(.*)-([0-9a-f]{8})(-dark)?\.svg$/);
    if (m && prefixes.has(m[1]) && !keep.has(`${m[1]}-${m[2]}`)) rmSync(join(outDir, f));
  }

if (failed) process.exit(1);
if (checkOnly && stale) process.exit(1);
