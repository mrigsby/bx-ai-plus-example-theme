// ---------------------------------------------------------------------------
// ai/chat-panel.js — drives the right-offcanvas AI chat panel.
// Public API:
//   open()
//   close()
//   submit(text) — appends user message, triggers mock AI reply
// ---------------------------------------------------------------------------

import { Offcanvas } from "bootstrap";
import { reply, thinkingTime } from "./mock-ai.js";

let panelEl;
let bodyEl;
let inputEl;
let formEl;
let bsInstance;

function scrollToEnd() {
  if (!bodyEl) return;
  bodyEl.scrollTop = bodyEl.scrollHeight;
}

function appendUser(text) {
  const row = document.createElement("div");
  row.className = "bx-chat-msg bx-chat-msg--user";
  row.innerHTML = `<div class="bx-chat-msg__bubble"><p></p></div>`;
  row.querySelector("p").textContent = text;
  bodyEl.appendChild(row);
  scrollToEnd();
  return row;
}

function appendTyping() {
  const row = document.createElement("div");
  row.className = "bx-chat-msg bx-chat-msg--ai bx-chat-msg--typing";
  row.innerHTML = `<div class="bx-chat-msg__bubble"><span class="bx-typing"><span></span><span></span><span></span></span></div>`;
  bodyEl.appendChild(row);
  scrollToEnd();
  return row;
}

function appendAI(text) {
  const row = document.createElement("div");
  row.className = "bx-chat-msg bx-chat-msg--ai";
  const bubble = document.createElement("div");
  bubble.className = "bx-chat-msg__bubble";
  for (const line of text.split(/\n\s*\n/)) {
    const p = document.createElement("p");
    p.textContent = line;
    bubble.appendChild(p);
  }
  row.appendChild(bubble);
  bodyEl.appendChild(row);
  scrollToEnd();
  return row;
}

function resetPanel() {
  if (!bodyEl) return;
  // Leave the welcome message, strip everything else.
  const children = Array.from(bodyEl.children);
  for (let i = 1; i < children.length; i++) children[i].remove();
}

function ensureInstance() {
  if (!panelEl) {
    panelEl = document.getElementById("bx-chat-panel");
    if (!panelEl) return null;
  }
  if (!bsInstance) {
    bsInstance = Offcanvas.getOrCreateInstance(panelEl);
  }
  bodyEl = panelEl.querySelector("[data-bx-chat-panel-body]");
  inputEl = panelEl.querySelector("[data-bx-chat-panel-input]");
  formEl = panelEl.querySelector("[data-bx-chat-panel-form]");
  return bsInstance;
}

export async function submit(text) {
  if (!text || !text.trim()) return;
  const inst = ensureInstance();
  if (!inst) return;
  inst.show();

  appendUser(text.trim());
  const typing = appendTyping();

  const delay = thinkingTime();
  const body = await reply(text);

  setTimeout(() => {
    typing.remove();
    appendAI(body);
  }, delay);
}

export function open() {
  const inst = ensureInstance();
  if (inst) inst.show();
}

export function close() {
  const inst = ensureInstance();
  if (inst) inst.hide();
}

export function init() {
  ensureInstance();
  if (!panelEl) return;

  // Auto-grow textarea
  if (inputEl) {
    inputEl.addEventListener("input", () => {
      inputEl.style.height = "auto";
      inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + "px";
    });

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const v = inputEl.value;
        inputEl.value = "";
        inputEl.style.height = "auto";
        submit(v);
      }
    });
  }

  if (formEl) {
    formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = inputEl?.value ?? "";
      if (inputEl) {
        inputEl.value = "";
        inputEl.style.height = "auto";
      }
      submit(v);
    });
  }

  // New conversation
  panelEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-bx-chat-panel-new]");
    if (!btn) return;
    resetPanel();
    inputEl?.focus();
  });

  // When shown, focus the composer.
  panelEl.addEventListener("shown.bs.offcanvas", () => {
    inputEl?.focus();
  });
}
