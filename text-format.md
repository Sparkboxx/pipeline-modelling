---
layout: page
title: Text format
nav_order: 9
---

# Text format
{: .no_toc }

A small text language for Pipeline Diagrams. You write the diagram as plain text, in a code block marked `pipeline` in Markdown or in an agent conversation, and a renderer draws it with the shapes from this site.

**Status: draft 0.1, for review.** Each feature is marked:

- <span class="label label-green">Available</span> works in the current parser (`scripts/pipeline-dsl.mjs`).
- <span class="label label-yellow">Proposed</span> is a suggestion for the next version. Nothing is decided yet.

The examples marked Available are rendered live on this page by the same code that renders them everywhere else.

1. TOC
{:toc}

## Goals

- **Readable without rendering.** Someone who has never seen the format can tell what the diagram shows.
- **Easy to write for people and agents.** Few keywords, one way to say each thing, error messages that say how to fix the problem.
- **Diff friendly.** One statement per line, no coordinates. Layout is automatic.
- **Faithful to the notation.** Every shape and flow type on this site can be expressed.
- **Works where it can't be rendered.** A converter to Mermaid gives a rough version wherever Mermaid works (GitHub, Notion, chat tools). <span class="label label-yellow">Proposed</span>

## A first example

```pipeline
title "Reporting pipeline"

trigger report M "create report"
store items D "items"
store stats R "statistics"
store users P "user data"
processor collector "data collector"
lambda generator JS "html_report_generator"
store reports S3 "reports"

report -> collector
items, stats, users -> collector
collector -A-> generator -> reports
```

Shapes are declared first, with a short id. Flows then connect the ids.

## Embedding

| Where | How | Status |
| ----- | --- | ------ |
| Markdown | A fenced code block with the language `pipeline`. | <span class="label label-green">Available</span> on this site |
| Files | `.pipeline` files, UTF-8. Render with `node scripts/render-pipeline.mjs file.pipeline out/`. | <span class="label label-green">Available</span> |
| Web pages | `assets/js/pipeline-diagrams.js` exposes `PipelineDiagrams.render(text)`, which returns `{ light, dark }` SVG strings. | <span class="label label-green">Available</span> |
| Other sites, Obsidian, Docusaurus, MkDocs | An npm package with a `<pipeline-diagram>` web component and Markdown plugins. | <span class="label label-yellow">Proposed</span> |
| GitHub | GitHub only renders Mermaid. A GitHub Action could render `pipeline` blocks to SVG files, and the Mermaid converter gives a fallback. | <span class="label label-yellow">Proposed</span> |

## Lines, comments and text

<span class="label label-green">Available</span>

- One statement per line. Empty lines are ignored.
- `#` starts a comment that runs to the end of the line, except inside quotes.
- Text in double quotes is a name. `\n` inside a name starts a new line.
- Keywords are lowercase and case sensitive.
- An **id** is any word without spaces, commas, colons or quotes, e.g. `collector`, `user_data`, `s3-raw`. Ids are case sensitive. Keywords can be used as ids, but it is confusing.

```pipeline
# Names can span two lines
processor parser "parse\nclick events"   # comment after a statement
```

<span class="label label-yellow">Proposed</span> changes:

- **A comment starts at `#` only at the start of a line or after a space.** Today `processor x C# "x"` loses the `#` and the code becomes `C`.
- **`\"` for a quote inside a name.** Today a name can't contain a double quote.
- **Ids are restricted** to letters, digits, `_` and `-`, starting with a letter. That keeps them easy to read and to convert to Mermaid.

## Statements

| Statement | Example | Status |
| --------- | ------- | ------ |
| `title "text"` | `title "Reporting pipeline"` | <span class="label label-green">Available</span> |
| `kind id [CODE] ["name"]` | `store items S3 "items"` | <span class="label label-green">Available</span> |
| `a ARROW b ["name"]` | `collector -A-> generator "nightly"` | <span class="label label-green">Available</span> |
| `group "name": a b c` | `group "streaming": kafka enrich` | <span class="label label-green">Available</span> |
| `note id "text"` | `note collector "m4.xlarge\nmin: 0, max: 10"` | <span class="label label-yellow">Proposed</span> |
| `direction LR` | `direction TB` | <span class="label label-yellow">Proposed</span> |

