---
layout: page
title: Language reference
parent: Diagrams as code
nav_order: 3
---

# Language reference
{: .no_toc }

The language of [diagrams as code](diagrams-as-code.html). You, a script or an AI agent describe the diagram as plain text, in a code block marked `pipeline`, and a renderer draws it with the shapes from this site.

**Version 0.2.** Every example on this page is rendered live, right below its text, by the same code that renders it everywhere else. To render diagrams yourself, see [Install & tools](install.html): `npm install pipeline-diagrams`.

1. TOC
{:toc}

## Goals

- **Readable without rendering.** Someone who has never seen the format can tell what the diagram shows.
- **Easy to write for people and agents.** Few keywords, one way to say each thing, error messages that say how to fix the problem.
- **Diff friendly.** One statement per line, no coordinates. Layout is automatic.
- **Faithful to the notation.** Every shape and flow type on this site can be expressed.
- **Works where it can't be rendered.** A converter to [Mermaid](#mermaid) gives a version for GitHub, Notion and chat tools.

## A first example

```pipeline
title "Reporting pipeline"

trigger report manual "create report"
store items D "items"
store stats R "statistics"
store users P "user data"
processor collector PY "data collector"
lambda generator JS "html_report_generator"
store reports S3 "reports"

report -> collector
items, stats, users -> collector
collector -A-> generator -> reports
note collector "m4.xlarge\nmin: 0, max: 10"
```

Shapes are declared with a short id. Flows then connect the ids.

## Lines, comments and text

