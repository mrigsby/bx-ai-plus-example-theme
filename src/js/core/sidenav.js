// ---------------------------------------------------------------------------
// core/sidenav.js — sidebar toggle + multi-level menu collapse/expand.
//
// .bx-topbar__sidenav-toggle behaviour depends on context:
//   - mobile (any layout)        → open/close offcanvas drawer
//   - desktop vertical layout    → cycle sidenav size (default ↔ compact)
//   - desktop horizontal layout  → button is hidden via CSS; no-op
//
// .bx-menu__link--toggle (sidenav menu) → collapses/expands child menu via
//   grid-rows transition. Only one branch open per parent (accordion).
// On route entry, ancestors of the active link auto-expand.
// ---------------------------------------------------------------------------

import * as layout from "./layout.js";

const body = document.body;
const html = document.documentElement;

function isMobile() {
  return window.matchMedia("(max-width: 991.98px)").matches;
}

function isOffcanvas() {
  return html.getAttribute("data-sidenav-size") === "offcanvas";
}

function isHorizontal() {
  return html.getAttribute("data-layout") === "horizontal";
}

function openSidenav()  { body.classList.add("bx-sidenav-open"); }
function closeSidenav() { body.classList.remove("bx-sidenav-open"); }
function toggleSidenav() { body.classList.toggle("bx-sidenav-open"); }

// Cycle desktop vertical sidenav size between full + compact.
// "hover" stays sticky (intentional separate mode); "offcanvas" uses the
// drawer behavior instead.
function cycleSidenavSize() {
  const current = layout.get("sidenav-size");
  if (current === "compact") {
    layout.set("sidenav-size", "default");
  } else if (current === "default") {
    layout.set("sidenav-size", "compact");
  } else if (current === "offcanvas") {
    toggleSidenav();
  } else {
    // hover (or unknown) — flip to default so the click has visible effect
    layout.set("sidenav-size", "default");
  }
}

// ---- Menu collapse/expand ----
function toggleGroup(btn) {
  const id = btn.getAttribute("data-bx-menu-toggle");
  if (!id) return;
  const sub = document.querySelector(`[data-bx-menu-subwrap="${CSS.escape(id)}"]`);
  if (!sub) return;

  const isOpen = sub.getAttribute("data-bx-open") === "true";
  if (isOpen) {
    closeGroup(btn, sub);
  } else {
    // Close sibling groups (accordion behavior within same parent ul)
    const parentUl = btn.closest("ul.bx-menu");
    if (parentUl) {
      parentUl.querySelectorAll(":scope > li > .bx-menu__link--toggle[aria-expanded='true']").forEach((siblingBtn) => {
        if (siblingBtn === btn) return;
        const sId = siblingBtn.getAttribute("data-bx-menu-toggle");
        const sSub = document.querySelector(`[data-bx-menu-subwrap="${CSS.escape(sId)}"]`);
        if (sSub) closeGroup(siblingBtn, sSub);
      });
    }
    openGroup(btn, sub);
  }
}

function openGroup(btn, sub) {
  btn.setAttribute("aria-expanded", "true");
  btn.classList.remove("collapsed");
  sub.setAttribute("data-bx-open", "true");
}
function closeGroup(btn, sub) {
  btn.setAttribute("aria-expanded", "false");
  btn.classList.add("collapsed");
  sub.setAttribute("data-bx-open", "false");
}

function markActiveAndExpand() {
  const current = normalizePath(window.location.pathname);
  const links = document.querySelectorAll(".bx-menu__link[href]");
  for (const link of links) {
    const href = normalizePath(link.getAttribute("href"));
    if (!href) continue;
    if (href === current) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
      // Walk up and open each ancestor group
      let wrap = link.closest("[data-bx-menu-subwrap]");
      while (wrap) {
        const ancestorId = wrap.getAttribute("data-bx-menu-subwrap");
        const ancestorBtn = document.querySelector(`[data-bx-menu-toggle="${CSS.escape(ancestorId)}"]`);
        if (ancestorBtn) openGroup(ancestorBtn, wrap);
        wrap = wrap.parentElement ? wrap.parentElement.closest("[data-bx-menu-subwrap]") : null;
      }
      break;
    }
  }
}

function normalizePath(p) {
  if (!p) return "";
  try {
    const u = new URL(p, window.location.origin);
    let path = u.pathname;
    if (path.endsWith("/index.html")) path = path.slice(0, -"index.html".length);
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return path || "/";
  } catch (_) {
    return p;
  }
}

export function init() {
  // Hamburger
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-bx-sidenav-toggle]");
    if (toggle) {
      e.preventDefault();
      // Mobile or offcanvas mode: open/close drawer.
      if (isMobile() || isOffcanvas() || isHorizontal()) {
        toggleSidenav();
      } else {
        // Desktop vertical: cycle size so the click has visible effect.
        cycleSidenavSize();
      }
      return;
    }
    const close = e.target.closest("[data-bx-sidenav-close]");
    if (close) {
      e.preventDefault();
      closeSidenav();
      return;
    }
    const backdrop = e.target.closest("[data-bx-sidenav-backdrop]");
    if (backdrop) {
      closeSidenav();
      return;
    }

    // Menu group toggle
    const menuBtn = e.target.closest(".bx-menu__link--toggle");
    if (menuBtn) {
      e.preventDefault();
      toggleGroup(menuBtn);
    }
  });

  // Close on Esc (when open in offcanvas/mobile)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && body.classList.contains("bx-sidenav-open")) {
      closeSidenav();
    }
  });

  // Close when a leaf link is clicked on mobile/offcanvas (so the page nav
  // doesn't leave the drawer flung open).
  document.addEventListener("click", (e) => {
    const leaf = e.target.closest(".bx-menu__item--leaf .bx-menu__link");
    if (!leaf) return;
    if (isMobile() || isOffcanvas()) closeSidenav();
  });

  markActiveAndExpand();

  // Re-mark on layout changes that could affect menu visibility.
  document.addEventListener("bx:layoutchange", markActiveAndExpand);
}
