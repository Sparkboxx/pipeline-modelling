// Renders a Pipeline Diagrams text file to a light and a dark SVG.
// Usage: node scripts/render-pipeline.mjs diagram.pipeline [out-dir]
//   writes <out-dir>/<name>.svg and <out-dir>/<name>-dark.svg
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { render } from "./pipeline-dsl.mjs";

const [file, outDir] = process.argv.slice(2);
if (!file) {
  console.error("usage: node scripts/render-pipeline.mjs diagram.pipeline [out-dir]");
  process.exit(2);
}
const name = basename(file).replace(/\.[^.]+$/, "");
const dir = outDir || dirname(file);
try {
  const { light, dark } = render(readFileSync(file, "utf8"));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.svg`), light);
  writeFileSync(join(dir, `${name}-dark.svg`), dark);
  console.log(`wrote ${join(dir, name)}.svg and ${name}-dark.svg`);
} catch (e) {
  console.error(`${file}: ${e.message}`);
  process.exit(1);
}
