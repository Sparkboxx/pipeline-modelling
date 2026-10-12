---
layout: page
title: Home
nav_order: 1
permalink: /
---

<div class="hero">
  <p class="hero-eyebrow">Whiteboard-proof diagrams for data pipelines</p>
  <h1 class="hero-title">Draw data pipelines<br>everyone can read.</h1>
  <p class="hero-lede">A handful of simple shapes (circles, squares, triangles and arrows) to design, describe and explain data pipelines. Sketch it on a whiteboard, refine it in draw.io.</p>
  <div class="hero-actions">
    <a class="btn btn-primary" href="{{ '/processors.html' | relative_url }}">Learn the shapes</a>
    <a class="btn" href="#use-it-in-drawio">Get the draw.io library</a>
  </div>
  <figure class="hero-figure">
    {% include diagram.html name="example_pipeline" alt="Example pipeline: a 'create report' trigger starts a data collector that reads items, statistics and user data, then an html_report_generator writes to the reports store" %}
  </figure>
</div>

## Why Pipeline Diagrams

Diagrams help when designing, describing or explaining how systems work. Pipeline Diagrams capture data pipelines (originally on AWS), their components and how they connect.

The notation is *whiteboard proof*: everything can be drawn by hand in seconds, but it works just as well in Keynote, PowerPoint, OmniGraffle, Visio or draw.io.

Models gradually stiffen during a design. Start at a high level with a couple of simple symbols, and add detail, like processor and data store types, once your architecture settles. That keeps the focus at the right level of abstraction.

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

There are also symbols for [user facing apps, humans, annotations, lists and grouping](misc.html), and a few [rules](rules.html) that keep diagrams readable.

## Use it in draw.io {#use-it-in-drawio}

All shapes are available as a [draw.io](https://app.diagrams.net) library. The quickest way: [open draw.io with the library loaded](https://app.diagrams.net/?splash=0&clibs=Uhttps%3A%2F%2Fpipeline-diagrams.com%2Fdownloads%2Fpipeline-diagrams.drawio.xml).

Or add it to a diagram yourself:

1. Go to [draw.io](https://app.diagrams.net) and create a new diagram.
2. From the menu bar, select `File` › `Open Library from` › `URL`.
3. Enter `https://pipeline-diagrams.com/downloads/pipeline-diagrams.drawio.xml`.
{: .steps }

The shapes appear in a new section of the shapes panel on the left. Libraries for Excalidraw and an icon pack for PowerPoint, Keynote and Miro are on the [Templates & tools](templates.html) page.
