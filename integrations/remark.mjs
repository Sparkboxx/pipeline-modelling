// remark plugin: replaces ```pipeline code blocks with the rendered diagram as
// an HTML node (use it with rehype-raw, or any pipeline that keeps raw HTML).
//   import remarkPipelineDiagrams from "pipeline-diagrams/remark";
//   unified().use(remarkParse).use(remarkPipelineDiagrams).use(remarkRehype, { allowDangerousHtml: true }) ...
import { diagramHtml } from "./html.mjs";

export default function remarkPipelineDiagrams() {
  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      if (child.type === "code" && child.lang === "pipeline") return { type: "html", value: diagramHtml(child.value) };
      walk(child);
      return child;
    });
  };
  return (tree) => walk(tree);
}
