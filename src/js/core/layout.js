// ---------------------------------------------------------------------------
// core/layout.js — single source of truth for runtime layout state.
//
// Reads/writes <html data-*> attributes AND persists to storage:
//   - data-bs-theme        localStorage  (sticky across sessions)
//   - data-sidenav-size    sessionStorage (ephemeral per tab)
//   - data-sidenav-color   sessionStorage
//   - data-topbar-color    sessionStorage
//   - data-layout-width    sessionStorage
//
// `data-layout` is INTENTIONALLY NOT managed here. Layout (vertical vs.
// horizontal) is determined by which page set the user is on — it's a
// navigation concern set by the page's layout file's front matter, not
// runtime-toggleable state. The customizer offers a navigation link to
// jump between sets; nothing writes data-layout to storage.
//
// Dispatches `bx:layoutchange` with detail {key, value} on every change,
// so chart modules / plugins can re-theme without re-reading the DOM.
// ---------------------------------------------------------------------------

import { local, session } from "./storage.js";

const html = document.documentElement;

const CONFIG = {
  "bs-theme":       { attr: "data-bs-theme",       storage: local,   key: "bx.theme",          allowed: ["dark", "light"], default: "dark" },
  "sidenav-size":   { attr: "data-sidenav-size",   storage: session, key: "bx.sidenav.size",   allowed: ["default", "compact", "hover", "offcanvas"], default: "default" },
  "sidenav-color":  { attr: "data-sidenav-color",  storage: session, key: "bx.sidenav.color",  allowed: ["dark", "light", "brand"], default: "dark" },
  "topbar-color":   { attr: "data-topbar-color",   storage: session, key: "bx.topbar.color",   allowed: ["dark", "light", "brand"], default: "dark" },
  "layout-width":   { attr: "data-layout-width",   storage: session, key: "bx.layout.width",   allowed: ["fluid", "boxed"], default: "fluid" }
};

function validate(setting, value) {
  const conf = CONFIG[setting];
  if (!conf) return null;
  return conf.allowed.includes(value) ? value : conf.default;
}

export function get(setting) {
  const conf = CONFIG[setting];
  if (!conf) return null;
  return html.getAttribute(conf.attr) || conf.default;
}

export function set(setting, value) {
  const conf = CONFIG[setting];
  if (!conf) return;
  const valid = validate(setting, value);
  html.setAttribute(conf.attr, valid);
  conf.storage.set(conf.key, valid);
  document.dispatchEvent(new CustomEvent("bx:layoutchange", { detail: { key: setting, value: valid } }));
}

export function reset() {
  for (const setting of Object.keys(CONFIG)) {
    set(setting, CONFIG[setting].default);
  }
}

// Hydrate from storage on startup (base.njk has already restored theme &
// sidenav-size before paint to avoid flicker; this re-applies the rest).
export function hydrate() {
  // Clear any pre-existing bx.layout from earlier builds. Layout is now
  // navigation-driven, not storage-driven; a stale value would override
  // the page's hardcoded data-layout and break the chrome.
  try { sessionStorage.removeItem("bx.layout"); } catch (_) {}

  for (const [setting, conf] of Object.entries(CONFIG)) {
    const stored = conf.storage.get(conf.key);
    if (stored && conf.allowed.includes(stored)) {
      html.setAttribute(conf.attr, stored);
    } else if (!html.hasAttribute(conf.attr)) {
      html.setAttribute(conf.attr, conf.default);
    }
  }
}

export const SETTINGS = Object.keys(CONFIG);
