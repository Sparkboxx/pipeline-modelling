#!/usr/bin/env node
// MCP server for Pipeline Diagrams, over stdio (newline-delimited JSON-RPC 2.0).
// No dependencies. Tools:
//   render_pipeline       text -> SVG (light or dark), with warnings
//   check_pipeline        text -> errors and warnings, without rendering
//   pipeline_to_mermaid   text -> Mermaid, for places that only render Mermaid
//   pipeline_guide        the format, for an agent that hasn't seen it yet
// Register it in an MCP client as: node /path/to/integrations/mcp/server.mjs
import { createInterface } from "node:readline";
import { readFileSync } from "node:fs";
import { render, check, VERSION } from "../../scripts/pipeline-dsl.mjs";
import { toMermaid } from "../../scripts/pipeline-mermaid.mjs";

const guide = readFileSync(new URL("../agent-guide.md", import.meta.url), "utf8");
const source = { type: "string", description: "The diagram in the Pipeline Diagrams text format (the contents of a ```pipeline block)" };
const TOOLS = [
  {
    name: "render_pipeline",
    description: "Render a Pipeline Diagrams text diagram (data pipelines: processors, data stores, triggers, flows) to SVG. Returns the SVG, or the errors with line numbers and how to fix them.",
    inputSchema: { type: "object", properties: { source, theme: { type: "string", enum: ["light", "dark"], description: "Colors for a light (default) or dark background" } }, required: ["source"] },
  },
  {
    name: "check_pipeline",
    description: "Check a Pipeline Diagrams text diagram without rendering it. Returns every error and warning with its line number.",
    inputSchema: { type: "object", properties: { source }, required: ["source"] },
  },
  {
    name: "pipeline_to_mermaid",
    description: "Convert a Pipeline Diagrams text diagram to a Mermaid flowchart, for places that render Mermaid but not this format (GitHub, most chats).",
    inputSchema: { type: "object", properties: { source, icons: { type: "boolean", description: "Use the Pipeline Diagrams icon pack (needs the pack registered in Mermaid). Default false: standard shapes." } }, required: ["source"] },
  },
  {
    name: "pipeline_guide",
    description: "The Pipeline Diagrams text format: shapes, flows, groups, notes and an example. Read it before writing a diagram.",
    inputSchema: { type: "object", properties: {} },
  },
];

const lines = (list) => list.map((x) => `line ${x.line}: ${x.message}`).join("\n");
const text = (t, isError = false) => ({ content: [{ type: "text", text: t }], ...(isError ? { isError: true } : {}) });

function call(name, args = {}) {
  if (name === "pipeline_guide") return text(guide);
  if (typeof args.source !== "string") return text("source is required: the diagram text", true);
  if (name === "check_pipeline") {
    const { errors, warnings } = check(args.source);
    if (!errors.length && !warnings.length) return text("No errors or warnings.");
    return text([errors.length ? `Errors:\n${lines(errors)}` : "", warnings.length ? `Warnings:\n${lines(warnings)}` : ""].filter(Boolean).join("\n\n"), errors.length > 0);
  }
  try {
    if (name === "render_pipeline") {
      const out = render(args.source);
      const svg = args.theme === "dark" ? out.dark : out.light;
      return { content: [{ type: "text", text: svg }, ...(out.warnings.length ? [{ type: "text", text: `Warnings:\n${lines(out.warnings)}` }] : [])] };
    }
    if (name === "pipeline_to_mermaid") return text(toMermaid(args.source, { icons: !!args.icons }));
  } catch (e) {
    return text(e.errors ? `Errors:\n${lines(e.errors)}` : String(e.message), true);
  }
  return null;
}

function handle(msg) {
  const { id, method, params } = msg;
  const reply = (result) => id !== undefined && process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
  const fail = (code, message) => id !== undefined && process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n");
  switch (method) {
    case "initialize":
      return reply({
        protocolVersion: params?.protocolVersion || "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "pipeline-diagrams", version: VERSION },
        instructions: "Draw data pipelines with the Pipeline Diagrams text format. Call pipeline_guide first if you don't know the format.",
      });
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: TOOLS });
    case "tools/call": {
      const result = call(params?.name, params?.arguments);
      return result ? reply(result) : fail(-32602, `unknown tool: ${params?.name}`);
    }
    default:
      if (method?.startsWith("notifications/")) return;
      return fail(-32601, `method not found: ${method}`);
  }
}

createInterface({ input: process.stdin }).on("line", (line) => {
  if (!line.trim()) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }) + "\n");
    return;
  }
  for (const m of Array.isArray(msg) ? msg : [msg]) handle(m);
});
