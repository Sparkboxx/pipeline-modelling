/*
  Slides from a normal page. Load this script on a page and it adds a
  "Present as slides" button; opening the page with #slides starts right away.

  - Every h2 and h3 in the page starts a new slide; the h1 and its intro make
    the title slide. An h2 that is directly followed by an h3 becomes a
    section divider.
  - Elements with the class "notes" are facilitator notes: on the page, not on
    the slides. Elements with "page-only" are left out of the slides too;
    elements with "slides-only" appear only on the slides.
  - Keys: right arrow, space or page down for the next slide, left arrow or
    page up for the previous one, Home and End, F for full screen, Esc to stop.

  No dependencies; the page's own styles and diagrams are reused.
*/
(function () {
  var main = document.querySelector("#main-content main") || document.querySelector("main");
  if (!main) return;

  var deck = null, slides = [], index = 0;

  function copyDiagrams(from, to) {
    var a = from.querySelectorAll ? from.querySelectorAll("pipeline-diagram") : [];
    var b = to.querySelectorAll ? to.querySelectorAll("pipeline-diagram") : [];
    for (var i = 0; i < a.length && i < b.length; i++) { b[i].setAttribute("fit", ""); b[i].source = a[i].source; }
  }

  function clean(node) {
    var gone = node.querySelectorAll(".notes, .page-only, .anchor-heading, .slides-start");
    for (var i = 0; i < gone.length; i++) gone[i].remove();
  }

  function build() {
    slides = [];
    var current = null;
    function start(kind) {
      current = document.createElement("section");
      current.className = "slide" + (kind ? " " + kind : "");
      slides.push(current);
    }
    start("slide-title");
    var nodes = Array.prototype.slice.call(main.children);
    nodes.forEach(function (node, i) {
      if (node.matches("script, #markdown-toc, .notes, .page-only, .slides-start, hr")) return;
      if (node.tagName === "H2") start(nodes[i + 1] && nodes[i + 1].tagName === "H3" ? "slide-section" : "");
      else if (node.tagName === "H3") start("");
      var copy;
      if (node.tagName === "PIPELINE-DIAGRAM") {
        copy = document.createElement("pipeline-diagram");
        copy.setAttribute("fit", "");
        copy.source = node.source;
      } else {
        copy = node.cloneNode(true);
        clean(copy);
        copyDiagrams(node, copy);
      }
      current.appendChild(copy);
    });
    slides = slides.filter(function (s) { return s.children.length; });
  }

  function show(i) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    var stage = deck.querySelector(".deck-stage");
    stage.innerHTML = "";
    stage.appendChild(slides[index]);
    stage.scrollTop = 0;
    deck.querySelector(".deck-count").textContent = (index + 1) + " / " + slides.length;
    history.replaceState(null, "", "#slides/" + (index + 1));
  }

  function open(at) {
    build();
    deck = document.createElement("div");
    deck.className = "deck";
    deck.setAttribute("role", "dialog");
    deck.setAttribute("aria-label", "Slides");
    deck.innerHTML = '<div class="deck-stage"></div>'
      + '<div class="deck-bar">'
      + '<button type="button" class="deck-prev" aria-label="Previous slide">&larr;</button>'
      + '<span class="deck-count"></span>'
      + '<button type="button" class="deck-next" aria-label="Next slide">&rarr;</button>'
      + '<button type="button" class="deck-full" aria-label="Full screen">Full screen</button>'
      + '<button type="button" class="deck-close" aria-label="Stop the slides">Close</button>'
      + "</div>";
    document.body.appendChild(deck);
    document.documentElement.classList.add("deck-open");
    deck.querySelector(".deck-prev").onclick = function () { show(index - 1); };
    deck.querySelector(".deck-next").onclick = function () { show(index + 1); };
    deck.querySelector(".deck-close").onclick = close;
    deck.querySelector(".deck-full").onclick = fullscreen;
    document.addEventListener("keydown", keys);
    show(at || 0);
  }

  function close() {
    if (!deck) return;
    if (document.fullscreenElement) document.exitFullscreen();
    deck.remove();
    deck = null;
    document.documentElement.classList.remove("deck-open");
    document.removeEventListener("keydown", keys);
    history.replaceState(null, "", location.pathname + location.search);
  }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (deck.requestFullscreen) deck.requestFullscreen();
  }

  function keys(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key;
    if (k === "ArrowRight" || k === "PageDown" || k === " ") { e.preventDefault(); show(index + 1); }
    else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); show(index - 1); }
    else if (k === "Home") show(0);
    else if (k === "End") show(slides.length - 1);
    else if (k === "f" || k === "F") fullscreen();
    else if (k === "Escape" && !document.fullscreenElement) close();
  }

  // the button, right under the page title
  var title = main.querySelector("h1");
  var button = document.createElement("p");
  button.className = "slides-start";
  button.innerHTML = '<button type="button" class="btn btn-primary">Present as slides</button> <span class="slides-hint">Arrow keys to move, F for full screen, Esc to stop.</span>';
  button.querySelector("button").onclick = function () { open(0); };
  if (title) title.insertAdjacentElement("afterend", button);

  var m = location.hash.match(/^#slides(?:\/(\d+))?$/);
  if (m) open(m[1] ? Number(m[1]) - 1 : 0);
})();
