---
layout: page
title: In your browser
parent: Diagrams as code
nav_order: 1
---

# In your browser, nothing installed
{: .no_toc }

The whole renderer is one small JavaScript file that runs in your browser. Nothing to install: no Node, no package, no plugin, no agent tools. Your diagram text never leaves your computer: all reading, laying out and drawing happens on your own machine, and nothing is sent to a server. That makes it usable in ordinary agent chats, on locked-down laptops and in secure environments.

1. TOC
{:toc}

## Four ways, none needs an install

| Way | Network | Good for |
| --- | ------- | -------- |
| **[The offline viewer](#the-offline-viewer)**: one HTML file you download once | None at all, works offline | Secure and air-gapped environments, and pasting in diagrams from any chat |
| **[Try it](install.html#try-it)** on this site | Only to load this page | A quick look |
| **[One script tag](#on-your-own-page)** on any web page or HTML file | Once, to load the script | Docs, wikis, dashboards, generated reports |
| **[An agent chat](#in-an-agent-chat)**: paste into the viewer, or let a chat that shows HTML draw it | None, or once to load the script | Chats without tools or MCP |

## What happens where

| Step | Where it happens |
| ---- | ---------------- |
| Loading the script | Once, from the CDN or from your own server, or nowhere when you use the offline viewer. The server sees a request for a JavaScript file, never your diagram. |
| Reading, checking, laying out and drawing the diagram | In your browser, on your computer. |
| Your diagram text | Stays in the page. It is never sent anywhere. |
| SVG downloads, Mermaid copies | Made in your browser. |

The script makes no network requests of its own, and has no tracking or telemetry. The one exception is when you ask for it: `<pipeline-diagram src="diagram.pipeline">` loads that file from wherever you point it.

This website itself counts page views with [GoatCounter](https://www.goatcounter.com), without cookies. It sees which page you visit, never what you type into a diagram. The offline viewer and the script on your own pages count nothing.

**Check it yourself:** open your browser's developer tools on the Network tab and edit a diagram. Nothing is sent. Or open the offline viewer with your network switched off: it keeps working.

## The offline viewer

<p><a class="btn btn-primary" href="{{ '/downloads/pipeline-diagrams-viewer.html' | relative_url }}" download>Download the offline viewer</a></p>

One HTML file of about 65 kB, with the renderer inside. Open it from your disk in any modern browser. Type or paste a diagram on the left, and it is drawn on the right while you type, with errors and warnings. Download the SVG, for a light or a dark background, copy a Mermaid version, or open a `.pipeline` or Markdown file.

It never goes online: no CDN, no fonts, no server. Keep it next to your docs, mail it to a colleague, or put it on a USB stick for an air-gapped machine. Your last diagram is kept in the browser's local storage, on your own machine.

## On your own page

Load the script, then write diagrams in a `<pipeline-diagram>` element:

```html
<script src="https://cdn.jsdelivr.net/npm/pipeline-diagrams@0.2/assets/js/pipeline-diagrams.js"></script>

<pipeline-diagram>
  processor api JS "api"
  store orders P "orders"
  api <-> orders
</pipeline-diagram>
```

This works in any HTML page, including a file you open from disk. The diagram follows light and dark mode. `PipelineDiagrams.renderAll()` turns ```` ```pipeline ```` code blocks into diagrams; `PipelineDiagrams.render(text)` gives you the SVG to use yourself. See [Install & tools](install.html#on-a-web-page) for all options.

### For secure environments

- **Host it yourself.** Copy `pipeline-diagrams.js` to your own server or intranet ([download]({{ '/assets/js/pipeline-diagrams.js' | relative_url }}), or from the npm package), so not even the script comes from outside.
- **Or pin it.** Use an exact version and its hash, so the browser refuses the script if it was changed:

```sh
curl -s https://cdn.jsdelivr.net/npm/pipeline-diagrams@0.2.3/assets/js/pipeline-diagrams.js | openssl dgst -sha384 -binary | openssl base64 -A
```

```html
<script src="https://cdn.jsdelivr.net/npm/pipeline-diagrams@0.2.3/assets/js/pipeline-diagrams.js"
        integrity="sha384-…the hash from the command…" crossorigin="anonymous"></script>
```

- **Content Security Policy.** The script uses no `eval` and needs no network access. It does need inline styles for the diagrams: `style-src 'unsafe-inline'`.

## In an agent chat

The agent doesn't need any tools or MCP server to draw a pipeline. It only writes the text. Two ways to see the diagram:

- **Paste it into the offline viewer.** Ask the agent for a `pipeline` diagram, and copy its answer into the viewer. This works with every chat, and the diagram is drawn on your computer.
- **Let the chat show it.** In chats that can show HTML pages with scripts (artifacts, canvases), ask the agent to put the diagram in a small HTML page that loads the script. Some chats only allow scripts from certain sources; then use the viewer.

```text
Draw our order pipeline as a Pipeline Diagrams diagram (https://pipeline-diagrams.com/agents.html).
Show it as an HTML page that loads
https://cdn.jsdelivr.net/npm/pipeline-diagrams@0.2/assets/js/pipeline-diagrams.js
and puts the diagram text in a <pipeline-diagram> element.
```

Either way, drawing the diagram doesn't send it anywhere: it is drawn in your browser. (The chat itself of course has the text, since the agent wrote it.)
