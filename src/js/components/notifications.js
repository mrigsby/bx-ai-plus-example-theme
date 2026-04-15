// ---------------------------------------------------------------------------
// components/notifications.js
// Dropdown actions:
//   - [data-bx-notifications-mark-all] → set all unread to read
//   - [data-bx-notifications-clear]    → hide all notifications + show empty
//   - click on a notification          → mark that one read
// Updates the topbar badge count and the subtitle text.
// ---------------------------------------------------------------------------

function unreadItems(list) {
  return Array.from(list.querySelectorAll(".bx-notification[data-bx-notification-unread='true']:not([hidden])"));
}

function visibleItems(list) {
  return Array.from(list.querySelectorAll(".bx-notification:not([hidden])"));
}

function updateCounts() {
  const list = document.querySelector("[data-bx-notifications-list]");
  if (!list) return;
  const badge = document.querySelector("[data-bx-notifications-count]");
  const subtitle = document.querySelector("[data-bx-notifications-subtitle]");
  const empty = document.querySelector("[data-bx-notifications-empty]");
  const unread = unreadItems(list).length;
  const visible = visibleItems(list).length;
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread === 0 ? "none" : "";
  }
  if (subtitle) subtitle.textContent = unread === 0 ? "All caught up" : `${unread} unread`;
  if (empty) empty.hidden = visible > 0;
}

function markOneRead(item) {
  item.setAttribute("data-bx-notification-unread", "false");
  item.classList.remove("bx-notification--unread");
  const dot = item.querySelector(".bx-notification__dot");
  if (dot) dot.remove();
}

function markAllRead() {
  const list = document.querySelector("[data-bx-notifications-list]");
  if (!list) return;
  for (const item of unreadItems(list)) markOneRead(item);
  updateCounts();
}

function clearAll() {
  const list = document.querySelector("[data-bx-notifications-list]");
  if (!list) return;
  for (const item of list.querySelectorAll(".bx-notification")) {
    item.hidden = true;
    markOneRead(item);
  }
  updateCounts();
}

export function init() {
  updateCounts();

  document.addEventListener("click", (e) => {
    const markAllBtn = e.target.closest("[data-bx-notifications-mark-all]");
    if (markAllBtn) {
      e.preventDefault();
      markAllRead();
      return;
    }

    const clearBtn = e.target.closest("[data-bx-notifications-clear]");
    if (clearBtn) {
      e.preventDefault();
      clearAll();
      return;
    }

    const item = e.target.closest(".bx-notification");
    if (item && item.getAttribute("data-bx-notification-unread") === "true") {
      markOneRead(item);
      updateCounts();
    }
  });
}
