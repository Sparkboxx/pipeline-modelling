// Browser helpers for the text format, bundled into assets/js/pipeline-diagrams.js:
//   <pipeline-diagram> ... text ... </pipeline-diagram>   or   <pipeline-diagram src="file.pipeline">
//   renderAll()  turns ```pipeline code blocks on a page into diagrams
// The diagram lives in a shadow root, so its styles and the page's never mix.
// It follows the reader's light or dark mode, and Obsidian's theme-dark class.
import { render } from "./pipeline-dsl.mjs";

const prefersDark = () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
const SHADOW_CSS = ":host{display:block;overflow-x:auto}svg{display:block;max-width:100%;height:auto}"
  + ".pipeline-error{color:#cf222e;font:0.85rem/1.4 ui-monospace,monospace;white-space:pre-wrap;margin:0}"
  + "@media (prefers-color-scheme:dark){.pipeline-error{color:#f85149}}";

if (typeof customElements !== "undefined" && !customElements.get("pipeline-diagram")) {
  class PipelineDiagram extends HTMLElement {
    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      if (this._source === undefined) {
        const url = this.getAttribute("src");
        this._source = url ? null : this.textContent;
        if (url) fetch(url).then((r) => r.text()).then((text) => (this.source = text));
      }
      if (!this._mq && typeof matchMedia === "function") {
        this._mq = matchMedia("(prefers-color-scheme: dark)");
        this._onChange = () => this.update();
        this._mq.addEventListener?.("change", this._onChange);
      }
      this.update();
    }
    disconnectedCallback() {
      this._mq?.removeEventListener?.("change", this._onChange);
      this._mq = null;
    }
    get source() { return this._source; }
    set source(text) { this._source = text; this.update(); }
    update() {
      if (!this.shadowRoot || this._source == null) return;
      const theme = this.getAttribute("theme");
      const dark = theme === "dark" || (theme !== "light" && (document.body?.classList.contains("theme-dark") || prefersDark()));
      try {
        const out = render(this._source);
        this.result = out;
        this.shadowRoot.innerHTML = `<style>${SHADOW_CSS}</style>${dark ? out.dark : out.light}`;
        this.title = out.warnings.map((w) => `line ${w.line}: ${w.message}`).join("\n");
        this.dispatchEvent(new CustomEvent("pipeline-render", { detail: out }));
      } catch (e) {
        this.result = null;
        this.shadowRoot.innerHTML = `<style>${SHADOW_CSS}</style><pre class="pipeline-error"></pre>`;
        this.shadowRoot.querySelector("pre").textContent = e.message;
        this.dispatchEvent(new CustomEvent("pipeline-error", { detail: e }));
      }
    }
  }
  customElements.define("pipeline-diagram", PipelineDiagram);
}

// Turn code blocks into diagrams. By default the diagram goes right after the
// code block; { replace: true } puts it in the block's place.
export function renderAll(selector = "pre > code.language-pipeline, div.language-pipeline, div.pipeline", { replace = false, root = document } = {}) {
  const made = [];
  for (const el of root.querySelectorAll(selector)) {
    const block = el.tagName === "CODE" ? el.closest("pre") : el;
    if (block.dataset.pipelineDone) continue;
    block.dataset.pipelineDone = "1";
    const d = document.createElement("pipeline-diagram");
    d.source = el.textContent;
    block.parentNode.insertBefore(d, block.nextSibling);
    if (replace) block.remove();
    made.push(d);
  }
  return made;
}
