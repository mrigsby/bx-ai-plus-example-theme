// ===========================================================================
// BX-AI+ — main JS entry
//
// Phase 7: chrome (theme/layout/sidenav/horizontal-nav/customizer/icons) +
// AI affordances (chat-command, chat-panel, voice-toast, ai-inline) +
// notifications + lazy-loaded page modules (dashboards + AI/Apps pages).
// ===========================================================================

import * as bootstrap from "bootstrap";

// Expose Bootstrap on window so inline page scripts can instantiate
// Tooltip, Popover, Toast, etc. without re-bundling.
if (typeof window !== "undefined") window.bootstrap = bootstrap;

import * as layout from "./core/layout.js";
import * as theme from "./core/theme.js";
import * as sidenav from "./core/sidenav.js";
import * as horizontalNav from "./core/horizontal-nav.js";
import * as customizer from "./core/customizer.js";
import * as icons from "./core/icons.js";
import * as tooltips from "./core/tooltips.js";

import * as chatCommand from "./ai/chat-command.js";
import * as chatPanel from "./ai/chat-panel.js";
import * as voiceToast from "./ai/voice-toast.js";
import * as aiInline from "./ai/ai-inline.js";

import * as notifications from "./components/notifications.js";

function bootCore() {
  layout.hydrate();
  icons.init();
  theme.init();
  sidenav.init();
  horizontalNav.init();
  customizer.init();
  tooltips.init();

  chatCommand.init();
  chatPanel.init();
  voiceToast.init();
  aiInline.init();

  notifications.init();
}

// Lazy-load page modules. Each page opts in via `data-bx-page` on <body>
// (set from page front-matter `page_module: …`). Code-split bundles keep
// initial JS lean — ApexCharts only loads on dashboard pages, FullCalendar
// only on the calendar page, etc.
async function bootPage() {
  const page = document.body.getAttribute("data-bx-page");
  if (page) {
    try {
      switch (page) {
        case "dashboard":       (await import("./pages/dashboard.js")).init();       break;
        case "realtime":        (await import("./pages/realtime.js")).init();        break;
        case "analytics":       (await import("./pages/analytics.js")).init();       break;
        case "sales":           (await import("./pages/sales.js")).init();           break;
        case "ai-ops":          (await import("./pages/ai-ops.js")).init();          break;
        case "ai-chat":         (await import("./pages/ai-chat.js")).init();         break;
        case "calendar":        (await import("./pages/calendar.js")).init();        break;
        case "kanban":          (await import("./pages/kanban.js")).init();          break;
        case "forms-advanced":  (await import("./pages/forms-advanced.js")).init();  break;
        case "tables-dt":       (await import("./pages/tables-dt.js")).init();       break;
        case "tables-gridjs":   (await import("./pages/tables-gridjs.js")).init();   break;
        case "charts-line":
        case "charts-bar":
        case "charts-mixed":    (await import("./pages/charts-gallery.js")).init();  break;
        case "widgets-gallery": (await import("./pages/widgets-gallery.js")).init(); break;
      }
    } catch (err) {
      console.error(`[BX-AI+] Failed to load page module "${page}"`, err);
    }
  }

  // Filter pills (prompts + insights) — load only if the hooks exist.
  if (document.querySelector("[data-bx-prompt-filter], [data-bx-insight-filter]")) {
    try {
      (await import("./pages/ai-filters.js")).init();
    } catch (err) {
      console.error("[BX-AI+] Failed to load ai-filters", err);
    }
  }
}

function boot() {
  bootCore();
  bootPage();
  console.info("[BX-AI+] Phase 7 — AI + Apps online.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
