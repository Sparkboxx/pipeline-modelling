---
layout: page
title: Diagrams as code
nav_order: 2
has_children: true
has_toc: false
---

<div class="hero">
  <p class="hero-eyebrow">Diagrams as code</p>
  <h1 class="hero-title">Describe the pipeline.<br>Let it draw itself.</h1>
  <p class="hero-lede">Generate data pipeline diagrams from a few lines of text: in your docs, in your CI, and in your AI agents. The layout is automatic, the shapes are the notation's, and every diagram works in light and dark mode. It runs in your browser with nothing to install, and your diagram never leaves your computer.</p>
  <div class="hero-actions">
    <a class="btn btn-primary" href="{{ '/browser.html' | relative_url }}">Use it in your browser</a>
    <a class="btn btn-primary" href="{{ '/agents.html' | relative_url }}">Use it with AI agents</a>
    <a class="btn" href="{{ '/install.html' | relative_url }}">npm install pipeline-diagrams</a>
  </div>
</div>

```pipeline
title "Clickstream"

app shop "web shop"
other kafka KAFKA "clicks"
lambda enrich PY "enrich"
store raw S3 "raw clicks"
store sessions D "sessions"
trigger nightly timed "nightly"
processor export PY "export"
store warehouse RS "warehouse"

shop -N-> kafka -N-> enrich -> raw, sessions
nightly -> export
raw, sessions -> export -> warehouse

group "streaming": kafka enrich
note export "m5.large\nspot instances"
```

## No install, and nothing leaves your computer

The renderer is one small JavaScript file that runs in your browser. You don't need Node, a package or agent tools: [download the offline viewer]({{ '/downloads/pipeline-diagrams-viewer.html' | relative_url }}) (one HTML file that works without a network), or add one script tag to any page. Reading, laying out and drawing all happen on your own machine. Your diagram text is never sent anywhere, so you can use it with sensitive architectures, in ordinary agent chats, and in secure or air-gapped environments. See [In your browser](browser.html).

## Why as code

- **It lives with the system.** The diagram sits in Markdown next to the code it describes, is reviewed in pull requests, and diffs line by line.
- **It stays up to date.** Generate diagrams in CI, from your docs, or from your own scripts that read your jobs, your infrastructure or your data catalog.
- **AI agents can draw it.** The language is small enough for an agent to learn from one page. Every mistake comes back with its line number and a fix, so an agent can draw, check and correct a diagram on its own.
- **It works everywhere.** SVG for web pages and docs, a web component, Markdown plugins, and a Mermaid version for GitHub, Notion and chats.

## Get started

<div class="shape-grid">
  <a class="shape-card" href="{{ '/browser.html' | relative_url }}">
    <span class="shape-name">In your browser</span>
    <span class="shape-desc">No install and fully local: an offline viewer in one HTML file, or one script tag. Your diagram never leaves your computer.</span>
  </a>
  <a class="shape-card" href="{{ '/agents.html' | relative_url }}">
    <span class="shape-name">For AI agents</span>
    <span class="shape-desc">Let Claude or any other agent draw and check pipelines, with an MCP server, a skill or a one-page guide.</span>
  </a>
  <a class="shape-card" href="{{ '/prompts.html' | relative_url }}">
    <span class="shape-name">Useful prompts</span>
    <span class="shape-desc">Copy a prompt, and get a map of every data flow in a repository from one agentic loop.</span>
  </a>
  <a class="shape-card" href="{{ '/install.html' | relative_url }}">
    <span class="shape-name">Install &amp; tools</span>
    <span class="shape-desc">The npm package: JavaScript, command line, web pages, Markdown, GitHub and Obsidian. Try it in the browser.</span>
  </a>
  <a class="shape-card" href="{{ '/text-format.html' | relative_url }}">
    <span class="shape-name">Language reference</span>
    <span class="shape-desc">Every shape, flow, group and note, with live examples, the error messages and the grammar.</span>
  </a>
</div>

## How it works

1. **Describe.** Write the diagram, or let a script or an agent generate it: shapes with a short id, then flows between them.
2. **Check.** Errors come with a line number and a fix, warnings point out unknown codes. Nothing is drawn until the diagram is valid.
3. **Render.** The layout is automatic: columns from left to right or top to bottom, curved flows that don't cross names, groups that keep other shapes out. You get SVG for a light and a dark background, or a Mermaid version.
{: .steps }

## Generate it from your own systems

Because a diagram is just text, any script can write one. For example, from a list of jobs:

```js
import { render } from "pipeline-diagrams";

const jobs = [
  { id: "ingest", code: "PY", reads: ["events"], writes: ["raw"] },
  { id: "aggregate", code: "PY", reads: ["raw"], writes: ["daily"] },
];
const stores = [...new Set(jobs.flatMap((j) => [...j.reads, ...j.writes]))];

const text = [
  ...stores.map((s) => `store ${s} S3 "${s}"`),
  ...jobs.map((j) => `processor ${j.id} ${j.code} "${j.id}"`),
  ...jobs.flatMap((j) => [...j.reads.map((r) => `${r} -> ${j.id}`), ...j.writes.map((w) => `${j.id} -> ${w}`)]),
].join("\n");

const { light, dark } = render(text); // two SVG files for your docs
```

Run it in CI, and the architecture docs follow every change to the jobs.

<script src="{{ '/assets/js/pipeline-diagrams.js' | relative_url }}"></script>
<script>
if (window.PipelineDiagrams) window.PipelineDiagrams.renderAll("pre > code.language-pipeline");
</script>
