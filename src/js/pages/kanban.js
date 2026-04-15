// ---------------------------------------------------------------------------
// pages/kanban.js — Dragula drag-and-drop board.
// ---------------------------------------------------------------------------

import dragula from "dragula";

export function init() {
  const board = document.querySelector("[data-bx-kanban]");
  if (!board) {
    console.warn("[BX-AI+ kanban] No [data-bx-kanban] root found");
    return;
  }

  const lists = Array.from(board.querySelectorAll("[data-bx-kanban-list]"));
  if (!lists.length) {
    console.warn("[BX-AI+ kanban] No [data-bx-kanban-list] containers found");
    return;
  }

  const drake = dragula(lists, {
    moves(el, source, handle) {
      // Don't start a drag if the user clicked an interactive control
      // inside the card (button, link, etc.).
      if (handle && handle.closest && handle.closest("button, a, input, [data-bx-no-drag]")) return false;
      return !!(el && el.matches && el.matches("[data-bx-kanban-card]"));
    },
    accepts(el, target) {
      return !!(target && target.matches && target.matches("[data-bx-kanban-list]"));
    },
    revertOnSpill: true
  });

  console.info(
    "[BX-AI+ kanban] Dragula attached to",
    lists.length, "columns,",
    board.querySelectorAll("[data-bx-kanban-card]").length, "cards"
  );

  drake.on("drop", () => {
    for (const list of lists) {
      const col = list.closest("[data-bx-kanban-col]");
      const count = list.querySelectorAll("[data-bx-kanban-card]").length;
      const badge = col?.querySelector(".bx-kanban__col-count");
      if (badge) badge.textContent = count;
    }
  });

  drake.on("over",    (_el, container) => container.classList.add("is-over"));
  drake.on("out",     (_el, container) => container.classList.remove("is-over"));
  drake.on("drag",    (el)              => el.classList.add("is-dragging"));
  drake.on("dragend", (el)              => el.classList.remove("is-dragging"));
}
