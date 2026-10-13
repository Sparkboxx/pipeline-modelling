---
layout: page
title: Home
nav_order: 1
permalink: /
---

<div class="hero">
  <p class="hero-eyebrow">Whiteboard-proof diagrams for data pipelines</p>
  <h1 class="hero-title">Draw data pipelines<br>everyone can read.</h1>
  <p class="hero-lede">A handful of simple shapes (circles, squares, triangles and arrows) to design, describe and explain data pipelines. Sketch it on a whiteboard, or describe it in a few lines and let your docs, your CI or your AI agent draw it.</p>
  <div class="hero-actions">
    <a class="btn btn-primary" href="{{ '/notation.html' | relative_url }}">Learn the shapes</a>
    <a class="btn btn-primary" href="{{ '/diagrams-as-code.html' | relative_url }}">Diagrams as code</a>
    <a class="btn" href="#draw-it-in-a-tool">Drawing tools</a>
  </div>
  <figure class="hero-figure">
    {% include diagram.html name="example_pipeline" alt="Example pipeline: a 'create report' trigger starts a data collector that reads items, statistics and user data, then an html_report_generator writes to the reports store" %}
  </figure>
</div>

## Why Pipeline Diagrams

Diagrams help when designing, describing or explaining how systems work. Pipeline Diagrams capture data pipelines (originally on AWS), their components and how they connect.

The notation is *whiteboard proof*: everything can be drawn by hand in seconds, but it works just as well in Keynote, PowerPoint, OmniGraffle, Visio or draw.io.

Models gradually stiffen during a design. Start at a high level with a couple of simple symbols, and add detail, like processor and data store types, once your architecture settles. That keeps the focus at the right level of abstraction.

The method started in 2016 in a fast-growing data team at trivago, and is now revived for the age of AI agents. Read the [origin story](origin.html). Pipeline Diagrams is an independent open source project by Wilco van Duinkerken, not affiliated with trivago.

## Diagrams as code {#diagrams-as-code}

Describe a diagram in a few lines, and let it draw itself: in Markdown next to your code, in CI from your own scripts, or in a chat with an AI agent. It runs in your browser with nothing to install, and your diagram never leaves your computer.

```pipeline
trigger report manual "create report"
store items D "items"
processor collector PY "data collector"
lambda generator JS "html_report_generator"
store reports S3 "reports"

report, items -> collector -A-> generator -> reports
note collector "m4.xlarge"
```

<div class="shape-grid">
  <a class="shape-card" href="{{ '/browser.html' | relative_url }}">
    <span class="shape-name">In your browser</span>
    <span class="shape-desc">Nothing to install, fully local. Download the offline viewer, or add one script tag.</span>
  </a>
  <a class="shape-card" href="{{ '/agents.html' | relative_url }}">
    <span class="shape-name">For AI agents</span>
    <span class="shape-desc">Claude and other agents draw, check and fix pipeline diagrams with an MCP server or a skill.</span>
  </a>
  <a class="shape-card" href="{{ '/install.html' | relative_url }}">
    <span class="shape-name">npm install pipeline-diagrams</span>
    <span class="shape-desc">JavaScript, command line, web pages, Markdown, GitHub and Obsidian. <em>Try it</em> in the browser.</span>
  </a>
  <a class="shape-card" href="{{ '/text-format.html' | relative_url }}">
    <span class="shape-name">Language reference</span>
    <span class="shape-desc">Every shape, flow, group and note, with live examples.</span>
  </a>
</div>

## What is a pipeline

A pipeline is any path that manipulates and stores data. It starts at a trigger or event, data gets processed, and it ends in a data store. You can often spot pipelines by following the arrows that connect two data stores. A pipeline can consist of many other pipelines.

If you can slap a name on a process between two data stores, it probably is, or should become, a pipeline.

## The basic shapes

<div class="shape-grid">
  <a class="shape-card" href="{{ '/processors.html' | relative_url }}">
    <div class="shape-img">{% include diagram.html name="def_processor" alt="" %}</div>
    <span class="shape-name">Processor</span>
    <span class="shape-desc">A circle. Takes input data, transforms it and writes the output.</span>
  </a>
  <a class="shape-card" href="{{ '/data-storage.html' | relative_url }}">
    <div class="shape-img">{% include diagram.html name="def_data_store" alt="" %}</div>
    <span class="shape-name">Data store</span>
    <span class="shape-desc">A square with a bar on top. Any persistent or temporary store.</span>
  </a>
  <a class="shape-card" href="{{ '/triggers.html' | relative_url }}">
    <div class="shape-img">{% include diagram.html name="def_trigger" alt="" %}</div>
    <span class="shape-name">Trigger</span>
    <span class="shape-desc">A triangle. Kicks off a pipeline: manual, timed or evented.</span>
  </a>
  <a class="shape-card" href="{{ '/flow.html' | relative_url }}">
    <div class="shape-img short">{% include diagram.html name="def_flow" alt="" %}</div>
    <span class="shape-name">Flow</span>
    <span class="shape-desc">An arrow. Synchronous, asynchronous, queued or streaming.</span>
  </a>
  <a class="shape-card" href="{{ '/misc.html#other-kinds-of-systems' | relative_url }}">
    <div class="shape-img">{% include diagram.html name="def_other" alt="" %}</div>
    <span class="shape-name">Other</span>
    <span class="shape-desc">A rectangle with the name of the system inside.</span>
  </a>
  <div class="shape-card">
    <div class="shape-img">{% include diagram.html name="def_external" alt="" %}</div>
    <span class="shape-name">External</span>
    <span class="shape-desc">A filled rectangle. A black box outside your boundaries.</span>
  </div>
</div>

There are also symbols for [user facing apps, humans, annotations, lists and grouping](misc.html), and a few [rules](rules.html) that keep diagrams readable. The [notation](notation.html) section has them all.

## Draw it in a tool {#draw-it-in-a-tool}

- **draw.io:** [open draw.io with the shapes loaded](https://app.diagrams.net/?splash=0&clibs=Uhttps%3A%2F%2Fpipeline-diagrams.com%2Fdownloads%2Fpipeline-diagrams.drawio.xml), or add the library to a diagram with `File` › `Open Library from` › `URL`, using `https://pipeline-diagrams.com/downloads/pipeline-diagrams.drawio.xml`.
- **Excalidraw:** a library for the whiteboard feel.
- **PowerPoint, Keynote, Miro, Figma:** an icon pack.

All of them are on the [Drawing tools](templates.html) page.

<script src="{{ '/assets/js/pipeline-diagrams.js' | relative_url }}"></script>
<script>
if (window.PipelineDiagrams) window.PipelineDiagrams.renderAll("pre > code.language-pipeline");
</script>
