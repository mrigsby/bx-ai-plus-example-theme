// ---------------------------------------------------------------------------
// core/theme.js — light/dark toggle. Delegates persistence to core/layout.js.
// Any element with [data-bx-theme-toggle] flips the theme on click.
// ---------------------------------------------------------------------------

import * as layout from "./layout.js";

export function init() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-bx-theme-toggle]");
    if (!btn) return;
    const current = layout.get("bs-theme");
    layout.set("bs-theme", current === "dark" ? "light" : "dark");
  });
}
