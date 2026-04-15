// ---------------------------------------------------------------------------
// core/tooltips.js — auto-init Bootstrap tooltips & popovers.
// Bootstrap's data-attribute API intentionally does NOT auto-init these,
// so we scan the DOM on boot and instantiate them.
// ---------------------------------------------------------------------------

import { Tooltip, Popover } from "bootstrap";

export function init() {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    if (!Tooltip.getInstance(el)) new Tooltip(el);
  });
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => {
    if (!Popover.getInstance(el)) new Popover(el);
  });
}
