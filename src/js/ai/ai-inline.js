// ---------------------------------------------------------------------------
// ai/ai-inline.js
// Handles two patterns wired across widgets:
//   1. [data-bx-ai-ask]      — button click → submit(data-ai-prompt or context)
//   2. [data-bx-ai-inline]   — form (inline prompt) → submit whatever's typed
// Both hand off to chatPanel.submit() so the right offcanvas opens and streams
// a mock reply.
// ---------------------------------------------------------------------------

import * as chatPanel from "./chat-panel.js";

export function init() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-bx-ai-ask]");
    if (!btn) return;
    e.preventDefault();
    const prompt = btn.getAttribute("data-ai-prompt") || btn.getAttribute("data-ai-context") || "";
    if (!prompt) return;
    chatPanel.submit(prompt);
  });

  document.addEventListener("submit", (e) => {
    const form = e.target.closest("[data-bx-ai-inline]");
    if (!form) return;
    e.preventDefault();
    const input = form.querySelector("input");
    if (!input) return;
    const value = input.value.trim();
    if (!value) return;
    const ctx = form.getAttribute("data-ai-context");
    const fullPrompt = ctx ? `[${ctx}] ${value}` : value;
    input.value = "";
    chatPanel.submit(fullPrompt);
  });
}
