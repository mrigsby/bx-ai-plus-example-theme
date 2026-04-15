// ---------------------------------------------------------------------------
// pages/ai-chat.js — full-page AI chat workspace.
// Submitting in the composer appends a user bubble + typing indicator,
// then a mock AI reply (re-uses ai/mock-ai.js).
// ---------------------------------------------------------------------------

import { reply, thinkingTime } from "../ai/mock-ai.js";

let threadEl;
let formEl;
let inputEl;

function appendUser(text) {
  const row = document.createElement("div");
  row.className = "bx-chat-msg bx-chat-msg--user";
  row.innerHTML = `<div class="bx-chat-msg__bubble"><p></p></div>`;
  row.querySelector("p").textContent = text;
  threadEl.appendChild(row);
  threadEl.scrollTop = threadEl.scrollHeight;
  return row;
}

function appendTyping() {
  const row = document.createElement("div");
  row.className = "bx-chat-msg bx-chat-msg--ai bx-chat-msg--typing";
  row.innerHTML = `<div class="bx-chat-msg__bubble"><span class="bx-typing"><span></span><span></span><span></span></span></div>`;
  threadEl.appendChild(row);
  threadEl.scrollTop = threadEl.scrollHeight;
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
  threadEl.appendChild(row);
  threadEl.scrollTop = threadEl.scrollHeight;
}

async function submit(text) {
  if (!text || !text.trim()) return;
  appendUser(text.trim());
  const typing = appendTyping();
  const delay = thinkingTime();
  const body = await reply(text);
  setTimeout(() => {
    typing.remove();
    appendAI(body);
  }, delay);
}

function newConversation() {
  threadEl.innerHTML = "";
  appendAI("Started a fresh conversation. What's on your mind?");
}

function pickConvo(btn) {
  document.querySelectorAll("[data-bx-ai-convo]").forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  const title = btn.getAttribute("data-bx-ai-title");
  const titleEl = document.querySelector("[data-bx-ai-thread-title]");
  if (title && titleEl) titleEl.textContent = title;
  threadEl.innerHTML = "";
  appendAI(`Loaded conversation: "${title}". (Mock — would fetch the real transcript here.)`);
}

export function init() {
  threadEl = document.querySelector("[data-bx-ai-thread]");
  formEl = document.querySelector("[data-bx-ai-chat-form]");
  inputEl = document.querySelector("[data-bx-ai-chat-input]");
  if (!threadEl || !formEl || !inputEl) return;

  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 200) + "px";
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

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = inputEl.value;
    inputEl.value = "";
    inputEl.style.height = "auto";
    submit(v);
  });

  document.addEventListener("click", (e) => {
    const newBtn = e.target.closest("[data-bx-ai-chat-new]");
    if (newBtn) { e.preventDefault(); newConversation(); return; }

    const convo = e.target.closest("[data-bx-ai-convo]");
    if (convo) { e.preventDefault(); pickConvo(convo); }
  });
}
