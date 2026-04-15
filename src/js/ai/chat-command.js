// ---------------------------------------------------------------------------
// ai/chat-command.js — command palette modal for the topbar chat bar.
// Opens via [data-bx-chat-command-open] click or ⌘K / Ctrl+K.
// Enter on an item or on the raw query → hand off to the AI chat panel.
// ---------------------------------------------------------------------------

import * as chatPanel from "./chat-panel.js";

let rootEl;
let inputEl;
let resultsEl;
let emptyEl;
let itemsCache = [];
let activeIndex = -1;
let groupsCache = [];

function cache() {
  rootEl = document.getElementById("bx-chat-command");
  if (!rootEl) return false;
  inputEl = rootEl.querySelector("#bx-chat-command-input");
  resultsEl = rootEl.querySelector("[data-bx-chat-command-results]");
  emptyEl = rootEl.querySelector(".bx-chat-command__empty");
  itemsCache = Array.from(rootEl.querySelectorAll("[data-bx-chat-command-item]"));
  groupsCache = Array.from(rootEl.querySelectorAll("[data-bx-chat-command-group]"));
  return true;
}

function visibleItems() {
  return itemsCache.filter((el) => !el.hidden);
}

function setActive(index) {
  const items = visibleItems();
  if (!items.length) { activeIndex = -1; return; }
  activeIndex = ((index % items.length) + items.length) % items.length;
  for (const el of itemsCache) el.classList.remove("is-active");
  items[activeIndex].classList.add("is-active");
  items[activeIndex].scrollIntoView({ block: "nearest" });
}

function filter(query) {
  const q = query.trim().toLowerCase();
  for (const el of itemsCache) {
    const label = el.getAttribute("data-bx-chat-command-item") || "";
    const hint = el.querySelector(".bx-chat-command__item-hint")?.textContent || "";
    const match = !q || label.toLowerCase().includes(q) || hint.toLowerCase().includes(q);
    el.hidden = !match;
  }
  // Hide groups that have no visible items.
  for (const g of groupsCache) {
    const anyVisible = g.querySelector("[data-bx-chat-command-item]:not([hidden])");
    g.hidden = !anyVisible;
  }
  if (emptyEl) emptyEl.hidden = visibleItems().length > 0;
  setActive(0);
}

function openPalette() {
  if (!cache() && !rootEl) return;
  rootEl.classList.add("is-open");
  rootEl.setAttribute("aria-hidden", "false");
  document.body.classList.add("bx-chat-command-open");
  if (inputEl) {
    inputEl.value = "";
    filter("");
    requestAnimationFrame(() => inputEl.focus());
  }
}

function closePalette() {
  if (!rootEl) return;
  rootEl.classList.remove("is-open");
  rootEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("bx-chat-command-open");
}

function submit(text) {
  if (!text || !text.trim()) return;
  closePalette();
  // Tiny delay so the close animation doesn't conflict with the offcanvas slide.
  setTimeout(() => chatPanel.submit(text), 120);
}

export function open() { openPalette(); }
export function close() { closePalette(); }

export function init() {
  if (!cache()) return;

  // Global ⌘K / Ctrl+K
  document.addEventListener("keydown", (e) => {
    const isModK = (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "k";
    if (isModK) {
      e.preventDefault();
      if (rootEl.classList.contains("is-open")) closePalette();
      else openPalette();
      return;
    }
    if (!rootEl.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(activeIndex + 1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(activeIndex - 1);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const items = visibleItems();
      if (items.length && activeIndex >= 0) {
        const label = items[activeIndex].getAttribute("data-bx-chat-command-item");
        submit(label);
      } else {
        submit(inputEl.value);
      }
    }
  });

  // Triggers
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-bx-chat-command-open]");
    if (trigger) {
      e.preventDefault();
      openPalette();
      return;
    }
    const dismiss = e.target.closest("[data-bx-chat-command-dismiss]");
    if (dismiss) {
      closePalette();
      return;
    }
    const item = e.target.closest("[data-bx-chat-command-item]");
    if (item && rootEl.contains(item)) {
      e.preventDefault();
      submit(item.getAttribute("data-bx-chat-command-item"));
    }
  });

  // Live filter on input
  if (inputEl) {
    inputEl.addEventListener("input", () => filter(inputEl.value));
  }
}
