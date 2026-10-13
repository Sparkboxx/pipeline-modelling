---
layout: page
title: Notation
nav_order: 3
has_children: true
has_toc: false
---

# Notation

Pipeline Diagrams use a handful of shapes that anyone can draw on a whiteboard in seconds. Each page below covers one part of the notation: what the shape means, how to draw it, and the letter codes that add detail.

| Part | Shape | What it stands for |
| ---- | ----- | ------------------ |
| [Processors](processors.html) | {% include diagram.html name="def_processor" alt="Processor" %} | Software that takes data in, transforms it and writes it out. Letter codes show the language. |
| [Triggers](triggers.html) | {% include diagram.html name="def_trigger" alt="Trigger" %} | What starts a pipeline: a person, a schedule or an event. |
| [Data Storage](data-storage.html) | {% include diagram.html name="def_data_store" alt="Data store" %} | Any persistent or temporary store, one per table or bucket. Letter codes show the type. |
| [Flow](flow.html) | {% include diagram.html name="def_flow" alt="Flow" %} | How data moves: plain, synchronous, asynchronous, streaming or queued. |
| [Miscellaneous](misc.html) | {% include diagram.html name="def_misc_user_facing" alt="User facing app" %} | Other systems, external and internal systems, user facing apps, humans, annotations, lists and groups. |
| [Rules](rules.html) | {% include diagram.html name="modelling_right" alt="A diagram drawn by the rules" %} | A few guidelines that keep diagrams readable. |

To draw the notation in a tool, see [Drawing tools](templates.html). To generate diagrams from text, see [Diagrams as code](diagrams-as-code.html).
