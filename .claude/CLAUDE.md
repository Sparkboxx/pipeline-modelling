# Pipeline Diagrams

Whiteboard-proof diagrams for data pipelines. This repository is two things:

- **The website** at https://pipeline-diagrams.com: Jekyll with the just-the-docs theme, built and deployed by GitHub Actions (`.github/workflows/pages.yml`) on every push to `master`.
- **The npm package** [`pipeline-diagrams`](https://www.npmjs.com/package/pipeline-diagrams): diagrams as code: the parser, layout and SVG renderer, a Mermaid converter, a web component, Markdown plugins, command line tools and an MCP server. No dependencies.

## Where things are

| Path | What |
| ---- | ---- |
| `*.md` | the website's pages; `diagrams-as-code.md` introduces diagrams as code, `agents.md` covers AI agents, `install.md` the package and tools, and `text-format.md` is the language reference |
| `scripts/shapes.mjs` | the shapes: the single source for every image, template and rendered diagram |
| `scripts/pipeline-dsl.mjs` | the language: parser, layout, SVG renderer |
| `scripts/pipeline-mermaid.mjs` | Mermaid converter and the "pd" icon pack |
| `scripts/pipeline-browser.mjs` | `<pipeline-diagram>` element and `renderAll` |
| `scripts/render-pipeline.mjs`, `scripts/render-markdown.mjs` | command line tools (also the package's `bin`) |
| `integrations/` | markdown-it and remark plugins, Obsidian plugin, MCP server, agent guide, Claude skill |
| `scripts/test/` | tests (`node --test`) |
| `_sass/custom/`, `_includes/` | the site's theme customizations |

## Generated files: never edit by hand

`images/`, `downloads/`, `assets/js/pipeline-diagrams.js`, `integrations/obsidian/main.js`, `integrations/claude-skill/` and `.claude/skills/` are generated. After changing a shape, the renderer or `integrations/agent-guide.md`, run:

```sh
npm run build   # node scripts/diagrams.mjs images && node scripts/templates.mjs downloads
npm test
```

A test fails when the browser bundle is out of date, and every `pipeline` block in the docs must parse and render.

## Conventions

- **Diagrams on the site:** every image exists as `name.svg` (light) and `name-dark.svg`. Show them with `{% include diagram.html name="..." alt="..." %}`, never with `![]()`: Safari ignores dark-mode media queries inside an SVG used as an image, so the page picks the file with `<picture>`.
- **Inline scripts in pages:** the theme compresses each page's HTML onto very few lines. A `//` comment then comments out the rest of the script: use `/* */`. Line breaks survive in `<pre>` and code blocks, but not in a `<textarea>`: put starting text in a hidden code block and copy it in with JavaScript (see `install.md`).
- **Slides:** a page that loads `assets/js/slides.js` gets a "Present as slides" button (see `workshop.md`). Every h2 and h3 starts a slide; `{: .notes }` marks facilitator notes (on the page, not on slides), `{: .page-only }` and `{: .slides-only }` show content in one of the two only, and `{: .hidden-source }` on a `pipeline` block shows only its diagram.
- **Live examples:** a ```` ```pipeline ```` block on a page is drawn by `PipelineDiagrams.renderAll()` when the page loads the bundle and calls it (see `text-format.md`).
- **Language changes:** update the parser, the language reference (`text-format.md`, including the grammar and the error tables), the agent guide, and the tests together.
- **Writing:** plain, short sentences, as on the existing pages. Name things the way the notation does: processor, data store, trigger, flow.
- **Commits and pull requests:** work on a branch and open a pull request against `master`; CI builds the site and runs the tests.

## Releasing the npm package

1. Raise `version` in `package.json`, `VERSION` in `scripts/pipeline-dsl.mjs` and `integrations/obsidian/manifest.json`.
2. `npm run build && npm test`, merge to `master`.
3. The maintainer publishes from their own terminal with `npm publish --access public --auth-type=web` (two-factor authentication with a passkey). Claude doesn't publish: `npm publish` is denied in `.claude/settings.json`.

## Local preview

```sh
bundle exec jekyll serve --livereload   # http://localhost:4000
```

Restart it after changing `_config.yml`.
