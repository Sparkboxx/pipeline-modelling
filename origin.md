---
layout: page
title: Origin story
nav_order: 6
---

# Origin story
{: .no_toc }

Pipeline Diagrams started more than ten years ago as the "whiteboard friendly modelling method", in a team at trivago that built a lot of data pipelines, fast. After years of quiet use, Wilco van Duinkerken is reviving it as an independent open source project, because it turns out to be just what AI agents and architecture discussions need.

{: .note }
> **Not a trivago product.** Pipeline Diagrams is an independent open source project by Wilco van Duinkerken. It is not trivago software, and it is not affiliated with, endorsed by or sponsored by trivago. trivago is mentioned on this page only because the method was first used there, and trivago is a trademark of its owner.

1. TOC
{:toc}

## A greenfield at trivago

In this story, "we" is that team at trivago, back then.

In 2016 trivago started a team in Amsterdam with one job: collect as much information about hotels as possible, and prepare it to feed the search engine. That meant many different data flows: extraction, text analysis, transformation, ranking, scoring, vectorising, and all kinds of other ways to improve the hotel search.

The content department that built these pipelines was in a unique position. Our work added to the core trivago systems, so we had something close to a greenfield in technology. Building up a large team from scratch, on a greenfield, was amazing. But it also meant we needed a good way to quickly sketch and organise our thoughts about pipelines and architectures.

When a team grows fast, and people move between teams all the time, you need a simple way to sketch a pipeline and an architecture: to onboard people, and to have thoughtful discussions. We needed something that works for a high-level conversation, and just as well for diving deep. So we developed the "whiteboard friendly modelling method".

## Sketch first, colour in later

The method lets you sketch a data flow on a whiteboard in seconds. And it's designed so you can "colour in" the details later.

You start with "data goes from here to there":

```pipeline
store raw "raw hotel data"
processor analyse "text analysis"
processor score "scoring"
store index "search index"

raw -> analyse -> score -> index
```

Once everyone agrees on that design, you ask the next questions. Does the data go there right away? Asynchronously? Through a queue? On an event? The same goes for every processor. Data needs to be wrangled, so you draw a circle. Once you agree on the design, you colour in the circle. Does it run on an instance, or as a serverless function? Which language will we write it in? How will it scale?

```pipeline
trigger arrival event "new hotel data"
store raw S3 "raw hotel data"
processor analyse PY "text analysis"
list scorers "scoring": quality, location, reviews
other search ELASTIC "search index"

arrival -> analyse
raw -> analyse -Q-> scorers -N-> search
note analyse "spot instances\nmax 50"
group "content ingestion": analyse scorers
```

Same pipeline, same shapes, more detail. Each step is a small addition to the drawing.

## One line, a lot of meaning

We went as far as having default templates for simple symbols. An arrow with a single line across it, a [queued flow](flow.html), meant:

- We use an SQS queue (not FIFO, so take care of idempotency).
- We use a dead-letter queue.
- We monitor both queues with a standard set of operational monitors.

That's a lot of power for a single line. There are many ways to make the model operational like this: agree as a team what a symbol means, and a diagram becomes a specification.

## Reading diagrams like schematics

We also got good at spotting problems in the drawings: scalability issues, synchronous calls that shouldn't be, central bottlenecks. Once you get the hang of it, you can almost read a well-drawn diagram like an electronics schematic.

- **Name the flows.** Any flow from data store to data store, or from trigger to data store, can be named. Doing that naturally gives a team a shared vocabulary for its pipelines.
- **Ask for numbers.** It becomes natural to ask for timings and statistics between two points in a pipeline, and to talk about how to make it faster.
- **Change the lines, not the system.** More reliability means more marks on the lines: queues. More speed means streams or asynchronous calls. Small additions to the drawing, big decisions for the system.

## The people

The first push for the method came from Wilco van Duinkerken. Joost Ronkes Agerbeek then documented it and trained people in it. Dozens of team members adopted it and perfected it. To this day, former team members use it to talk about data flows and architecture.

Today, Pipeline Diagrams is maintained by Wilco van Duinkerken as an independent open source project, under the MIT license. Contributions are welcome on [GitHub](https://github.com/Sparkboxx/pipeline-modelling).

## Why it's coming back now

After several years of rest, the method is back as an independent open source project, for two reasons.

**It's a great fit for AI agents.** Ask an agent to analyse a code base, or explain how data moves through it, and a pipeline diagram is the answer you can actually read. Because the method works at different depths, from a rough sketch to every queue and language, it isn't as overpowering as broader modelling methods. You can ask for the sketch first, and the details where you need them.

**Architecture is the next frontier.** Many developers no longer write all the code themselves; agents do a lot of it. They happily build and add things in all kinds of directions. To give your agents direction, and keep them on the right path, you need to be able to draw and express an architecture, in a way that both you and the agent understand. A visual language that is also simple text does exactly that. That's why the notation now comes with [diagrams as code](diagrams-as-code.html), and works [with AI agents](agents.html).

<script src="{{ '/assets/js/pipeline-diagrams.js' | relative_url }}"></script>
<script>
if (window.PipelineDiagrams) window.PipelineDiagrams.renderAll("pre > code.language-pipeline");
</script>
