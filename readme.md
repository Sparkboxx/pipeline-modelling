# Pipeline Diagrams

Whiteboard-proof diagrams for data pipelines. A handful of simple shapes (circles, squares, triangles and arrows) to design, describe and explain how data moves through your systems. Sketch it on a whiteboard, or describe it in a few lines and let your docs, your CI or your AI agent draw it.

<picture><source srcset="https://pipeline-diagrams.com/images/example_pipeline-dark.svg" media="(prefers-color-scheme: dark)"><img src="https://pipeline-diagrams.com/images/example_pipeline.svg" alt="Example pipeline: a 'create report' trigger starts a data collector that reads items, statistics and user data, then a report generator writes to the reports store"></picture>

**[pipeline-diagrams.com](https://pipeline-diagrams.com)** has the notation, [diagrams as code](https://pipeline-diagrams.com/diagrams-as-code.html) (in [your browser](https://pipeline-diagrams.com/browser.html), with [AI agents](https://pipeline-diagrams.com/agents.html), [install & tools](https://pipeline-diagrams.com/install.html) and the [language reference](https://pipeline-diagrams.com/text-format.html)), and the [drawing tools](https://pipeline-diagrams.com/templates.html).

## Diagrams as code

Describe a diagram in a few lines, and let it draw itself: in Markdown next to your code, in CI from your own scripts, or in a chat with an AI agent:

```pipeline
trigger report manual "create report"
store items D "items"
processor collector PY "data collector"
store reports S3 "reports"

report, items -> collector -> reports
note collector "m4.xlarge"
```

The npm package lays it out and draws it with the shapes of the notation:

```sh
npm install pipeline-diagrams
```

```js
import { render, check } from "pipeline-diagrams";
import { toMermaid } from "pipeline-diagrams/mermaid";

const { light, dark, warnings } = render(text); // SVG for a light and a dark background
const { errors } = check(text);                 // every error, with its line number and a fix
const mermaid = toMermaid(text);                // for GitHub, Notion and chats
```

```sh
npx pipeline-diagrams diagram.pipeline out/       # out/diagram.svg and out/diagram-dark.svg
npx pipeline-diagrams diagram.pipeline --check    # errors and warnings only
```

**No install needed:** the renderer is one JavaScript file that runs in your browser. The [offline viewer](https://pipeline-diagrams.com/downloads/pipeline-diagrams-viewer.html) is a single HTML file that works without a network, and one script tag works on any page. Your diagram text never leaves your computer. See [In your browser](https://pipeline-diagrams.com/browser.html).

It also has a `<pipeline-diagram>` web component, markdown-it and remark plugins, an Obsidian plugin, a Markdown renderer for GitHub, and an MCP server so AI agents can draw, check and fix diagrams themselves. See [For AI agents](https://pipeline-diagrams.com/agents.html), [Install & tools](https://pipeline-diagrams.com/install.html), and the [language reference](https://pipeline-diagrams.com/text-format.html) for every feature.

## The notation

A pipeline is any path that manipulates and stores data. It starts at a trigger or event, data gets processed, and it ends in a data store. If you can slap a name on a process between two data stores, it probably is, or should become, a pipeline.

The notation is whiteboard proof: everything can be drawn by hand in seconds, but it works just as well in Keynote, PowerPoint, OmniGraffle, Visio or draw.io. Start at a high level with a couple of simple symbols, and add detail, like processor and data store types, once your architecture settles.

| Shape | Image | Description |
| ----- | ----- | ----------- |
| Processor  | <picture><source srcset="https://pipeline-diagrams.com/images/def_processor-dark.svg" media="(prefers-color-scheme: dark)"><img src="https://pipeline-diagrams.com/images/def_processor.svg" alt="processor"></picture>   | *Circle with an optional type indication inside. Name Required.* <br><br> A processor is a component that takes input data, processes it and writes its output. This normally means a processor transforms the input data into something new. A processor can be “always on”, or can be triggered by an event or manual action. A processor can take its input and send its output anywhere: a data store, a queue, a stream or another processor. Likewise for its output. |
| Data Store | <picture><source srcset="https://pipeline-diagrams.com/images/def_data_store-dark.svg" media="(prefers-color-scheme: dark)"><img src="https://pipeline-diagrams.com/images/def_data_store.svg" alt="data store"></picture> | *Square with a rectangular bar on top. The main square can contain a type indication. Name required.* <br><br> A data store is a persistent or temporary datastore of any type. The definition is quite liberal. S3 is seen as a key value store and uses the same symbol as a.o. DynamoDB and Postgresql. |
| Trigger    | <picture><source srcset="https://pipeline-diagrams.com/images/def_trigger-dark.svg" media="(prefers-color-scheme: dark)"><img src="https://pipeline-diagrams.com/images/def_trigger.svg" alt="trigger"></picture>       | *Triangle with a possible type indication inside. Name Optional.* <br><br> A trigger is a process that kicks off a pipeline.                                                                                                                                                                            |
| Flow       | <picture><source srcset="https://pipeline-diagrams.com/images/def_flow-dark.svg" media="(prefers-color-scheme: dark)"><img src="https://pipeline-diagrams.com/images/def_flow.svg" alt="flow"></picture>             | *Arrow with at least 1 arrow head that indicates the flow of data. Name optional.* <br><br> Flow is the connection between processors, storage and triggers. Flow comes in different types: synchronous, asynchronous, queued and streaming.                                                                       |
| Other      | <picture><source srcset="https://pipeline-diagrams.com/images/def_other-dark.svg" media="(prefers-color-scheme: dark)"><img src="https://pipeline-diagrams.com/images/def_other.svg" alt="other"></picture>           | *Rectangle, no fill, identifier inside. Name optional.* <br><br> If it isn’t a processor, a data store or a trigger, it’s probably something else. Represented by a rectangle. There are some variations on the “other” icon, but if it fits, write the name of the system in the rectangle. |
| External   | <picture><source srcset="https://pipeline-diagrams.com/images/def_external-dark.svg" media="(prefers-color-scheme: dark)"><img src="https://pipeline-diagrams.com/images/def_external.svg" alt="external"></picture>     | *Rectangle, solid fill. Name required.* <br><br> Sometimes you simply don’t care, do you? When your boundaries are strong it’s often enough to model an external system as a black box: you can't change it. |
| Internal   | <picture><source srcset="https://pipeline-diagrams.com/images/def_internal-dark.svg" media="(prefers-color-scheme: dark)"><img src="https://pipeline-diagrams.com/images/def_internal.svg" alt="internal"></picture> | *Rectangle with one diagonal line. Name required.* <br><br> Like an external system, a box you don't go into right now. But it's yours: you can change it if you really have to. |

There are also symbols for user facing apps, humans, annotations, lists and grouping, and letter codes for languages and data stores. See [the notation](https://pipeline-diagrams.com/notation.html).

## Origin

The method started in 2016 as the "whiteboard friendly modelling method", in a fast-growing team in Amsterdam that built many data pipelines on a greenfield. Wilco van Duinkerken started it, Joost Ronkes Agerbeek documented it and trained people in it, and dozens of team members perfected it. Wilco is reviving it now, as an independent open source project, because it's a great fit for AI agents and architecture discussions. Read the [origin story](https://pipeline-diagrams.com/origin.html).

## Drawing tools

- **draw.io:** [open draw.io with the shapes loaded](https://app.diagrams.net/?splash=0&clibs=Uhttps%3A%2F%2Fpipeline-diagrams.com%2Fdownloads%2Fpipeline-diagrams.drawio.xml), or use `File` > `Open Library from` > `URL` with `https://pipeline-diagrams.com/downloads/pipeline-diagrams.drawio.xml`.
- **Excalidraw:** a library, for the whiteboard feel.
- **PowerPoint, Keynote, Miro, Figma:** an icon pack.

See [Drawing tools](https://pipeline-diagrams.com/templates.html).

## Development

This repository holds the website (Jekyll, deployed to [pipeline-diagrams.com](https://pipeline-diagrams.com) by GitHub Actions) and the npm package.

| Path | What |
| ---- | ---- |
| `*.md` | the pages of the website |
| `scripts/shapes.mjs` | the shapes, the single source for every image, template and diagram |
| `scripts/pipeline-dsl.mjs` | diagrams as code: parser, layout and SVG renderer |
| `scripts/pipeline-mermaid.mjs` | the Mermaid converter and icon pack |
| `scripts/pipeline-browser.mjs` | the `<pipeline-diagram>` element |
| `scripts/render-pipeline.mjs`, `scripts/render-markdown.mjs` | the command line tools |
| `integrations/` | Markdown plugins, Obsidian plugin, MCP server, agent guide and Claude skill |
| `images/`, `downloads/`, `assets/js/pipeline-diagrams.js` | generated |

After changing a shape or the renderer, regenerate and test:

```sh
npm run build    # images/ and downloads/, the browser bundle, the Obsidian plugin and the Claude skill
npm test         # node --test
bundle exec jekyll serve --livereload   # the website on http://localhost:4000
```

To release a new version of the package, raise `version` in `package.json` and run `npm publish --access public --auth-type=web`.

## License

MIT, see [LICENSE](LICENSE).
