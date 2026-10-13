// markdown-it plugin: renders ```pipeline code blocks as diagrams.
//   import markdownIt from "markdown-it";
//   import pipelineDiagrams from "pipeline-diagrams/markdown-it";
//   const md = markdownIt().use(pipelineDiagrams);
import { diagramHtml } from "./html.mjs";

export default function pipelineDiagrams(md) {
  const fence = md.renderer.rules.fence || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.info.trim().split(/\s+/)[0] !== "pipeline") return fence(tokens, idx, options, env, self);
    return diagramHtml(token.content) + "\n";
  };
}