### Title

<span class="label label-green">Available</span> `title "text"` sets the diagram's accessible title (the SVG `<title>`). It is not drawn.

<span class="label label-yellow">Proposed</span> Draw the title above the diagram when it is set, or add an option for it.

## Shapes

A declaration is the kind, an id, an optional letter code and an optional name:

```text
kind id [CODE] ["name"]
```

- The **code** goes inside the shape. It is a single word, see the codes for [processors](processors.html#letter-codes) and [data stores](data-storage.html#data-store-types).
- The **name** goes below the shape.
- Code and name can come in either order. Extra words are ignored.
- When the name is left out, the id is used as the name. Triggers and "other" shapes stay unnamed instead, as names are optional for them.
- Every id must be declared once. Declaring it twice is an error.

| Kind | Draws | Code | Example | Status |
| ---- | ----- | ---- | ------- | ------ |
| `processor` | Circle | Language, e.g. `PY`, `JS` | `processor enrich PY "enrich"` | <span class="label label-green">Available</span> |
| `lambda` | Circle with lambda lines | Language, in the upper right segment | `lambda resize PY "resize"` | <span class="label label-green">Available</span> |
| `store` | Data store | Store type, e.g. `S3`, `D`, `RS` | `store raw S3 "raw clicks"` | <span class="label label-green">Available</span> |
| `trigger` | Triangle | `M` manual, `L` timed, `E` event | `trigger nightly L "nightly"` | <span class="label label-green">Available</span> |
| `other` | Rectangle | The system name, drawn inside | `other kafka KAFKA "clicks"` | <span class="label label-green">Available</span> |
| `external` | Grey filled rectangle | Not used | `external crm "CRM"` | <span class="label label-green">Available</span> |
| `app` | User facing app (square with a cross) | Not used | `app portal "report portal"` | <span class="label label-green">Available</span> |
| `human` | Human | Not used | `human analyst "analyst"` | <span class="label label-green">Available</span> |
| `list` | Overlapping circles | Not used | `list aggregators "aggregators"` | <span class="label label-green">Available</span> |

```pipeline
processor p PY "processor"
lambda l JS "lambda"
store s S3 "store"
trigger t L "timed trigger"
other k KAFKA "stream name"
external e "external"
app a "user facing app"
human h "human"
list x "list"
```

<span class="label label-yellow">Proposed</span> changes:

- **Trigger aliases.** Accept `manual`, `timed` and `event` as well as `M`, `L` and `E`, e.g. `trigger nightly timed "nightly"`. Easier to read, and harder for agents to get wrong.
- **Warnings instead of silence.** Warn about a code on a kind that doesn't use one, and about extra words.
- **List members.** `list aggregators "aggregators": by_country, by_device, by_hour` draws the bracketed list of processors from the [notation](misc.html#lists-and-repetitions). The members don't need to be declared.
- **Code validation (warning only).** Warn about codes that aren't in the tables for processors and data stores, so typos are caught, while still allowing new codes.

## Flows

A flow connects two declared ids. The data flows in the direction of the arrow: `items -> collector` means the collector reads from items.

| Arrow | Flow type | Draws | Status |
| ----- | --------- | ----- | ------ |
| `->` | Flow | Arrow | <span class="label label-green">Available</span> |
| `<->` | Synchronous | Arrow heads on both ends | <span class="label label-green">Available</span> |
| `-A->` | Asynchronous | "A" on the line | <span class="label label-green">Available</span> |
| `-N->` | Streaming or evented | "N" on the line | <span class="label label-green">Available</span> |
| `-Q->` | Queued | Tick across the line | <span class="label label-green">Available</span> |

<span class="label label-green">Available</span> Arrows need a space on both sides: `a -> b`, not `a->b`.

### Chains and lists

<span class="label label-green">Available</span> One line can hold a chain of flows, and a comma separated list on either side of an arrow connects every item:

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

<span class="label label-green">Available</span> A name in quotes at the end of the line is drawn next to the flow. In a chain it belongs to the **last** arrow only:

```pipeline
processor a "a"
processor b "b"
processor c "c"
a -> b -A-> c "nightly"
```

<span class="label label-yellow">Proposed</span> changes:

- **Allow arrows without spaces** (`a->b`), like Mermaid. Agents write it that way often.
- **A name in the middle of a chain**: `a -> b -A-> "nightly" c`. Or keep the current rule and recommend one flow per line when flows have names.
- **No reversed arrows** (`<-`). There is only one way to write a flow, so diagrams stay consistent. Listed here because it is a deliberate choice.
- **Flows to and from a group**, e.g. `crm -> group "streaming"`. To be decided whether this is worth the extra rules.

<span class="label label-green">Available</span> A flow from a shape to itself is accepted but not drawn. <span class="label label-yellow">Proposed</span> Make it a warning.

## Groups

<span class="label label-green">Available</span> `group "name": a b c` draws a dashed box around the members, with the name outside the top right corner. The colon is optional, and members can be separated by spaces or commas. Members must be declared.

```pipeline
external shop "web shop"
other kafka KAFKA "clicks"
processor enrich PY "enrich"
store raw S3 "raw clicks"

shop -N-> kafka -N-> enrich -> raw
group "streaming": kafka enrich
```

**Known limitation:** the layout doesn't keep non-members out of the box. When a group's members aren't next to each other, the box can enclose other shapes.

<span class="label label-yellow">Proposed</span> changes:

- **The layout keeps group members together**, so a box never encloses a non-member.
- **Block syntax**, declaring shapes inside the group:

```text
group "streaming" {
  other kafka KAFKA "clicks"
  processor enrich PY "enrich"
}
```

- **Nested groups**, e.g. a VPC inside an AWS account.

## Annotations

<span class="label label-yellow">Proposed</span> The [annotation](misc.html#annotations) from the notation: bracketed text, connected to a shape by a line.

```text
note collector "m4.xlarge\nmin: 0\nmax: 10"
```

Or, for longer notes, one line per item:

```text
note collector:
  - m4.xlarge
  - min: 0
  - max: 10
```

## Layout

<span class="label label-green">Available</span> The layout is automatic and runs left to right:

- Each shape gets a column by its longest path from a source. Shapes without incoming flows sit right before the first shape they feed, so data stores sit next to their reader.
- Within a column, shapes are ordered and placed to keep flows as straight as possible.
- Cycles are allowed. They don't affect the columns.
- Shapes and their names don't overlap each other. Columns move apart when flows between them are steep.

**Known limitation:** flows are straight lines, so a flow can still cross the name under a shape (see "data collector" in the first example).

There are no coordinates. Changing the order of statements can change the order of shapes within a column.

<span class="label label-yellow">Proposed</span> changes:

- **`direction TB`** for top to bottom, `direction LR` (the default) for left to right. Same keywords as Mermaid.
- **Curved or routed flows** that go around shapes. Today flows are straight lines and can cross shapes in busy diagrams.

## Errors

<span class="label label-green">Available</span> Errors stop rendering and give the line number and a suggestion:

| Mistake | Message |
| ------- | ------- |
| Undeclared id | `line 2: "b" is not declared. Add e.g.: processor b "b"` |
| Declared twice | `line 2: "a" is declared twice` |
| Unknown statement | `line 1: can't read "procesor a". Expected a declaration (processor, lambda, …), a flow (a -> b), group or title` |
| Missing id | `line 1: store needs an id, e.g. store my_store "my store"` |
| Group without a name | `line 3: group needs a quoted name: group "name": a b c` |
| Group member not declared | `line 3: group member "x" is not declared` |
| Arrow without a side | `line 4: a flow needs something on both sides of the arrow` |

<span class="label label-yellow">Proposed</span> changes:

- **Report all errors at once** instead of stopping at the first one.
- **Suggest the closest keyword**, e.g. `"procesor" is not a kind. Did you mean processor?`
- **Warnings that don't stop rendering**, for the cases listed above.

## Mermaid fallback

<span class="label label-yellow">Proposed</span> A converter that turns a `pipeline` block into a `mermaid` block, so a diagram shows up anywhere Mermaid is rendered. There are two levels:

| Level | Mermaid used | Looks like | Works on |
| ----- | ------------ | ---------- | -------- |
| Basic | Standard shapes: `tri`, `circle`, `div-rect`, `rect` | The right shapes, but names inside, and no lambda lines, app or human | Any Mermaid 11.3 or newer |
| Full | Icon nodes from a Pipeline Diagrams icon pack, with the name below | Close to the real notation | Where the icon pack can be loaded: our site, the Mermaid CLI, our own tools. Not GitHub. |

For example, the basic level turns `store items D "items"` into `items@{ shape: div-rect, label: "D<br>items" }`, and `a -A-> b` into `a -- A --> b`.

## For agents

<span class="label label-yellow">Proposed</span>

- **A short prompt or skill** with the grammar and two examples. The format is small enough to fit in a few hundred words.
- **An MCP tool** `render_pipeline` that takes the text and returns the SVG, or the errors so the agent can fix them.
- **A fallback rule:** if the conversation can't render `pipeline` blocks, output the Mermaid version.

## Grammar

<span class="label label-green">Available</span> The current grammar, informally:

```text
file        = { line "\n" } ;
line        = [ statement ] [ comment ] ;
comment     = "#" { any character } ;
statement   = title | declaration | flow | group ;

title       = "title" string ;
declaration = kind id [ code ] [ string ] ;      (* code and string in any order *)
kind        = "processor" | "lambda" | "store" | "trigger" | "other"
            | "external" | "app" | "human" | "list" ;
flow        = ids arrow ids { arrow ids } [ string ] ;
ids         = id { "," id } ;
arrow       = "->" | "<->" | "-A->" | "-N->" | "-Q->" ;    (* spaces around arrows *)
group       = "group" string [ ":" ] id { [ "," ] id } ;

id          = word ;
code        = word ;
word        = { any character except space, ",", ":", '"' } ;
string      = '"' { any character except '"' } '"' ;     (* \n is a line break *)
```

## Decisions to review

The questions that shape the next version:

1. **Language name.** `pipeline` as the code block language and `.pipeline` as the file extension?
2. **Comment character.** `#` (common in config files) or `%%` (Mermaid's)?
3. **Kind names.** `app` for "user facing app" and `lambda` as its own kind, or `processor x PY lambda`?
4. **Trigger aliases.** Allow `manual`, `timed` and `event` next to `M`, `L` and `E`?
5. **Default names.** Use the id as the name when there is none, or leave the shape unnamed?
6. **Spaces around arrows.** Keep them required, or allow `a->b`?
7. **Flow names in chains.** Last arrow only (today), or allow a name in the middle?
8. **Groups.** Keep `group "name": a b`, add the block syntax, or both? Nested groups?
9. **Annotations and list members.** Add them in the next version?
10. **Unknown codes and extra words.** Ignore them, warn, or fail?
11. **Mermaid fallback.** Basic level only, or also the icon pack?

<script src="{{ '/assets/js/pipeline-diagrams.js' | relative_url }}"></script>
<script>
/* Render every pipeline block on this page right below its source. */
(function () {
  if (!window.PipelineDiagrams) return;
  var dark = window.matchMedia("(prefers-color-scheme: dark)");
  var blocks = Array.prototype.slice.call(document.querySelectorAll("pre > code.language-pipeline"));
  var outputs = blocks.map(function (code) {
    var pre = code.parentNode;
    var out = document.createElement("div");
    out.className = "pipeline-output pipeline-example";
    pre.parentNode.insertBefore(out, pre.nextSibling);
    return { source: code.textContent, out: out };
  });
  function draw() {
    outputs.forEach(function (o) {
      try {
        var svg = window.PipelineDiagrams.render(o.source);
        o.out.innerHTML = dark.matches ? svg.dark : svg.light;
      } catch (e) {
        o.out.innerHTML = '<p class="pipeline-error"></p>';
        o.out.firstChild.textContent = e.message;
      }
    });
  }
  if (dark.addEventListener) dark.addEventListener("change", draw);
  draw();
})();
</script>
