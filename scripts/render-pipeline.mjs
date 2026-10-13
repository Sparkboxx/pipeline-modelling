#!/usr/bin/env node
// Renders a Pipeline Diagrams text file.
// Usage: node scripts/render-pipeline.mjs <diagram.pipeline | -> [out-dir] [options]
//   (default)          writes <out-dir>/<name>.svg and <name>-dark.svg
//   --check            only report errors and warnings; exit 1 on errors
//   --mermaid          print the Mermaid version (standard shapes)
//   --mermaid --icons  print the Mermaid version that uses the "pd" icon pack
// "-" reads from stdin and, without an out-dir, writes the light SVG to stdout.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { render, check } from "./pipeline-dsl.mjs";
import { toMermaid } from "./pipeline-mermaid.mjs";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const [file, outDir] = args.filter((a) => !a.startsWith("--"));
if (!file) {
  console.error("usage: node scripts/render-pipeline.mjs <diagram.pipeline | -> [out-dir] [--check] [--mermaid [--icons]]");
  process.exit(2);
}
const src = readFileSync(file === "-" ? 0 : file, "utf8");
const where = file === "-" ? "stdin" : file;
const report = (list, kind) => list.forEach((x) => console.error(`${where}:${x.line}: ${kind}: ${x.message}`));

const { errors, warnings } = check(src);
report(errors, "error");
report(warnings, "warning");
if (errors.length) process.exit(1);
if (flags.has("--check")) process.exit(0);

if (flags.has("--mermaid")) {
  process.stdout.write(toMermaid(src, { icons: flags.has("--icons") }));
  process.exit(0);
}
const { light, dark } = render(src);
if (file === "-" && !outDir) {
  process.stdout.write(light);
  process.exit(0);
}
const name = file === "-" ? "diagram" : basename(file).replace(/\.[^.]+$/, "");
const dir = outDir || dirname(file);
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, `${name}.svg`), light);
writeFileSync(join(dir, `${name}-dark.svg`), dark);
console.log(`wrote ${join(dir, name)}.svg and ${name}-dark.svg`);
