---
layout: page
title: Useful prompts
nav_order: 3
---

# Useful prompts
{: .no_toc }

Prompts that get real work out of an AI agent with Pipeline Diagrams. Copy one into a coding agent that can read your repository, such as Claude Code, and let it run.

1. TOC
{:toc}

## One-shot value

One prompt, one agentic loop, and you have a map of every data flow in a repository: an HTML page with a diagram per flow, an index, and quick search. A good first step on a code base you don't know yet, or to see what your own system really does.

```text
Read https://pipeline-diagrams.com and the agent guide at
https://pipeline-diagrams.com/downloads/pipeline-diagrams-agent-guide.md
to learn the Pipeline Diagrams notation and its text format.

Then map every data flow in this repository:

1. Find all infrastructure as code: Terraform, CloudFormation, CDK, Pulumi,
   Kubernetes, Helm, Docker Compose, serverless configs, CI/CD workflows and
   schedules. Use it as the basis: the data stores, queues, streams, triggers
   and compute that exist.
2. Inspect all implementation code that reads, writes or moves data. Use it
   to confirm and complete every flow: what reads what, what writes where,
   which calls answer, which are queued or streamed, and what starts them.
3. Write a pipeline diagram for every data flow, with a clear name.

Combine them into one or more self-contained HTML pages that load
https://cdn.jsdelivr.net/npm/pipeline-diagrams@0.2/assets/js/pipeline-diagrams.js
and put each diagram in a <pipeline-diagram> element.

- Start with a clear index of all flows, linking to each diagram.
- Add Cmd+K (Ctrl+K on Windows and Linux) to quickly search the flows by
  name, shape or data store, and jump to one.
- Lay out the diagrams left to right (direction LR). Only a really long flow,
  more than about six shapes from start to end, goes top to bottom
  (direction TB).
- Under each diagram, list the files it was drawn from.

Before you finish, check that every diagram has no errors and that every
shape and flow can be traced back to the code or the infrastructure.
```

**What you get:** an index of all flows, a diagram for each with the files behind it, and a search box under Cmd+K. Open the page in any browser: the diagrams are drawn on your own computer, and only the script is loaded from the CDN. (The agent of course reads your code to write the page.)

**Tips**

- **Check the result.** The agent reads the code well, but it can miss a flow or a dependency set up at runtime. The list of files under each diagram tells you where to look.
- **A large repository?** Name a folder, a service or a team's part of the system in the first line, and run the prompt once for each.
- **With the tools installed,** the agent checks every diagram itself: with the [MCP server or the skill](agents.html#claude-code), or `npx -y pipeline-diagrams diagram.pipeline --check`.
- **Keep it.** Commit the page next to the code, and run the prompt again after big changes. Or ask the agent to compare the new map with the old one.
