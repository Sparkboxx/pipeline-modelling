---
layout: page
title: Drawing tools
nav_order: 3
---

# Drawing tools

Pipeline Diagrams are made to be drawn by hand. But sooner or later a diagram ends up in a slide deck, a wiki or a design doc. This page has the shape libraries and icons you can download, and how the notation fits in other tools. To write diagrams as text instead, see [Text format](text-format.html).

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

Drawing tools are great for people. For docs in git, and for AI agents, text works better: it diffs, it can be reviewed, and an agent can write it. The [text format](text-format.html) describes a diagram in a few lines, and the npm package [`pipeline-diagrams`](install.html) lays it out and draws it with the same shapes as this site. It also converts diagrams to Mermaid, for places that only render Mermaid. [Try it](install.html#try-it).

## All options compared

| Option | What you get | Editable? | Works for anyone? | Effort | Verdict |
| ------ | ------------ | --------- | ----------------- | ------ | ------- |
| **draw.io library** | Shape library, opened by URL | Yes: native shapes, text, attached arrows | Yes, free, no account | Done | Use it |
| **Excalidraw library** | Hand-drawn shapes for a whiteboard tool | Yes: native elements, bound text | Yes, free, no account | Done | Use it |
| **Icon pack (SVG)** | Files for slides and other tools | Partly: PowerPoint and Keynote can convert SVG to shapes; codes and names are text boxes | Yes | Done | Use it |
| **Text format** | Diagrams in markdown, written by people or agents | It's text | Yes | Done | Use it |
| **Mermaid** | Rendered on GitHub, Notion and wikis | It's text | Yes | Done: a converter and an icon pack | Use it as the fallback |
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

1. **Done:** the draw.io library, the Excalidraw library and the icon pack (all on this page), and the [text format](text-format.html) with its [npm package](install.html) and Mermaid converter.
2. **Next:** submit the Excalidraw library to libraries.excalidraw.com for one-click install.
3. **Later, if there's demand:** a Figma Community file, a generated PowerPoint template, a Miro template board.
4. **Only if the text format takes off:** our own editor, based on Excalidraw or React Flow.

## Regenerating the templates

The templates are generated. After changing a shape in `scripts/shapes.mjs`, run:

```sh
node scripts/diagrams.mjs images
node scripts/templates.mjs downloads
```
