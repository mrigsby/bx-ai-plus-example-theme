// ---------------------------------------------------------------------------
// pages/code.js — syntax-highlight code blocks via Prism.
//
// Loaded lazily from app.js only on pages that contain a
// `<pre><code class="language-…">`. Highlights once on init and re-highlights
// when new blocks appear (e.g. AI chat responses, dynamic drawers).
// ---------------------------------------------------------------------------

let Prism;
let observer;

function highlightAllIn(root) {
  if (!Prism) return;
  const targets = root.querySelectorAll(
    'pre > code[class*="language-"]:not([data-bx-highlighted])'
  );
  for (const code of targets) {
    Prism.highlightElement(code);
    code.setAttribute("data-bx-highlighted", "");
  }
}

function observeDynamicBlocks() {
  if (observer || typeof MutationObserver === "undefined") return;
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (
          node.matches &&
          node.matches('pre > code[class*="language-"]')
        ) {
          highlightAllIn(node.parentNode);
        } else if (node.querySelector) {
          highlightAllIn(node);
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

export async function init() {
  const mod = await import("../../vendor/prism/prism-entry.js");
  Prism = mod.default;
  highlightAllIn(document);
  observeDynamicBlocks();
}
