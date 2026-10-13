// A rendered diagram as HTML for static sites and Markdown tools: a <picture>
// with the light SVG and the dark one for readers in dark mode. The SVGs are
// data URLs, so their styles can't clash with the page's CSS.
import { render } from "../scripts/pipeline-dsl.mjs";

const dataUrl = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
const escHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function diagramHtml(src) {
  try {
    const { light, dark, model } = render(src);
    const alt = escHtml(model.title || "Pipeline diagram");
    return `<picture class="pipeline-diagram"><source srcset="${dataUrl(dark)}" media="(prefers-color-scheme: dark)"><img src="${dataUrl(light)}" alt="${alt}"></picture>`;
  } catch (e) {
    return `<pre class="pipeline-error">${escHtml(e.message)}</pre>`;
  }
}
