---
layout: page
title: Templates & tools
nav_order: 8
---

# Templates & tools

Pipeline Diagrams are made to be drawn by hand. But sooner or later a diagram ends up in a slide deck, a wiki or a design doc. This page lists the templates you can download, a text format you (or an AI agent) can write diagrams in, and how the notation fits in other tools.

Everything here is generated from the same shape definitions as the diagrams on this site (`scripts/shapes.mjs`), so all templates look the same and stay in sync.

## Downloads

| Template | Use it in | Download |
| -------- | --------- | -------- |
| draw.io library | draw.io / diagrams.net, the draw.io apps for Confluence, VS Code, desktop | [pipeline-diagrams.drawio.xml]({{ '/downloads/pipeline-diagrams.drawio.xml' | relative_url }}) |
| Excalidraw library | excalidraw.com, Excalidraw+, Obsidian Excalidraw | [pipeline-diagrams.excalidrawlib]({{ '/downloads/pipeline-diagrams.excalidrawlib' | relative_url }}) |
| Icon pack (SVG) | PowerPoint, Keynote, Miro, Lucidchart, Figma, FigJam, anything that takes SVG | [pipeline-diagrams-icons.zip]({{ '/downloads/pipeline-diagrams-icons.zip' | relative_url }}) |

All three contain the same 19 shapes: processor, lambda processor, data store, the four triggers, the five flows, other, external, user facing app, human, annotation, list and grouping.

### draw.io

The library uses native draw.io shapes. Letter codes and names are text you can edit (double-click), arrows stay attached to the shapes, and colors follow draw.io's light or dark theme.

