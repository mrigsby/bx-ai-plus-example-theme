// ---------------------------------------------------------------------------
// core/customizer.js — wires the customizer offcanvas to layout state.
// ---------------------------------------------------------------------------

import * as layout from "./layout.js";

// Radio inputs → layout settings (theme, sizes, colors)
const MAP = {
  "bx-theme":         "bs-theme",
  "bx-sidenav-size":  "sidenav-size",
  "bx-sidenav-color": "sidenav-color",
  "bx-topbar-color":  "topbar-color"
};

// ---- Vertical ↔ horizontal page-set mapping ----
// Same content, different chrome. Used by the layout-link buttons to jump
// to the equivalent page in the other set when one exists; otherwise drops
// to the set's home page.
const VERTICAL_TO_HORIZONTAL = {
  "/":                              "/horizontal/",
  "/dashboards/analytics/":         "/horizontal/dashboards/analytics/",
  "/dashboards/ai-ops/":            "/horizontal/dashboards/ai-ops/",
  "/ai/chat/":                      "/horizontal/ai/chat/",
  "/ai/insights/":                  "/horizontal/ai/insights/",
  "/apps/calendar/":                "/horizontal/apps/calendar/",
  "/apps/kanban/":                  "/horizontal/apps/kanban/",
  "/ui/buttons/":                   "/horizontal/ui/buttons/",
  "/ui/cards/":                     "/horizontal/ui/cards/",
  "/forms/advanced/":               "/horizontal/forms/advanced/",
  "/tables/datatables/":            "/horizontal/tables/datatables/",
  "/pages/profile/":                "/horizontal/pages/profile/"
};
const HORIZONTAL_TO_VERTICAL = Object.fromEntries(
  Object.entries(VERTICAL_TO_HORIZONTAL).map(([v, h]) => [h, v])
);

function normalize(p) {
  if (!p) return "/";
  if (p.endsWith("/index.html")) p = p.slice(0, -"index.html".length);
  if (p.length > 1 && !p.endsWith("/")) p += "/";
  return p;
}

function currentLayout() {
  return document.documentElement.getAttribute("data-layout") || "vertical";
}

function targetForLayout(target) {
  const path = normalize(window.location.pathname);
  if (target === "horizontal") {
    return VERTICAL_TO_HORIZONTAL[path] || "/horizontal/";
  }
  return HORIZONTAL_TO_VERTICAL[path] || "/";
}

function syncLayoutLinks() {
  const root = document.getElementById("bx-customizer");
  if (!root) return;
  const cur = currentLayout();
  for (const link of root.querySelectorAll("[data-bx-layout-link]")) {
    const target = link.getAttribute("data-bx-layout-link");
    link.setAttribute("href", targetForLayout(target));
    link.classList.toggle("is-active", target === cur);
  }
}

function syncInputsFromState() {
  const root = document.getElementById("bx-customizer");
  if (!root) return;
  for (const [inputName, settingKey] of Object.entries(MAP)) {
    const current = layout.get(settingKey);
    const input = root.querySelector(`input[name="${inputName}"][value="${current}"]`);
    if (input) input.checked = true;
  }
  syncLayoutLinks();
}

export function init() {
  const root = document.getElementById("bx-customizer");
  if (!root) return;

  syncInputsFromState();

  // Radio changes → layout.set()
  root.addEventListener("change", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "radio") return;
    const settingKey = MAP[input.name];
    if (!settingKey) return;
    layout.set(settingKey, input.value);
  });

  // Reset
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-bx-customizer-reset]");
    if (!btn) return;
    layout.reset();
    syncInputsFromState();
  });

  document.addEventListener("bx:layoutchange", syncInputsFromState);
}