- One statement per line. Empty lines are ignored.
- `#` starts a comment, at the start of a line or after a space. So `C#` as a code keeps its `#`. Lines starting with `%%` (Mermaid's comments) are ignored too.
- Text in double quotes is a name. `\n` starts a new line, `\"` is a quote.
- Keywords are lowercase.
- An **id** starts with a letter and uses letters, digits, `_` and `-`, e.g. `collector`, `user_data`, `s3-raw`. Ids are case sensitive.

```pipeline
# Names can span two lines
processor parser C# "parse\nclick events"   # a comment after a statement
processor quoted "the \"best\" one"
```

## Statements

| Statement | Example |
| --------- | ------- |
| `kind id [CODE] ["name"]` | `store items S3 "items"` |
| `a ARROW b` | `collector -A-> "nightly" generator` |
| `group "name": a b c` | `group "streaming": kafka enrich` |
| `group "name" {` … `}` | a block with shapes inside, can be nested |
| `note [side] id "text"` | `note collector "m4.xlarge"` |
| `note a ARROW b "text"` | `note collector -> generator "every hour"` |
| `title "text"` | `title "Reporting pipeline"` |
| `direction LR` or `TB` | `direction TB` |

### Title

`title "text"` is drawn above the diagram, and is its accessible title (the SVG `<title>`).

### Direction

`direction LR` (the default) lays the diagram out left to right, `direction TB` top to bottom (`TD` works too). In a top to bottom diagram, flows leave a shape below its name.

```pipeline
direction TB
trigger nightly timed "nightly"
processor export PY "export"
store warehouse RS "warehouse"
external crm "CRM"

nightly -> export -> warehouse
export -A-> "segments" crm
```

## Shapes

A declaration is the kind, an id, an optional letter code and an optional name:

```text
kind id [CODE] ["name"]
```

- The **code** goes inside the shape. It is a single word, see the codes for [processors](processors.html#letter-codes) and [data stores](data-storage.html#data-store-types).
- The **name** goes below the shape. When it is left out, the id is used. Triggers and "other" shapes stay unnamed instead, as names are optional for them.
- Code and name can come in either order.
- Every id is declared once.

| Kind | Draws | Code | Example |
| ---- | ----- | ---- | ------- |
| `processor` | Circle | Language, e.g. `PY`, `JS` | `processor enrich PY "enrich"` |
| `lambda` | Circle with lambda lines | Language, in the upper right segment | `lambda resize PY "resize"` |
| `store` | Data store | Store type, e.g. `S3`, `D`, `RS` | `store raw S3 "raw clicks"` |
| `trigger` | Triangle | `manual`, `timed`, `event` (or `M`, `L`, `E`) | `trigger nightly timed "nightly"` |
| `other` | Rectangle | The system name, drawn inside | `other kafka KAFKA "clicks"` |
| `external` | Grey filled rectangle | Not used | `external crm "CRM"` |
| `app` | User facing app (square with a cross) | Not used | `app portal "report portal"` |
| `human` | Human | Not used | `human analyst "analyst"` |
| `list` | Overlapping circles, optionally with its members | Not used | `list workers "workers": a, b, c` |

```pipeline
processor p PY "processor"
lambda l JS "lambda"
store s S3 "store"
trigger t timed "timed trigger"
other k KAFKA "stream name"
external e "external"
app a "user facing app"
human h "human"
list x "list"
p -> l -> s
t -> k -> e
a -> h -> x
```

### Lists

A list stands for a number of identical processors. After a colon, its members are drawn in brackets below it, as in the [notation](misc.html#lists-and-repetitions):

```pipeline
processor router "router"
list aggregators "aggregators": by_country, by_device, by_hour
router -Q-> aggregators
```

### Codes

The codes from the processor and data store pages are known. Any other code still works, with a warning, so typos are caught. A warning also comes for a code on a kind that doesn't use one, and for extra words.

## Flows

A flow connects two shapes. The data flows in the direction of the arrow: `items -> collector` means the collector reads from items.

| Arrow | Flow type | Draws |
| ----- | --------- | ----- |
| `->` | Flow | Arrow |
| `<->` | Synchronous | Arrow heads on both ends |
| `-A->` | Asynchronous | "A" on the line |
| `-N->` | Streaming or evented | "N" on the line |
| `-Q->` | Queued | Tick across the line |

Spaces around arrows are optional: `a->b` works too.

### Reversed arrows

Every arrow can also point the other way: `<-`, `<-A-`, `<-N-` and `<-Q-`. `a <- b` is the same flow as `b -> a`, so when a flow points the wrong way, you only change the arrow:

```pipeline
store reports S3 "reports"
processor collector PY "collector"
store items D "items"

reports <- collector <-A- items
```

Both directions can be mixed in one chain. `<->` stays the synchronous flow; an arrow that points both ways with a mark, like `<-A->`, is an error.

### Chains and lists

One line can hold a chain of flows, and a comma separated list on either side of an arrow connects every item:

```pipeline
store items D "items"
store stats R "statistics"
processor collector "data collector"
processor report "report"
store html S3 "html"
store pdf S3 "pdf"

items, stats -> collector -A-> report -> html, pdf
```

This is the same as five separate flows: `items -> collector`, `stats -> collector`, `collector -A-> report`, `report -> html` and `report -> pdf`.

### Flow names

A name in quotes right after an arrow belongs to that arrow. A name at the end of the line belongs to the last arrow:

```pipeline
processor a "a"
processor b "b"
processor c "c"
a -> "raw" b -A-> c "nightly"
```

### Flows to and from a group

`group "name"` can be used as either end of a flow. The arrow then starts or ends at the group's box:

```pipeline
external crm "CRM"
group "VPC" {
  processor api JS "api"
  store orders P "orders"
}
crm -> group "VPC"
api -> orders
```

### Flows back

A flow against the direction of the diagram loops around everything in between, so it never crosses a shape:

```pipeline
processor fetch PY "fetch"
processor parse PY "parse"
processor load PY "load"
fetch -> parse -> load
load -A-> fetch "retry"
```

A flow from a shape to itself is not drawn, and gives a warning.

## Groups

A group draws a dashed box around its members, with the name outside the top right corner. There are two ways to write one:

- **A list of members:** `group "name": a b c`. The colon is optional, and members can be separated by spaces or commas.
- **A block:** `group "name" {`, the shapes inside it, and `}` on a line of its own. Blocks can be nested, e.g. a VPC inside an AWS account.

```pipeline
external crm "CRM"
group "AWS account" {
  group "VPC" {
    processor api JS "api"
    store orders P "orders"
  }
  lambda mailer PY "mailer"
}
crm -> api -> orders
orders -Q-> mailer
mailer -> crm "emails"
```

A list group inside a block is part of that block. A shape can be in one group, plus the groups around it.

The layout keeps the members of a group together, and keeps other shapes out of its box:

```pipeline
external shop "web shop"
other kafka KAFKA "clicks"
processor enrich PY "enrich"
store raw S3 "raw clicks"
processor audit "audit"
store archive S3 "archive"

shop -N-> kafka -N-> enrich -> raw
shop -> audit -> archive
raw -> archive
group "streaming": kafka enrich raw
```

## Annotations

`note` adds an [annotation](misc.html#annotations) to a shape: text between brackets, linked to the shape by a line.

For a short note, put the text in quotes. `\n` starts a new line:

```pipeline
processor collector PY "data collector"
note collector "m4.xlarge\nmin: 0, max: 10"
```

For a longer note, end the line with a colon and put the text on the lines below, indented further than the `note` line. Each line is shown as it is, so the dashes are up to you. The note ends at the first line that isn't indented further, or at an empty line:

```pipeline
processor workers "workers"
note workers:
  - m4.xlarge
  - min: 0
  - max: 10
  - AMI: ami-1234abcd
```

### Placement

By default a note goes to the right of its shape when nothing connects on that side, as in the notation. When flows leave the shape to the right, the note goes above it, so it never pushes the pipeline out of line. To choose yourself, put `left`, `right`, `above` or `below` after `note`:

```pipeline
processor collector PY "collector"
store reports S3 "reports"
collector -> reports
note left collector "starts at 6:00"
note above collector "m4.xlarge"
note below reports:
  - kept for 90 days
  - public read
```

A shape can have more than one note; they stack. One note per shape reads best.

### Notes on flows

`note a ARROW b "text"` puts a note on the flow from `a` to `b`. The arrow in the note doesn't have to match the flow's arrow.

```pipeline
processor collector PY "collector"
store reports S3 "reports"
collector -> reports
note collector -> reports "every hour"
```

## Layout

The layout is automatic. There are no coordinates.

- Shapes are placed in columns by their longest path from a source: left to right, or top to bottom with `direction TB`. Shapes without incoming flows sit right before the first shape they feed, so data stores sit next to their reader.
- Within a column, shapes are ordered and placed to keep flows as straight as possible. Members of a group stay together.
- Flows are smooth curves that leave a shape on one side and enter the next on the other side, so they don't cross the names under shapes. A flow that skips columns passes between the shapes in them.
- Flows back loop around the diagram.
- Shapes, names and notes don't overlap.

Changing the order of statements can change the order of shapes within a column. Very large diagrams with many crossing flows are still easier to read when split up.

## Errors and warnings

Errors stop rendering. All of them are reported at once, sorted by line, each with a suggestion:

| Mistake | Message |
| ------- | ------- |
| Undeclared id | `line 3: "c" is not declared. Add e.g.: processor c "c"` |
| A typo in an id | `line 6: "colector" is not declared. Add e.g.: processor colector "colector", or did you mean collector?` |
| A typo in a keyword | `line 1: "procesor" is not a statement. Did you mean processor?` |
| Declared twice | `line 2: "a" is declared twice (first on line 1)` |
| Invalid id | `line 1: "1abc" is not a valid id. An id starts with a letter and uses letters, digits, _ and -` |
| Missing id | `line 1: store needs an id, e.g. store my_store "my store"` |
| Missing quote | `line 1: a name is missing its closing quote (")` |
| Marked arrow pointing both ways | `line 3: "<-A->" points both ways. Use -A-> or <-A-, or <-> for a synchronous flow` |
| Arrow without a side | `line 4: a flow needs something on both sides of the arrow` |
| Two names on one arrow | `line 4: this flow already has a name` |
| Unknown group | `line 2: there is no group "nope"` |
| Group without a name | `line 3: group needs a name in quotes: group "name": a b, or group "name" {` |
| Group not closed | `line 3: group "g" is not closed. Add "}" on a line of its own` |
| Shape in two groups | `line 3: "a" is already in group "g1"` |
| Members on a shape that isn't a list | `line 1: only a list has members after ":", e.g. list workers "workers": a, b, c` |
| Note on an undeclared id | `line 5: note on "x" is not declared. …` |
| Note on a flow that doesn't exist | `line 5: there is no flow a -> b to put this note on` |
| Note without text | `line 5: note c needs text: note c "text", or end the line with ":" and indent the lines below it` |
| Invalid direction | `line 1: direction is LR (left to right) or TB (top to bottom)` |

Warnings don't stop rendering:

| Situation | Message |
| --------- | ------- |
| Unknown code | `line 3: unknown store code "S4". Known codes: D P S3 R RD RS M M. MC MS A MA PA O` |
| Code on a kind that doesn't use one | `line 1: external doesn't use a code, so "X" is ignored` |
| Extra words | `line 4: extra words are ignored: extra` |
| Flow to itself | `line 2: a flow from "a" to itself is not drawn` |
| Empty group | `line 3: group "g" is empty` |

## Tools

The npm package [`pipeline-diagrams`](https://www.npmjs.com/package/pipeline-diagrams) renders the format everywhere: in JavaScript, on the command line, on web pages (`<pipeline-diagram>`), in Markdown (markdown-it, remark, Obsidian), on GitHub, and for agents (a guide, a Claude skill and an MCP server). [Install & tools](install.html) has the details, and a box to try the format.

## Mermaid

The converter turns a `pipeline` block into a Mermaid flowchart, for places that render Mermaid but not this format. It's available as `toMermaid` in the [package](install.html#in-javascript), on the command line (`--mermaid`), from the MCP server, and in the Markdown renderer for GitHub. There are two levels:

| Level | Mermaid used | Looks like | Works on |
| ----- | ------------ | ---------- | -------- |
| Standard shapes | `tri`, `circle`, `div-rect`, `rect`, `win-pane`, `procs`, `braces` | The right shapes, with codes and names inside | Any Mermaid 11.3 or newer |
| Icons (`--icons`) | Icon nodes from the "pd" icon pack, with the name below | Close to the real notation | Where the icon pack can be loaded: your own site, or the Mermaid CLI. Not GitHub. |

How the shapes translate:

| Pipeline Diagrams | Mermaid |
| ----------------- | ------- |
| `processor x PY "name"` | `x@{ shape: circle, label: "PY<br>name" }` |
| `lambda x PY "name"` | `x@{ shape: circle, label: "λ PY<br>name" }` |
| `store x S3 "name"` | `x@{ shape: div-rect, label: "S3<br>name" }` |
| `trigger x timed "name"` | `x@{ shape: tri, label: "L<br>name" }` |
| `other x KAFKA "name"` | `x@{ shape: rect, label: "KAFKA<br>name" }` |
| `external x "name"` | a grey `rect` |
| `app x "name"` | `win-pane` |
| `human x "name"` | `stadium` with 👤 |
| `list x "name": a, b` | `procs`, with the members in the label |
| `a -A-> b "name"` | <code>a --&gt;&#124;"A: name"&#124; b</code> |
| `a <-> b` | `a <--> b` |
| groups | `subgraph`, nested like the blocks |
| notes on shapes | a `braces` comment shape, linked with `-.-` |
| notes on flows | added to the flow's label |
| `title`, `direction` | front matter title, `flowchart LR` or `TB` |

To use the icons, register the pack before rendering:

```js
mermaid.registerIconPacks([{
  name: "pd",
  loader: () => fetch("https://cdn.jsdelivr.net/npm/pipeline-diagrams@0.2/downloads/pipeline-diagrams-icons.json").then((r) => r.json()),
}]);
```

## Grammar

```text
file        = { line "\n" } ;
line        = [ statement ] [ comment ] | "%%" { any character } ;
comment     = "#" { any character } ;         (* at the start of a line or after a space *)
statement   = title | direction | declaration | flow | group | "}" | note ;

title       = "title" string ;
direction   = "direction" ( "LR" | "TB" | "TD" ) ;
declaration = kind id [ code ] [ string ] [ ":" item { [ "," ] item } ] ;   (* code and string in any order; items only for list *)
kind        = "processor" | "lambda" | "store" | "trigger" | "other"
            | "external" | "app" | "human" | "list" ;
flow        = ends arrow [ string ] ends { arrow [ string ] ends } [ string ] ;
ends        = end { "," end } ;
end         = id | "group" string ;
arrow       = "->" | "<->" | "-A->" | "-N->" | "-Q->"
            | "<-" | "<-A-" | "<-N-" | "<-Q-" ;            (* reversed: a <- b is b -> a; spaces are optional *)
group       = "group" string ( "{" | [ ":" ] id { [ "," ] id } ) ;
note        = "note" [ side ] target ( string | ":" "\n" indented { "\n" indented } ) ;
side        = "left" | "right" | "above" | "below" ;
target      = id | id arrow id ;
indented    = a line indented further than the note line ;

id          = letter { letter | digit | "_" | "-" } ;
code        = word ;
item        = word | string ;
word        = { any character except space, ",", ":", "{", "}", '"' } ;
string      = '"' { any character except '"' | "\" any character } '"' ;   (* \n is a line break *)
```

## Decisions

These choices shaped version 0.2. Each one is easy to revisit:

1. **Language name:** `pipeline` for code blocks, `.pipeline` for files.
2. **Comments:** `#`, at the start of a line or after a space, so `C#` works. Mermaid's `%%` is accepted too.
3. **Kinds:** `lambda` stays its own kind, and `app` is the user facing app.
4. **Triggers:** `manual`, `timed` and `event` are allowed next to `M`, `L` and `E`.
5. **Default names:** a shape without a name shows its id, except triggers and "other" shapes.
6. **Arrows:** spaces around arrows are optional, and every arrow can be reversed (`a <- b` is `b -> a`), so a flow in the wrong direction is a one-character fix.
7. **Flow names:** right after an arrow, or at the end of the line for the last arrow.
8. **Groups:** both the member list and the block, and blocks can be nested.
9. **Codes:** unknown codes give a warning, not an error, so new codes can be used right away.
10. **Mermaid:** both levels, standard shapes and icons.

<script src="{{ '/assets/js/pipeline-diagrams.js' | relative_url }}"></script>
<script>
/* Render every pipeline block on this page right below its source. */
if (window.PipelineDiagrams) window.PipelineDiagrams.renderAll("pre > code.language-pipeline");
</script>
