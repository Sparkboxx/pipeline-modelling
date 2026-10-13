---
layout: page
title: Workshop
nav_order: 4
---

# Workshop: pipelines on paper

A hands-on workshop for teams: model your own data pipelines with pen and paper, name them, colour in the details, and find out what would break first. No laptops and no agents, just whiteboards, paper and markers.

This page is the whole workshop: read it to prepare, or present it as slides with the button above. Notes marked *Facilitator* are only on the page, not on the slides.
{: .page-only }

## Schedule

| Time | Part | Minutes |
| ---- | ---- | ------- |
| 0:00 | [The shapes](#the-shapes) | 30 |
| 0:30 | [Exercise 1: sketch a full pipeline](#exercise-1-sketch-a-full-pipeline) | 30 |
| 1:00 | [Review in pairs](#review-in-pairs) | 15 |
| 1:15 | [Exercise 2: name it, colour it in, ask what if](#exercise-2-name-it-colour-it-in-ask-what-if) | 60 |
| 2:15 | [Central review](#central-review) | 30 |
| 2:45 | [Questions](#questions) | 15 |

**You need:** a whiteboard or A3 paper per group, markers in three colours (black for the structure, blue for details, red for "what if"), sticky notes, and a printed [shape sheet](notation.html). Groups of 2 to 4 people, each with a real system they know.

Ask every group before the workshop to bring a system they work on: a reporting job, an import, an event stream, a nightly export. Real systems give the best discussions. For groups without one, use the [practice scenario](#practice-scenario).
{: .notes }

## The shapes

### The idea

- Simple shapes anyone can draw in seconds.
- **Sketch first:** where does data come from, what processes it, where does it end up?
- **Colour in later:** once the team agrees, add the details.

<span class="timebox">30 minutes</span>

Keep the introduction short and visual. People learn the shapes by using them in the first exercise, not by listening. Aim to start sketching within 30 minutes.
{: .notes }

### Shapes

| Shape | Means |
| ----- | ----- |
| {% include diagram.html name="def_processor" alt="Processor" %} | **Processor:** software that takes data in, transforms it and writes it out |
| {% include diagram.html name="def_data_store" alt="Data store" %} | **Data store:** one table, bucket or collection |
| {% include diagram.html name="def_trigger" alt="Trigger" %} | **Trigger:** what starts a pipeline: manual, timed or an event |
| {% include diagram.html name="def_external" alt="External system" %} | **External system:** a black box outside your boundary |
| {% include diagram.html name="def_misc_human" alt="Human" %} | **Human:** someone who starts, reads or changes something |

### Flows

| Line | Means |
| ---- | ----- |
| {% include diagram.html name="def_flow" alt="Flow" %} | Data goes from here to there |
| {% include diagram.html name="def_flow_sync" alt="Synchronous flow" %} | Synchronous: a request and its answer |
| {% include diagram.html name="def_flow_async" alt="Asynchronous flow" %} | Asynchronous |
| {% include diagram.html name="def_flow_queued" alt="Queued flow" %} | Through a queue |
| {% include diagram.html name="def_flow_streaming" alt="Streaming flow" %} | Streaming or evented |

The arrow head is where the data goes. A process that reads from a data store has the arrow head at the process.
{: .notes }

### A pipeline

{% include diagram.html name="example_pipeline" alt="Example pipeline: a 'create report' trigger starts a data collector that reads items, statistics and user data, then an html_report_generator writes to the reports store" %}

- Starts at a **trigger, human, external system or data store**.
- Ends in a **data store or external system**.
- Solves a **clear problem** or achieves a clear task.

### Sketch first

```pipeline
store raw "raw data"
processor clean "clean"
processor enrich "enrich"
store report "report"

raw -> clean -> enrich -> report
```
{: .hidden-source }

"Data goes from here to there." No details yet: agree on this first.

### Colour in later

```pipeline
trigger nightly timed "nightly"
store raw S3 "raw data"
processor clean PY "clean"
lambda enrich JS "enrich"
store report RS "report"

nightly -> clean
raw -> clean -Q-> enrich -A-> report
note clean "m5.large\nspot instances"
```
{: .hidden-source }

Is it immediate, asynchronous, queued? Which language? Which kind of store? How does it scale?

### The rules

- Every processor, data store and external system has a **name**.
- Names go **below** a shape, never rotated.
- Every line has an **arrow head**. Data both ways: two heads.

See [Rules](rules.html) for examples of right and wrong.
{: .notes }

## Exercise 1: sketch a full pipeline

<span class="timebox">30 minutes</span> Groups of 2 to 4, one whiteboard or sheet per group, black marker only.

### 1. Pick a starting point

Start your flow with:

- a **data source** (a data store),
- a **trigger**,
- a **human**,
- or an **external system**.

### 2. Follow the data

- Reason through the steps the data takes.
- Is it **processed**? Draw a circle.
- Is it **stored**? Draw a data store box.
- **Draw lines** between data stores, processors and triggers.

### 3. One box per table

- Draw a data store box per **table** (or bucket) you read from or write to.
- Too messy? Draw one box for the **whole database** first, and split it into tables later.

### 4. Check the ends

- A flow **starts** with a trigger, a human, an external system or a data store.
- A flow **ends** in a data store or an external system.
- A flow that ends in a circle isn't finished: where does the result go?

### 5. Is it a full pipeline?

- A full pipeline **solves a clear problem** or achieves a clear task.
- A model between two data stores that solves nothing by itself is a **sub-pipeline**: a section of a bigger one.
- **Goal:** model one full pipeline, from start to end.

Walk around and look for the common mistakes: lines without arrow heads, names next to shapes, one box for everything, circles that write nowhere, and groups that dive into details too early. Keep everyone at the sketch level: no codes, no queues, no languages yet.
{: .notes }

## Review in pairs

<span class="timebox">15 minutes</span> Two groups together, about 7 minutes each.

- **Explain** your pipeline to the other group in two minutes.
- The other group **checks**: does it start and end right? Does every shape have a name and every line an arrow head? One box per table?
- Is it a **full pipeline**? What problem does it solve?
- Leave **one question** for the other group, on a sticky note.

Pair groups that work on different systems: explaining a pipeline to outsiders shows quickly where it is unclear.
{: .notes }

## Exercise 2: name it, colour it in, ask what if

<span class="timebox">60 minutes</span> Same groups, same drawing. Blue marker for details, red for "what if".

### 1. Name the paths

<span class="timebox">10 minutes</span>

- Find **every path** from a starting point to an end point.
- Give **each section a name**.
- Flows from data store to data store, and from trigger to data store, can always be named.

Naming the paths is where a team's vocabulary comes from. Encourage short, specific names ("order import", "nightly scoring") over generic ones ("data flow 1").
{: .notes }

### 2. Full or sub?

<span class="timebox">5 minutes</span>

For every named path, ask:

- Is this a **full pipeline**: does it solve a problem or achieve a goal?
- Or is it a **sub-pipeline**: a section of a bigger one?

### 3. Colour it in: what is this really?

<span class="timebox">15 minutes</span>

Look at **every box, circle, arrow and trigger** in the current situation and ask: *"What is this really?"*

- **Circles:** an instance or a serverless function? Which language? How does it scale?
- **Boxes:** which database or bucket? Which table?
- **Arrows:** immediate, asynchronous, queued or streaming?
- **Triggers:** manual, timed or an event?

Add the answers as [letter codes](processors.html#letter-codes), flow marks and short notes, in blue.
{: .notes }

### 4. What if?

<span class="timebox">10 minutes</span>

With the full overview in front of you, ask, in red:

- What if we made **every arrow event-driven**?
- What if we turned **every arrow into a queue**?
- What if we moved things from **manual to timed**?

### 5. Ten times the data

<span class="timebox">10 minutes</span>

- What if we had to process **10x more data**?
- **Which line or circle** would have to change first?
- Mark the bottleneck.

### 6. How do we watch it?

<span class="timebox">10 minutes</span>

How do we monitor the whole pipeline? Do we track:

- **each data store**?
- **compute** and **scale**?
- **queue timings**?
- **costs**?
- **overall timing**, for the full pipeline and for the sub-pipelines?

Groups can mark what is monitored today with a small symbol next to the shape, and what is missing in red. This step often leads to the most concrete follow-ups after the workshop.
{: .notes }

## Central review

<span class="timebox">30 minutes</span> Each group, 3 to 4 minutes, at their whiteboard:

- Your **full pipeline** and its **names**.
- One **"what if"** that changed your view.
- Your **10x bottleneck**.
- One gap in **monitoring**.

Questions to ask each group: Where is the bottleneck? Which line would you change first, and what would it cost? What surprised you? Which names would you use from now on? Collect the names and the gaps on a shared board: they are the vocabulary and the to-do list the team takes home.
{: .notes }

## Questions

<span class="timebox">15 minutes</span>

- Questions, and what to try next week.
- **Take a photo** of every whiteboard.
- Want your drawing as a diagram? [Type it as text](diagrams-as-code.html), or ask an AI agent to draw the same pipeline from the code and compare it with your sketch.

## Practice scenario

For groups without a system of their own: a webshop.

- Customers place **orders on the website**; the orders are stored in an **orders database**.
- A **payment provider** confirms each payment.
- A **confirmation email** is sent for every paid order.
- Every night, orders are **exported to the data warehouse**.
- **Analysts** read a sales dashboard built on the warehouse.

Things to discover: the order flow and the reporting flow are separate full pipelines; the email is asynchronous (or queued); the nightly export is a timed trigger; at 10x orders, the export and the dashboard queries are the first to feel it.
{: .notes }

<script src="{{ '/assets/js/pipeline-diagrams.js' | relative_url }}"></script>
<script>
if (window.PipelineDiagrams) window.PipelineDiagrams.renderAll("pre > code.language-pipeline");
</script>
<script src="{{ '/assets/js/slides.js' | relative_url }}"></script>
