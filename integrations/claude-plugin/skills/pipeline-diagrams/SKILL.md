---
name: pipeline-diagrams
description: Draw data pipeline diagrams (processors, data stores, triggers, flows, groups) with the Pipeline Diagrams text format in a ```pipeline code block. Use when asked to draw, sketch, model or explain a data pipeline, ETL job, event stream or data flow between systems.
---

# Pipeline Diagrams: diagrams as code for agents

Use this language to draw data pipelines: where data comes from, what processes it, and where it is stored. Write it in a code block marked `pipeline`. The full language reference is at https://pipeline-diagrams.com/text-format.html.

## The format

One statement per line. `#` starts a comment.

```text
title "Reporting pipeline"                 # optional, drawn above the diagram
direction LR                               # LR (default, left to right) or TB (top to bottom)

kind id [CODE] ["name"]                    # declare every shape before using it
a -> b                                     # flow: data goes from a to b
```

Shape kinds (the code is optional; the name goes below the shape and defaults to the id):

| Kind | Shape | Code |
| ---- | ----- | ---- |
| `processor` | circle | language: `P` `PY` `PHP` `R` `RB` `J` `JS` `J.` `C` `C.` `C+` `C#`, or `Q` query, `K` Kafka stream |
| `lambda` | circle with a big λ | language, as above |
| `store` | data store | `S3` `D` (DynamoDB) `P` (Postgres) `M` (MySQL) `RS` (Redshift) `RD` (Redis) `MC` (Memcached) `SM` (Secrets Manager) `SSM` (SSM Parameter Store) `A` (Aurora) `O` (Oracle) |
| `trigger` | triangle | `manual`, `timed` or `event` (or `M`, `L`, `E`) |
| `other` | rectangle | the system name, drawn inside, e.g. `other kafka KAFKA "clicks"` |
| `external` | grey box: a system you don't go into and can't change (a payment provider, a partner API) | none |
| `internal` | box with one diagonal line: a system of your own you don't go into now, but could change | none |
| `app` | user facing app | none |
| `human` | person | none |
| `list` | several identical processors: `list workers "workers": a, b, c` | none |

Flows (the arrow head is where the data goes):

| Arrow | Meaning |
| ----- | ------- |
| `a -> b` | flow |
| `a <-> b` | synchronous (request and response) |
| `a -A-> b` | asynchronous |
| `a -N-> b` | streaming or evented (Kinesis, Kafka, DynamoDB streams) |
| `a -Q-> b` | queued (SQS); a queue is a flow, not a store: `a -Q-> "orders queue" b` |

Every arrow can also be written reversed: `a <- b` is the same flow as `b -> a` (also `<-A-`, `<-N-`, `<-Q-`).

- Chains and lists: `items, stats -> collector -A-> report -> html, pdf`
- Flow names: right after the arrow or at the end of the line: `a -A-> "nightly" b`, `a -> b "nightly"`
- Groups (an AWS account, a VPC, a team): `group "streaming": kafka enrich`, or a block that can be nested:

```text
group "AWS account" {
  group "VPC" {
    processor api JS "api"
  }
}
```

- Flows to or from a group: `crm -> group "VPC"`
- Notes: `note collector "m4.xlarge\nmin: 0"`, or `note collector:` followed by indented lines. Optional side: `note left|right|above|below id "text"`. On a flow: `note a -> b "every hour"`.

## Example

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
note export "m5.large"
```

## Rules

- Declare every shape once, before or after the flows that use it. Ids start with a letter and use letters, digits, `_` and `-`.
- One kind of thing per shape: a data store per table or bucket, a processor per program.
- Keep names short; put details in a note.
- When a flow points the wrong way, reverse its arrow (`->` becomes `<-`).
- A call that gets an answer back (an API call, a database query) is one synchronous flow: `api <-> db`. Don't draw the response as a second arrow back: it loops across the diagram. The checker warns about plain flows both ways.
- For a large system, draw several diagrams (one per pipeline, or one per group) rather than one huge one.
- Errors name the line and say how to fix it, e.g. `line 4: "users" is not declared. Add e.g.: processor users "users"`. Fix them and try again.
- If you can run commands, check a diagram before showing it: `npx -y pipeline-diagrams diagram.pipeline --check` (or render it: `npx -y pipeline-diagrams diagram.pipeline out/`). With the MCP server, use `check_pipeline` and `render_pipeline`.

## When the diagram can't be rendered

If the place you write to doesn't render `pipeline` blocks (GitHub, most chats):

- In a chat that can show HTML pages with scripts (artifacts, canvases), make a small HTML page that loads `https://cdn.jsdelivr.net/npm/pipeline-diagrams@0.2/assets/js/pipeline-diagrams.js` and puts the diagram text inside a `<pipeline-diagram>` element. It is drawn in the user's browser; nothing is sent anywhere.
- Otherwise, tell the user they can paste the block into the offline viewer, https://pipeline-diagrams.com/downloads/pipeline-diagrams-viewer.html: one HTML file that draws it on their own computer.
- Where Mermaid is shown (GitHub, many wikis), also give a Mermaid version. Convert it with the `pipeline_to_mermaid` tool when it is available, or by hand:

- `processor x PY "name"` becomes `x@{ shape: circle, label: "PY<br>name" }`
- `store x S3 "name"` becomes `x@{ shape: div-rect, label: "S3<br>name" }`
- `trigger x timed "name"` becomes `x@{ shape: tri, label: "L<br>name" }`
- `a -A-> b "name"` becomes `a -->|"A: name"| b`; groups become `subgraph`
