---
layout: page
title: Workshop
nav_order: 4
---

# Workshop: pipelines on paper

Draw your own pipelines on paper. Name them, add details, find what breaks first. No laptops.

A workshop of two and a half hours, for groups of 2 to 4. This page is the whole workshop: read it to prepare, or present it as slides with the button above. Notes marked *Facilitator* are only on the page.
{: .page-only }

## Schedule

| Time | Part | Minutes |
| ---- | ---- | ------- |
| 0:00 | [The shapes](#the-shapes) | 20 |
| 0:20 | [Exercise 1: draw one full pipeline](#exercise-1-draw-one-full-pipeline) | 30 |
| 0:50 | [Review in pairs](#review-in-pairs) | 15 |
| 1:05 | [Exercise 2: name it, colour it in, break it](#exercise-2-same-groups-same-drawing) | 45 |
| 1:50 | [Central review](#central-review) | 30 |
| 2:20 | [Questions](#questions) | 10 |

You need: a whiteboard or A3 paper per group, markers in black, blue and red, and sticky notes. Each group brings a system they know. All shapes are on [the notation pages](notation.html).

Ask every group to bring a real system: a reporting job, an import, an event stream, a nightly export. Real systems give the best discussions. For groups without one, use the [practice scenario](#practice-scenario).
{: .notes }

## The shapes

### Shapes

| Shape | Means |
| ----- | ----- |
| {% include diagram.html name="def_processor" alt="Processor" %} | Processor: software that takes data in, changes it and writes it out |
| {% include diagram.html name="def_data_store" alt="Data store" %} | Data store: one table, bucket or collection |
| {% include diagram.html name="def_trigger" alt="Trigger" %} | Trigger: what starts a pipeline |
| {% include diagram.html name="def_external" alt="External system" %} | External system: something you don't own (a payment provider, a partner API) |
| {% include diagram.html name="def_internal" alt="Internal system" %} | Internal system: yours, but not the topic now (you can change it if you have to) |
| {% include diagram.html name="def_misc_human" alt="Human" %} | Human: someone who starts, reads or changes something |

Keep the introduction short and visual: about two minutes per slide. People learn the shapes by using them in the first exercise, not by listening. Aim to start drawing within 20 minutes.
{: .notes }

### Arrows

{% include diagram.html name="def_flow" alt="An arrow" %}

- Arrow head = where the data goes.
- Reading from a table? The arrow points at the processor.
- Every line has an arrow head.

The read direction is the one people get wrong: code that queries a database feels like an arrow towards the database, but the data flows to the processor. Data both ways gets two arrow heads. The other rules (names below shapes, never rotated) are on the [Rules](rules.html) page.
{: .notes }

### A pipeline

{% include diagram.html name="example_pipeline" alt="Example pipeline: a 'create report' trigger starts a data collector that reads items, statistics and user data, then a report generator writes to the reports store" %}

- Starts: trigger, human, data store, external or internal system.
- Ends: data store, external or internal system.
- A full pipeline solves one clear problem.

### Sketch first, colour in later

<div class="side-by-side" markdown="1">
<div markdown="1">

```pipeline
store raw "raw data"
processor clean "clean"
processor enrich "enrich"
store report "report"

raw -> clean -> enrich -> report
```
{: .hidden-source }

Sketch first: data goes from here to there.

</div>
<div markdown="1">

```pipeline
trigger nightly timed "nightly"
store raw S3 "raw data"
processor clean PY "clean"
processor enrich PY "enrich"
store report S3 "report"

nightly -> clean
raw -> clean -Q-> enrich -A-> report
note clean "spot instances"
```
{: .hidden-source }

Colour in later, in blue: PY = Python, S3 = bucket.

</div>
</div>

Exercise 1 is black only: no codes, no arrow marks yet.

## Exercise 1: draw one full pipeline

<span class="dot black" aria-label="black marker"></span><span class="timebox">30 minutes</span> Black marker.

- <span class="icons">{% include icon.html name="trigger" alt="trigger" %}{% include icon.html name="human" alt="human" %}{% include icon.html name="data-store" alt="data store" %}{% include icon.html name="external" alt="external system" %}{% include icon.html name="internal" alt="internal system" %}</span> Start: trigger, human, data store, external or internal system.
- <span class="icons">{% include icon.html name="processor" alt="processor" %}</span> Processed? Processor.
- <span class="icons">{% include icon.html name="data-store" alt="data store" %}</span> Stored? One data store per table.
- Too messy? One data store for the whole database first, split later.
- <span class="icons">{% include icon.html name="data-store" alt="data store" %}{% include icon.html name="external" alt="external system" %}{% include icon.html name="internal" alt="internal system" %}</span> End: data store, external or internal system.
- Done when: it starts and ends right, and you can say what problem it solves.
{: .icon-list }

Walk around and look for the common mistakes: lines without arrow heads, names next to shapes, one data store for everything, processors that write nowhere, and groups that add codes or queues already. Keep everyone at the sketch level.
{: .notes }

## Review in pairs

<span class="timebox">15 minutes</span> Two groups together.

- Explain it in 2 minutes.
- Listeners: find one thing that's wrong or missing.
- Check: start, end, names, arrow heads.
- Write it on a sticky note.

Pair groups that work on different systems: explaining a pipeline to outsiders shows quickly where it is unclear. If listeners are stuck, give them the checks out loud as hints.
{: .notes }

## Exercise 2: same groups, same drawing

### <span class="dot black" aria-label="black marker"></span>Name it

<span class="timebox">10 minutes</span>

- Name every path from start to end.
- Short names: "order import", not "flow 1".
- Full pipeline, or part of a bigger one?

Naming the paths is where a team's vocabulary comes from. A path that solves nothing on its own is a sub-pipeline: part of a bigger one.
{: .notes }

### <span class="dot blue" aria-label="blue marker"></span>What is this really?

<span class="timebox">10 minutes</span>

| Arrow | Means |
| ----- | ----- |
| {% include diagram.html name="def_flow_sync" alt="Request and answer" %} | Request and answer |
| {% include diagram.html name="def_flow_async" alt="Asynchronous" %} | Asynchronous: send, don't wait |
| {% include diagram.html name="def_flow_queued" alt="Queue" %} | Queue (SQS, RabbitMQ) |
| {% include diagram.html name="def_flow_streaming" alt="Stream of events" %} | Stream of events (Kafka) |

- Processor: which language? How does it scale?
- Data store: which database? Which table?
- Trigger: manual, timed or event?

Say "switch to blue" out loud. Groups write the answers as [letter codes](processors.html#letter-codes) (PY, JS, [S3, D, P](data-storage.html#data-store-types)), arrow marks, and short notes.
{: .notes }

### <span class="dot red" aria-label="red marker"></span>Break it

<span class="timebox">25 minutes</span>

- One arrow becomes a queue: what breaks?
- 10x the data: what breaks first? Mark it.
- What could stop for a day without anyone noticing?

Say "switch to red" out loud. For groups that finish early: what if it ran on a timer instead of by hand? What if a queue stopped being one? For the last question, go through what is watched today: each data store, compute and scale, queue timings, cost, and the overall timing of the full pipeline and its parts. Mark what is missing in red.
{: .notes }

## Central review

<span class="timebox">30 minutes</span> 3 minutes per group: your path names, your 10x bottleneck, your silent arrow.

Questions to ask each group: Which arrow would you change first, and what would it cost? Which what-if changed your view? Which names will you use from now on? Collect the names and the gaps on a shared board: they are the vocabulary and the to-do list the team takes home.
{: .notes }

## Questions

<span class="timebox">10 minutes</span>

- Take a photo of every whiteboard.
- What will you try next week?
- Next: [type it as text](diagrams-as-code.html).

Want to compare? Ask an AI agent to draw the same pipeline from the code, and put it next to your sketch.
{: .page-only }

## Practice scenario

For groups without a system of their own: a webshop.

- Customers order on the website.
- Orders go into an orders database.
- A payment provider confirms each payment.
- Every paid order gets a confirmation email.
- Every night, orders go to the data warehouse, for the analysts' dashboard.

Things to discover: the order flow and the reporting flow are separate full pipelines; the email is asynchronous (or queued); the nightly export has a timed trigger; at 10x orders, the export and the dashboard queries feel it first.
{: .notes }

<script src="{{ '/assets/js/pipeline-diagrams.js' | relative_url }}"></script>
<script>
if (window.PipelineDiagrams) window.PipelineDiagrams.renderAll("pre > code.language-pipeline");
</script>
<script src="{{ '/assets/js/slides.js' | relative_url }}"></script>
