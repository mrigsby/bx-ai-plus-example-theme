// ---------------------------------------------------------------------------
// core/horizontal-nav.js
// Click-toggle dropdowns for the horizontal nav (desktop hover is CSS-only).
// On mobile (< 992px), the entire nav becomes a stacked drawer driven by
// the same body.bx-sidenav-open toggle as the vertical sidebar.
// Marks the current-page link active.
// ---------------------------------------------------------------------------

function isMobile() {
  return window.matchMedia("(max-width: 991.98px)").matches;
}

function normalizePath(p) {
  if (!p) return "";
  try {
    const u = new URL(p, window.location.origin);
    let path = u.pathname;
    if (path.endsWith("/index.html")) path = path.slice(0, -"index.html".length);
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return path || "/";
  } catch (_) { return p; }
}

function markActive() {
  const current = normalizePath(window.location.pathname);
  for (const link of document.querySelectorAll(".bx-hmenu__link[href]")) {
    const href = normalizePath(link.getAttribute("href"));
    if (!href || href === "#") continue;
    if (href === current) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
      // Bubble active state up to ancestor toggle so root link styles too.
      let li = link.closest("li.bx-hmenu__item");
      while (li) {
        const parentSub = li.parentElement && li.parentElement.closest("[data-bx-hmenu-sub]");
        if (!parentSub) break;
        const parentItem = parentSub.parentElement;
        const toggle = parentItem?.querySelector(":scope > .bx-hmenu__link--toggle");
        if (toggle) toggle.classList.add("is-active");
        li = parentItem;
      }
      break;
    }
  }
}

export function init() {
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest(".bx-hmenu__link--toggle");
    if (!toggle) return;

    if (!isMobile()) {
      // Desktop — CSS handles hover-open. We still allow click to toggle for
      // touch users + accessibility.
      e.preventDefault();
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      // Close sibling toggles
      const parentList = toggle.closest("ul.bx-hmenu");
      if (parentList) {
        parentList.querySelectorAll(":scope > li > .bx-hmenu__link--toggle[aria-expanded='true']").forEach((sib) => {
          if (sib !== toggle) sib.setAttribute("aria-expanded", "false");
        });
      }
      toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
      return;
    }

    // Mobile — toggle .is-open on parent <li> for inline-expand behavior.
    e.preventDefault();
    const li = toggle.closest("li.bx-hmenu__item--has-children");
    if (li) li.classList.toggle("is-open");
  });

  // Click outside closes any open root toggle (desktop)
  document.addEventListener("click", (e) => {
    if (isMobile()) return;
    if (e.target.closest(".bx-hmenu")) return;
    document.querySelectorAll(".bx-hmenu__link--toggle[aria-expanded='true']").forEach((t) => t.setAttribute("aria-expanded", "false"));
  });

  markActive();
}
