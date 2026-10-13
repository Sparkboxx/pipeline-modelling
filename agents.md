---
layout: page
title: For AI agents
parent: Diagrams as code
nav_order: 1
---

# For AI agents
{: .no_toc }

AI agents are good at reading code, infrastructure and docs, and explaining how data moves through them. Diagrams as code lets them show it too. The language is small enough to learn from one page, and every mistake comes back with its line number and a fix. So an agent can draw a diagram, check it, correct it, and only then show it to you.

1. TOC
{:toc}

## The loop

1. **Describe.** The agent writes a `pipeline` block: shapes with a short id, then flows between them.
2. **Check.** The checker reports errors with a line number and a fix, e.g. `line 4: "users" is not declared. Add e.g.: processor users "users"`, and warnings for unknown codes.
3. **Fix.** The agent corrects the text. A flow in the wrong direction is a one-character change: `->` becomes `<-`.
4. **Render.** The diagram is drawn as SVG, or converted to Mermaid where only Mermaid is shown.
{: .steps }

With the MCP server, the agent runs this loop on its own. Without it, it can run the same checks on the command line, or you paste the errors back.

## Claude Code

Add the skill, so Claude knows the language and uses it when you ask for a pipeline diagram:

```sh
mkdir -p ~/.claude/skills/pipeline-diagrams
curl -fsSL https://cdn.jsdelivr.net/npm/pipeline-diagrams@0.2/integrations/claude-skill/pipeline-diagrams/SKILL.md \
  -o ~/.claude/skills/pipeline-diagrams/SKILL.md
```

And the MCP server, so Claude can check and render the diagrams it writes:

```sh
claude mcp add pipeline-diagrams -- npx -y -p pipeline-diagrams pipeline-diagrams-mcp
```

For one project only, put the skill in the project's `.claude/skills/` instead, and commit it, so everyone on the project has it.

## Other MCP clients

Claude Desktop, Cursor and other MCP clients start the server from their configuration file (for Claude Desktop `claude_desktop_config.json`, for Cursor `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "pipeline-diagrams": {
      "command": "npx",
      "args": ["-y", "-p", "pipeline-diagrams", "pipeline-diagrams-mcp"]
    }
  }
}
```

The server has four tools:

| Tool | What it does |
| ---- | ------------ |
| `pipeline_guide` | The language in one page, for an agent that hasn't seen it yet. |
| `check_pipeline` | Errors and warnings with line numbers, without drawing. |
| `render_pipeline` | The SVG, for a light or a dark background, plus any warnings. |
| `pipeline_to_mermaid` | A Mermaid version, with standard shapes or with the icon pack. |

## Any other agent or chat

Give the agent the [guide]({{ '/downloads/pipeline-diagrams-agent-guide.md' | relative_url }}): one page with the shapes, the flows, an example and the rules. Paste it into the conversation, add it to the agent's instructions, or point the agent at its URL:

```text
https://pipeline-diagrams.com/downloads/pipeline-diagrams-agent-guide.md
```

An agent that can run commands checks and renders diagrams with the package, without installing anything first:

```sh
npx -y pipeline-diagrams diagram.pipeline --check   # errors and warnings
npx -y pipeline-diagrams diagram.pipeline out/      # out/diagram.svg and out/diagram-dark.svg
```

## Things to ask

- "Read the jobs in `pipelines/` and draw how data flows between them as a `pipeline` diagram in `docs/architecture.md`."
- "Here is our Airflow DAG. Draw it as a pipeline diagram, with the schedule of each task as a note."
- "Draw the services in `infra/` that touch customer data, and group them by AWS account."
- "Check the pipeline diagrams in `docs/`: do they still match the code? Fix the ones that don't."
- "Explain this incident with a pipeline diagram: where did the data go wrong?"

## Where diagrams can't be rendered

GitHub, most chats and many wikis show Mermaid, but not `pipeline` blocks. The guide tells agents to add a Mermaid version there, and the MCP server converts with `pipeline_to_mermaid`. In a repository, the [Markdown renderer](install.html#github) puts images right after each `pipeline` block, so diagrams written by an agent show up on GitHub too, and stay up to date in CI.

## Why this works well for agents

- **One way to say each thing.** Few keywords, and the same structure for every shape, so agents rarely guess.
- **Ids, not coordinates.** An agent never has to place anything. The layout is automatic, so diagrams stay readable however they were written.
- **Errors that say how to fix them.** Every error has a line number and a suggestion, including "did you mean …?" for typos.
- **Diffs a person can review.** One statement per line, so a change made by an agent is easy to check in a pull request.
