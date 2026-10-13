---
layout: page
title: Install & tools
parent: Text format
nav_order: 1
---

# Install & tools
{: .no_toc }

Everything for the [text format](text-format.html) is in one npm package, [`pipeline-diagrams`](https://www.npmjs.com/package/pipeline-diagrams). It has no dependencies, and works in Node 20 or newer and in the browser.

```sh
npm install pipeline-diagrams
```

1. TOC
{:toc}

## Try it

Edit the text and the diagram follows.

```text
title "Reporting pipeline"

trigger report manual "create report"
store items D "items"
store stats R "statistics"
processor collector PY "data collector"
lambda generator JS "html_report_generator"
store reports S3 "reports"
app portal "report portal"
human analyst "analyst"

report -> collector
items, stats -> collector
collector -A-> generator -> reports
reports <-> portal <- analyst

group "reporting pipeline": collector generator reports
note collector "m4.xlarge"
```
{: #pipeline-initial style="display:none"}

<div class="playground">
  <textarea id="pipeline-source" spellcheck="false" aria-label="Pipeline diagram text"></textarea>
  <p class="pipeline-error" id="pipeline-messages" role="status"></p>
  <pipeline-diagram id="pipeline-preview" class="pipeline-output"></pipeline-diagram>
  <p class="playground-actions">
    <button class="btn" type="button" id="download-svg">Download SVG</button>
    <button class="btn" type="button" id="copy-mermaid">Copy as Mermaid</button>
  </p>
</div>

## In JavaScript

```js
import { render, check, parse } from "pipeline-diagrams";
import { toMermaid, iconPack } from "pipeline-diagrams/mermaid";

const { light, dark, warnings } = render(text); // SVG for a light and a dark background
const { errors } = check(text);                 // every error with its line number and a fix
const mermaid = toMermaid(text);                // Mermaid; { icons: true } for the icon version
```

`render` throws when the text has errors; the error has an `errors` list with `line` and `message`. `parse` gives the model without drawing it.

| Import | What |
| ------ | ---- |
| `pipeline-diagrams` | `render`, `check`, `parse`, `layout`, and the lists `KINDS` and `CODES` |
| `pipeline-diagrams/mermaid` | `toMermaid`, and `iconPack` for Mermaid's icon nodes |
| `pipeline-diagrams/browser` | the `<pipeline-diagram>` element and `renderAll` |
| `pipeline-diagrams/html` | `diagramHtml(text)`: a `<picture>` with both SVGs, for static sites |
| `pipeline-diagrams/markdown-it` | markdown-it plugin |
| `pipeline-diagrams/remark` | remark plugin |
| `pipeline-diagrams/bundle` | the browser bundle as one classic script |
| `pipeline-diagrams/icons.json` | the icon pack for Mermaid |

## Command line

```sh
npx pipeline-diagrams diagram.pipeline out/        # out/diagram.svg and out/diagram-dark.svg
npx pipeline-diagrams diagram.pipeline --check     # errors and warnings only; exit code 1 on errors
npx pipeline-diagrams diagram.pipeline --mermaid   # print the Mermaid version (add --icons for the icon version)
cat diagram.pipeline | npx pipeline-diagrams -     # SVG to stdout
```

## On a web page

Load the script once, then write diagrams in a `<pipeline-diagram>` element, or point it at a file:

```html
<script src="https://cdn.jsdelivr.net/npm/pipeline-diagrams@0.2/assets/js/pipeline-diagrams.js"></script>

<pipeline-diagram>
  processor a PY "collector"
  store b S3 "reports"
  a -> b
</pipeline-diagram>

<pipeline-diagram src="reporting.pipeline"></pipeline-diagram>
```

The diagram follows the reader's light or dark mode (set `theme="light"` or `theme="dark"` to fix it), shows errors in place, and lists warnings in its tooltip. Its styles live in a shadow root, so they never mix with the page's.

To turn `pipeline` code blocks into diagrams, call `PipelineDiagrams.renderAll()` after the page has loaded. The [Text format](text-format.html) page does exactly that. The script also exposes `parse`, `check`, `render` and `toMermaid` on `window.PipelineDiagrams`.

With a bundler, `import "pipeline-diagrams/browser"` defines the element and gives you `renderAll`.

## Markdown

- **markdown-it:** `import pipelineDiagrams from "pipeline-diagrams/markdown-it"`, then `md.use(pipelineDiagrams)`.
- **remark:** `import remarkPipelineDiagrams from "pipeline-diagrams/remark"`, then `.use(remarkPipelineDiagrams)`. Keep raw HTML, e.g. with `rehype-raw`.

Both replace a `pipeline` block with a `<picture>` holding the light and the dark SVG.

For other Markdown tools, load the script on the page and call `renderAll`. These two setups are untested:

- **MkDocs Material:** add a `pipeline` custom fence with `fence_div_format` to `pymdownx.superfences`. Add the script to `extra_javascript`, plus one line: `document$.subscribe(() => PipelineDiagrams.renderAll("div.pipeline", { replace: true }))`.
- **Docusaurus:** add the script to `scripts`, and a client module whose `onRouteDidUpdate` calls `PipelineDiagrams.renderAll()`.

## GitHub

GitHub renders Mermaid, but not this format. The Markdown renderer fixes that. It renders every `pipeline` block in your Markdown files to SVG files, and puts a `<picture>` right after each block, between two HTML comments. Running it again updates them in place. With `--mermaid` it inserts a Mermaid version instead, so no image files are needed.

Locally:

```sh
npx -p pipeline-diagrams pipeline-diagrams-markdown docs --out docs/diagrams
```

In a workflow, so the images are always up to date:

```yaml
name: Diagrams
on:
  push:
    paths: ["**.md"]
permissions:
  contents: write
jobs:
  render:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npx -y -p pipeline-diagrams@0.2 pipeline-diagrams-markdown docs --out docs/diagrams
      - run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add -A
          git diff --cached --quiet || (git commit -m "Render pipeline diagrams" && git push)
```

With `--check` nothing changes, and the step fails when a diagram has errors or its images are out of date. That's useful for pull requests.

There is also a GitHub Action that does the same: `uses: Sparkboxx/pipeline-modelling@master`, with the inputs `paths`, `out`, `mermaid` and `check`.

## Obsidian

The plugin is in the package, in `integrations/obsidian/`. Copy that folder to `.obsidian/plugins/pipeline-diagrams/` in your vault, and turn the plugin on under Community plugins. It renders `pipeline` code blocks, and follows Obsidian's light or dark theme.

## Agents

- **The guide:** [pipeline-diagrams-agent-guide.md]({{ '/downloads/pipeline-diagrams-agent-guide.md' | relative_url }}) explains the format in about a page, with an example and a fallback to Mermaid. Give it to any agent.
- **A Claude skill:** the same guide as a skill, in `integrations/claude-skill/pipeline-diagrams/` in the package. Copy that folder to `~/.claude/skills/` (or a project's `.claude/skills/`), and Claude uses it when asked to draw a pipeline.
- **An MCP server:** gives any MCP client four tools: `render_pipeline`, `check_pipeline`, `pipeline_to_mermaid` and `pipeline_guide`. The checks let an agent fix its own mistakes before showing a diagram.

For Claude Code:

```sh
claude mcp add pipeline-diagrams -- npx -y -p pipeline-diagrams pipeline-diagrams-mcp
```

For other clients, add it to their MCP configuration:

```json
{
  "mcpServers": {
    "pipeline-diagrams": {
      "command": "npx",
      "args": ["-y", "-p", "pipeline-diagrams", "pipeline-diagrams-mcp"]
    }
  }
}
```

## Mermaid

`toMermaid`, `--mermaid` and the MCP server convert a diagram to a Mermaid flowchart. See [Mermaid](text-format.html#mermaid) for how the shapes translate. For the icon version, register the icon pack first:

```js
mermaid.registerIconPacks([{
  name: "pd",
  loader: () => fetch("https://cdn.jsdelivr.net/npm/pipeline-diagrams@0.2/downloads/pipeline-diagrams-icons.json").then((r) => r.json()),
}]);
```

## Versions

The package follows [semantic versioning](https://semver.org). The format is at version 0.2: while it is below 1.0, a minor version (0.3) may change the format, so pin the minor version, as in the examples on this page (`@0.2`).

The source, issues and changes are on [GitHub](https://github.com/Sparkboxx/pipeline-modelling). The package is MIT licensed.

<script src="{{ '/assets/js/pipeline-diagrams.js' | relative_url }}"></script>
<script>
(function () {
  var source = document.getElementById("pipeline-source");
  var preview = document.getElementById("pipeline-preview");
  var messages = document.getElementById("pipeline-messages");
  if (!source || !preview || !window.PipelineDiagrams) return;
  /* the starting text lives in a hidden code block: the page's HTML compression
     keeps line breaks in code blocks, but not in a <textarea> */
  var initial = document.querySelector("#pipeline-initial code");
  if (initial && !source.value) source.value = initial.textContent;
  function draw() {
    preview.source = source.value;
    var out = preview.result;
    if (out) {
      messages.textContent = out.warnings.map(function (w) { return "line " + w.line + ": " + w.message; }).join("\n");
    } else {
      var c = window.PipelineDiagrams.check(source.value);
      messages.textContent = c.errors.map(function (e) { return "line " + e.line + ": " + e.message; }).join("\n");
    }
  }
  var timer;
  source.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(draw, 150); });
  document.getElementById("download-svg").addEventListener("click", function () {
    if (!preview.result) return;
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([preview.result.light], { type: "image/svg+xml" }));
    a.download = "pipeline.svg";
    a.click();
  });
  document.getElementById("copy-mermaid").addEventListener("click", function () {
    var button = this;
    try {
      navigator.clipboard.writeText(window.PipelineDiagrams.toMermaid(source.value)).then(function () {
        button.textContent = "Copied";
        setTimeout(function () { button.textContent = "Copy as Mermaid"; }, 1500);
      });
    } catch (e) {
      messages.textContent = e.message;
    }
  });
  draw();
})();
</script>