1. Go to [draw.io](https://app.diagrams.net) and create a new diagram.
2. Select `File` › `Open Library from` › `URL`.
3. Enter `https://pipeline-diagrams.com/downloads/pipeline-diagrams.drawio.xml`.
{: .steps }

Or open draw.io with the library loaded: [app.diagrams.net with Pipeline Diagrams](https://app.diagrams.net/?splash=0&clibs=Uhttps%3A%2F%2Fpipeline-diagrams.com%2Fdownloads%2Fpipeline-diagrams.drawio.xml). You can also download the file and use `File` › `Open Library from` › `Device`.

The [old library](https://raw.githubusercontent.com/Sparkboxx/pipeline-modelling/master/attachments/Data%20Pipeline.xml) is still available.

### Excalidraw

Excalidraw keeps the whiteboard feel: the shapes look hand drawn. The items are native Excalidraw elements, not images. Letter codes are text inside the shape, names are separate text below it, and arrows you draw snap to the shapes.

1. Download [pipeline-diagrams.excalidrawlib]({{ '/downloads/pipeline-diagrams.excalidrawlib' | relative_url }}).
2. Open [excalidraw.com](https://excalidraw.com) and open the library panel.
3. In the library menu, select `Open` and pick the file. The shapes are added to your library.
{: .steps }

### Icon pack

Plain SVG files without names: just the shapes. `dark-lines/` is for light backgrounds, `light-lines/` for dark backgrounds. Trigger letters are drawn as lines, so they don't depend on a font.

* **PowerPoint**: `Insert` › `Pictures`, then right-click › `Convert to Shape` to change line colors and widths. Add letter codes and names as text boxes. (Convert to Shape may be missing in some Mac versions.)
* **Keynote**: drag the SVG onto a slide. Use `Format` › `Shapes and Lines` › `Break Apart` if you want to edit it.
* **Google Slides**: does not accept SVG. Convert in PowerPoint first and import the slide, or use a screenshot.
* **Miro**: on Business and Enterprise plans, upload the SVGs as custom shapes (`Shapes` › `More shapes` › upload). On other plans, upload them as images.
* **Lucidchart**: `Shapes` › `Import SVG` into a custom shape library.
* **Figma and FigJam**: drag the SVGs in, or paste them.

## Diagrams as text

Drawing tools are great for people. For docs in git, and for AI agents, text works better: it diffs, it can be reviewed, and an agent can write it. So we made a small text format for Pipeline Diagrams, and a renderer that lays the diagram out and draws it with the same shapes as this site.

```text
title "Reporting pipeline"

trigger report M "create report"
store items D "items"
store stats R "statistics"
store users P "user data"
processor collector PY "data collector"
lambda generator JS "html_report_generator"
store reports S3 "reports"
app portal "report portal"
human analyst "analyst"

report -> collector
items, stats, users -> collector
collector -A-> generator -> reports
reports <-> portal
analyst -> portal

group "reporting pipeline": collector generator reports
```
{: #pipeline-example }

Edit the text and the diagram follows:

<div class="playground">
  <textarea id="pipeline-source" spellcheck="false" aria-label="Pipeline diagram source"></textarea>
  <p class="pipeline-error" id="pipeline-error" role="status"></p>
  <div class="pipeline-output" id="pipeline-output"></div>
  <p><button class="btn" type="button" id="pipeline-download">Download SVG</button></p>
</div>

### The format

One statement per line. `#` starts a comment.

| Statement | Example | Meaning |
| --------- | ------- | ------- |
| `kind id [CODE] ["name"]` | `store items S3 "items"` | Declares a shape. The code is the letter code inside the shape, the name goes below it. |
| `a -> b` | `report -> collector` | Flow. |
| `a <-> b` | `reports <-> portal` | Synchronous flow. |
| `a -A-> b` | `collector -A-> generator` | Asynchronous flow. |
| `a -N-> b` | `kafka -N-> enrich` | Streaming or evented flow. |
| `a -Q-> b` | `enrich -Q-> workers` | Queued flow. |
| `a, b -> c -> d "name"` | `items, stats -> collector` | Lists and chains. A quoted name at the end labels the last flow. |
| `group "name": a b c` | `group "vpc": collector reports` | Dashed grouping box around the shapes. |
| `title "text"` | `title "Reporting pipeline"` | Title for screen readers. |
| `note id "text"` | `note collector "m4.xlarge\nmin: 0"` | Annotation next to a shape. End the line with `:` to put the text on indented lines below. |

The [Text format](text-format.html) page has the full specification.

Kinds: `processor`, `lambda`, `store`, `trigger`, `other` (the code is the text inside, e.g. `other kafka KAFKA "clicks"`), `external`, `app` (user facing app), `human` and `list`.

### Use it with agents

Give your agent this page, or just the table above, and ask it to write a ` ```pipeline ` block. The renderer gives clear errors (`line 4: "users" is not declared`), so an agent can fix its own mistakes. To turn a file into SVG (a light and a dark version):

```sh
node scripts/render-pipeline.mjs my-pipeline.pipeline images/
```

The renderer is a proof of concept. The layout is simple (left to right, straight arrows), so large diagrams with many crossing flows will need a hand-drawn version. Annotations are not supported yet.

### What about Mermaid?

Mermaid is rendered by GitHub, GitLab, Notion, Obsidian and many wikis, and agents already know it. Since Mermaid 11.3 flowcharts have enough shapes to come close:

```text
flowchart LR
  report@{ shape: tri, label: "M" }
  items@{ shape: div-rect, label: "D" }
  collector@{ shape: circle, label: "PY" }
  reports@{ shape: div-rect, label: "S3" }
  report --> collector
  items --> collector
  collector -- A --> reports
```

A triangle for triggers, a circle for processors and a "divided rectangle" that looks like our data store. What you lose: names can't go below the shapes (a shape has one label, so it's the code or the name), there are no lambda lines, no user facing app or human, and the flow marks become text labels. Good enough where Mermaid is the only option. Mermaid can also load a complete custom diagram type (`registerExternalDiagrams`), so our renderer could become a Mermaid plugin, but that only works on sites where you control the Mermaid setup, not on GitHub.

## All options compared

| Option | What you get | Editable? | Works for anyone? | Effort | Verdict |
| ------ | ------------ | --------- | ----------------- | ------ | ------- |
| **draw.io library** | Shape library, opened by URL | Yes: native shapes, text, attached arrows | Yes, free, no account | Done | Use it |
| **Excalidraw library** | Hand-drawn shapes for a whiteboard tool | Yes: native elements, bound text | Yes, free, no account | Done | Use it |
| **Icon pack (SVG)** | Files for slides and other tools | Partly: PowerPoint and Keynote can convert SVG to shapes; codes and names are text boxes | Yes | Done | Use it |
| **Text format** | Diagrams in markdown, written by people or agents | It's text | Yes | Done (proof of concept) | Develop further |
| **Mermaid** | Rendered on GitHub, Notion and wikis | It's text | Yes | Small: a style guide | Document as a fallback |
| **Miro** | Custom shape pack or a template board | Shape packs: only recolor and resize | Shape packs need Business or Enterprise | Small | Icon pack is enough |
| **Figma / FigJam** | Components in a Community file | Yes, as components | Anyone can duplicate a Community file; publishing a team library needs a paid plan | Medium, manual | Later, if asked for |
| **PowerPoint template (.pptx)** | Slides with native, editable shapes | Yes | Yes | Medium (generate with a library like PptxGenJS) | Later, if asked for |
| **Lucidchart** | SVG import into a custom library | Recolor and resize only | Depends on the plan | Small | Icon pack is enough |
| **Visio (.vssx)** | Stencil | Yes | Needs Visio; creating stencils needs Visio desktop on Windows | Large | Skip |
| **Own editor** | A whiteboard made for this notation | Yes | Yes, if we host it | Large | Only if the text format takes off |

### Notes per tool

* **draw.io** stores a library as a small XML file with a list of shapes. Shapes draw.io doesn't have (the data store, lambda processor, user facing app, human and list) are built in as inline stencils. draw.io can also export to Visio (`.vsdx`, beta), which is the easiest route to Visio users.
* **Excalidraw** libraries are JSON files (`.excalidrawlib`, version 2). Excalidraw only installs libraries by link from its own [library site](https://libraries.excalidraw.com), so for one-click install we'd have to submit the library there. Until then it's download and open.
* **Miro** custom shapes are SVG files (max 50 KB, up to 100 per pack) and only on Business, Education and Enterprise plans. As far as we could find, they don't hold editable text, and others can't add to a shared pack. A public template board that people can copy is the other route. A Miro app (Web SDK) could create shapes and connectors, but that's a project of its own.
* **Figma / FigJam** can't import a library file. Someone has to build the components in Figma and publish a Community file. A plugin can create shapes with text in FigJam, but would need to be built and maintained.
* **PowerPoint and Keynote** can't import a shape library either. The SVG icon pack is the quick route. A generated `.pptx` with native shapes and connectors would be fully editable, but it's more work.
* **Visio** stencils can only be made with Visio desktop (on Windows you can script it). Visio for the web can import them with a Plan 2 license.

### Building our own editor

If the text format proves popular, a small editor that shows the text and the diagram side by side, and lets you drag things around, is the next step. Options:

* **Excalidraw** (MIT): embed the editor, preload our library, export to and from our text format. Keeps the whiteboard feel. Small to medium effort.
* **React Flow** (MIT): nodes are React components, so the shapes and letter codes become real, structured objects. Best fit for round-tripping with the text format. Medium effort.
* **maxGraph** (Apache 2.0, the successor of the engine behind draw.io) and **JointJS** (MPL 2.0, with a paid JointJS+): solid diagram engines, less whiteboard.
* **tldraw**: the nicest whiteboard SDK with custom shapes, but production use needs a license key (paid, or a free hobby license on request), so less suited for a free public tool.

## Recommendation

1. **Now:** the draw.io library, the Excalidraw library and the icon pack (all on this page). Point the draw.io link on the home page to the new library.
2. **Next:** keep improving the text format, since it's what agents can use. Add annotations and a top-to-bottom layout, and render ` ```pipeline ` blocks on this site automatically. Submit the Excalidraw library to libraries.excalidraw.com for one-click install. Publish a short Mermaid style guide for places where only Mermaid renders.
3. **Later, if there's demand:** a Figma Community file, a generated PowerPoint template, a Miro template board.
4. **Only if the text format takes off:** our own editor, based on Excalidraw or React Flow.

## Regenerating the templates

The templates are generated. After changing a shape in `scripts/shapes.mjs`, run:

```sh
node scripts/diagrams.mjs images
node scripts/templates.mjs downloads
```

<script src="{{ '/assets/js/pipeline-diagrams.js' | relative_url }}"></script>
<script>
(function () {
  var block = document.querySelector("#pipeline-example code");
  var source = document.getElementById("pipeline-source");
  var output = document.getElementById("pipeline-output");
  var error = document.getElementById("pipeline-error");
  var dark = window.matchMedia("(prefers-color-scheme: dark)");
  var last = null;
  if (!source || !window.PipelineDiagrams) return;
  source.value = block ? block.textContent.trim() + "\n" : "";

  function draw() {
    try {
      last = window.PipelineDiagrams.render(source.value);
      output.innerHTML = dark.matches ? last.dark : last.light;
      error.textContent = "";
    } catch (e) {
      error.textContent = e.message;
    }
  }
  var timer;
  source.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(draw, 150); });
  if (dark.addEventListener) dark.addEventListener("change", draw);
  document.getElementById("pipeline-download").addEventListener("click", function () {
    if (!last) return;
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([last.light], { type: "image/svg+xml" }));
    a.download = "pipeline.svg";
    a.click();
  });
  draw();
})();
</script>
