# BX-AI+ → ColdBox 8.1+ Port Notes

A guide for folding the static BX-AI+ theme into a **ColdBox 8.1+ module running on a BoxLang server**. This document is the handoff artifact — it tells the next engineer exactly where the seams are, what data shapes the module's handlers/models need to expose, and what to swap when going from mock to real.

> **Snippet convention.** All CFML/BoxLang snippets below assume a ColdBox layout or view scope — i.e. they render inside an implicit `<cfoutput>`. Single `#var#` works there. If you paste a snippet outside a `cfoutput` block, wrap it. Views/layouts in this port can be `.cfm` on ColdBox; `.bxm` views also resolve on BoxLang — examples below use `.cfm`.

---

## Port philosophy

- The theme's Eleventy + Nunjucks partials are the seams. Each partial becomes a ColdBox view rendered with the `view()` helper inside the module's layout — e.g. `#view( view="partials/topbar", module="bxaiplus" )#`.
- Every shared region wraps its output in HTML comments via the `seamBegin` / `seamEnd` shortcodes:
  ```html
  <!-- BEGIN :: TOPBAR -->
  ... rendered topbar markup ...
  <!-- END :: TOPBAR -->
  ```
  These survive Eleventy compilation and give a mechanical find-and-replace target inside the built HTML. Each `BEGIN :: X` / `END :: X` block collapses to a single `#view( view="partials/x", module="bxaiplus" )#` call in the ColdBox layout/view.
- Data currently sourced from `src/html/_data/*.json` becomes ColdBox model output at runtime — one model (or one method on a shared model) per JSON file. A `preLayout` interceptor (or the page's handler) places those structs onto the `prc` scope under the same top-level keys, so the migrated views reference them directly (e.g. `#prc.dashboard.stats[ 1 ].value#`).

---

## ColdBox module layout

Where each build artefact lives inside the target module (`modules/bxaiplus/` by convention):

| From the theme | Goes to in the ColdBox module |
|---|---|
| `dist/**/*.html` page bodies (non-layout `.njk`) | `views/<section>/<page>.cfm` |
| `_includes/layouts/vertical.njk`, `horizontal.njk`, `auth.njk` | `layouts/Main.cfm`, `layouts/Horizontal.cfm`, `layouts/Auth.cfm` |
| `_includes/partials/**.njk` | `views/partials/**.cfm` (rendered via `view()`) |
| `dist/assets/**` (CSS, JS, fonts, images, icons, vendor) | `includes/**` — web-accessible at `/modules/bxaiplus/includes/...` |
| `src/html/_data/*.json` | `models/` (e.g. `NavigationService.cfc`, `NotificationService.cfc`, `DashboardDataService.cfc`) + `interceptors/PreLayoutInterceptor.cfc` populating `prc` |
| `src/html/_data/site.json` | `ModuleConfig.cfc` `settings` struct |

A stripped-down sketch of a migrated layout:

```cfml
<cfoutput>
<!DOCTYPE html>
<html lang="en" data-bs-theme="#prc.theme#" data-layout="vertical" data-sidenav-size="#prc.sidenavSize#">
<head>
  <meta charset="utf-8" />
  <title>#prc.pageTitle# — BX-AI+</title>
  <link rel="stylesheet" href="/modules/bxaiplus/includes/css/app.css" />
</head>
<body data-bx-page="#prc.pageModule#">
  #view( view="partials/sidenav",              module="bxaiplus" )#
  <div class="bx-app">
    #view( view="partials/topbar",             module="bxaiplus" )#
    <main class="bx-content">
      #view( view="partials/page-title",       module="bxaiplus" )#
      #renderView()#
      #view( view="partials/footer",           module="bxaiplus" )#
    </main>
  </div>
  #view( view="partials/customizer",           module="bxaiplus" )#
  #view( view="partials/offcanvas-left",       module="bxaiplus" )#
  #view( view="partials/chat-panel",           module="bxaiplus" )#
  #view( view="partials/chat-command",         module="bxaiplus" )#
  #view( view="partials/voice-toast",          module="bxaiplus" )#
  <script src="/modules/bxaiplus/includes/js/app.js"></script>
</body>
</html>
</cfoutput>
```

Each `view()` call resolves to a `.cfm` file under `views/partials/` and pulls its data from `prc`.

---

## Seam inventory

Every seam name, the partial that owns it, and the exact ColdBox replacement call:

| Seam | Partial | ColdBox replacement |
|---|---|---|
| `APP_WRAPPER` | `_includes/layouts/vertical.njk`, `horizontal.njk` | Outer flex shell in `layouts/Main.cfm` / `layouts/Horizontal.cfm` — render once per request |
| `TOPBAR` | `_includes/partials/topbar.njk` | `#view( view="partials/topbar", module="bxaiplus" )#` — `prc.user`, `prc.notifications` populated by `PreLayoutInterceptor` |
| `SIDENAV` | `_includes/partials/sidenav.njk` | `#view( view="partials/sidenav", module="bxaiplus" )#` — `prc.menu` from `NavigationService.getMenuFor( prc.oCurrentUser )` |
| `HORIZONTAL_NAV` | `_includes/partials/horizontal-nav.njk` | `#view( view="partials/horizontal-nav", module="bxaiplus" )#` — `prc.horizontalMenu` |
| `PAGE_WRAPPER` | layout wrappers | `<main>` element wrapping `#view( view="partials/page-title" )#` + `#renderView()#` + `#view( view="partials/footer" )#` |
| `PAGE_TITLE` | `_includes/partials/page-title.njk` | `#view( view="partials/page-title", module="bxaiplus" )#` — `prc.pageTitle`, `prc.pageSubtitle`, `prc.breadcrumbs` set by the handler |
| `PAGE_CONTENT` | layout wrappers | `#renderView()#` — the event's primary view |
| `FOOTER` | `_includes/partials/footer.njk` | `#view( view="partials/footer", module="bxaiplus" )#` |
| `CUSTOMIZER` | `_includes/partials/customizer.njk` | `#view( view="partials/customizer", module="bxaiplus" )#` — theme/layout picker |
| `OFFCANVAS_LEFT` | `_includes/partials/offcanvas-left.njk` | `#view( view="partials/offcanvas-left", module="bxaiplus" )#` — quick actions |
| `CHAT_PANEL` | `_includes/partials/chat-panel.njk` | `#view( view="partials/chat-panel", module="bxaiplus" )#` — submissions hit event `bxaiplus:ai.ask` |
| `CHAT_COMMAND` | `_includes/partials/chat-command.njk` | `#view( view="partials/chat-command", module="bxaiplus" )#` — ⌘K command palette |
| `VOICE_TOAST` | `_includes/partials/voice-toast.njk` | `#view( view="partials/voice-toast", module="bxaiplus" )#` — mock today; STT endpoint later |
| `NOTIFICATIONS_MENU` | `_includes/partials/notifications-dropdown.njk` | `#view( view="partials/notifications-dropdown", module="bxaiplus" )#` — `prc.notifications` from `NotificationService` |
| `ACCOUNT_MENU` | `_includes/partials/account-dropdown.njk` | `#view( view="partials/account-dropdown", module="bxaiplus" )#` — `prc.user` |
| `AUTH_SHELL` / `AUTH_CARD` | `_includes/layouts/auth.njk` | `layouts/Auth.cfm` — centred glow card wrapper |

To regenerate this map after adding new partials, grep the built HTML:
```bash
grep -hoE "BEGIN :: [A-Z_]+" dist/**/*.html | sort -u
```

---

## Data shapes (the module's handlers/models must expose these)

All page data lives in `src/html/_data/*.json`. In the ColdBox port, each JSON file corresponds to a model method whose return struct matches the documented shape. A handler (or `PreLayoutInterceptor`) places those structs onto the `prc` scope under the same top-level keys (`prc.menu`, `prc.notifications`, `prc.dashboard`, etc.) so the migrated views read them directly — e.g. `#prc.dashboard.stats[ 1 ].value#`.

### `menu.json` — sidebar tree

Recursive tree, ≥3 levels supported.

```jsonc
[
  {
    "id": "string",                     // stable slug
    "label": "string",                  // display text
    "icon": "string",                   // Lucide icon name
    "href": "string",                   // omitted on group nodes
    "badge": { "text": "NEW", "variant": "primary|info|warning|danger|brand|secondary" },
    "type": "section",                  // optional — renders as a section label
    "children": [ /* recursive */ ]
  }
]
```

### `horizontalMenu.json` — same shape, fewer entries; URLs prefixed with `/horizontal/`.

### `notifications.json`
```jsonc
{
  "unreadCount": 4,
  "items": [
    { "id":"n-01", "variant":"danger", "icon":"triangle-alert", "title":"…",
      "body":"…", "time":"2 min ago", "unread": true, "flavor":"ai|generic" }
  ]
}
```

### `user.json`
```jsonc
{ "name":"string", "initials":"MR", "email":"…", "role":"Admin", "organization":"…" }
```

### `dashboard.json`
Top-level keys: `brief`, `stats[]`, `revenueChart`, `agentStatus`, `tokenUsage`, `insights[]`, `activity[]`, `topAgents[]`. See file for full shapes — every key is referenced by `partials/dashboard-main.njk`.

### `aiAgents.json`, `aiPrompts.json`, `aiHistory.json`, `aiInsightsFeed.json`, `aiVoice.json`
AI section data — see files for shapes.

### `aiModels.json`, `aiTuningJobs.json`, `aiTuningDatasets.json`
AI Models library and Fine-tuning sub-section data. In the ColdBox port:

- `aiModels.json` → `AIModelService.list()` → `prc.aiModels` (view: `ai/models.cfm`, URL: `/ai/models/`)
- `aiTuningJobs.json` → `AITuningService.listJobs()` → `prc.aiTuningJobs` (view: `ai/tuning-jobs.cfm`, URL: `/ai/tuning/jobs/`)
- `aiTuningDatasets.json` → `AITuningService.listDatasets()` → `prc.aiTuningDatasets` (view: `ai/tuning-datasets.cfm`, URL: `/ai/tuning/datasets/`)

See files for full shapes (`summary` + collection arrays). Each collection item includes a `tone` key consumed by `bx-agent-card__icon--{tone}` and `bx-agent-card__status--*` modifiers.

### `analytics.json`, `sales.json`, `aiOps.json`, `realtime.json`
Per-dashboard data, all share the `stats[]` + `*Chart` pattern.

### `calendarEvents.json`, `kanban.json`, `email.json`, `chatApp.json`, `files.json`, `projects.json`
App data — see files.

---

## Mock → real replacement points

Every place the demo uses fake data. Replace these to wire the module into real services.

| Mock | Location | Replace with |
|---|---|---|
| AI replies (regex bucket) | `src/js/ai/mock-ai.js` | ColdBox event `bxaiplus:ai.ask` that proxies to a BoxLang AI service/model; the front-end calls it via `fetch` or a CBWire action |
| Voice waveform | `src/js/ai/voice-toast.js` + `waveform.js` | Browser Web Speech API or a ColdBox handler that streams to a Whisper.cpp endpoint |
| Stat-card live counters | `src/js/components/stat-card.js` (uses seeded RNG drift) | WebSocket / SSE driven by a ColdBox scheduler or a CBWire component pushing runtime metrics |
| Realtime chart | `src/js/pages/realtime.js` (1s setInterval) | `EventSource` backed by a ColdBox SSE handler action |
| Dashboard chart series | `src/html/_data/dashboard.json` | `DashboardDataService.getSnapshot()` → set as `prc.dashboard` in the handler before rendering |
| Notifications | `src/html/_data/notifications.json` | `NotificationService.unreadFor( prc.oCurrentUser )` → `prc.notifications` |
| Menu tree | `src/html/_data/menu.json` | `NavigationService.getMenuFor( prc.oCurrentUser )` — permissions-aware |

---

## Theme persistence

| Setting | Storage | Key |
|---|---|---|
| Theme (light / dark) | `localStorage` | `bx.theme` |
| Sidenav size | `sessionStorage` | `bx.sidenav.size` |
| Sidenav color | `sessionStorage` | `bx.sidenav.color` |
| Topbar color | `sessionStorage` | `bx.topbar.color` |
| Layout width | `sessionStorage` | `bx.layout.width` |

`data-layout` (vertical / horizontal) is **not** stored — it's pinned by the page's layout file and switched via navigation. The customizer's "Vertical / Horizontal" buttons are `<a>` tags pointing at the equivalent page in the parallel set.

The early-paint script in `src/html/_includes/layouts/base.njk` restores `data-bs-theme` and `data-sidenav-size` before the page paints to prevent flash. **In the ColdBox port, read the `bx.theme` cookie in the layout and emit `data-bs-theme="#prc.theme#"` (and `data-sidenav-size="#prc.sidenavSize#"`) server-side on `<html>` so the guard script becomes unnecessary.**

---

## Layout architecture

Two parallel page sets — vertical (default, full feature set) and horizontal (12 mirrored pages). Switching layouts is navigation — both have their own root layout file and chrome.

| Layout | File | Pages |
|---|---|---|
| Vertical | `_includes/layouts/vertical.njk` | All 50+ pages |
| Horizontal | `_includes/layouts/horizontal.njk` | `/horizontal/*` (12 mirror pages) |
| Auth | `_includes/layouts/auth.njk` | `/auth/*` (4 pages) |
| Blank | `_includes/layouts/blank.njk` | `/errors/*` (3 pages) |

---

## Per-page page modules

Pages opt into JS via `page_module: <name>` in front matter. The `<body>` gets `data-bx-page="<name>"`, and `src/js/app.js` lazy-loads `src/js/pages/<name>.js`. Adding a new page module:

1. Create `src/js/pages/my-page.js` exporting `init()`.
2. Add a case in the switch in `src/js/app.js`.
3. Set `page_module: my-page` in the page's front matter.

Page modules registered today: `dashboard`, `realtime`, `analytics`, `sales`, `ai-ops`, `ai-chat`, `calendar`, `kanban`, `forms-advanced`, `tables-dt`, `tables-gridjs`, `charts-line`, `charts-bar`, `charts-mixed`.

---

## Per-page vendor CSS

Heavy plugin CSS is loaded only on pages that need it via front-matter:

```yaml
pageVendorCss:
  - choices
  - flatpickr
  - quill.snow
  - dropzone
  - sweetalert2
  - nouislider
  - simple-datatables
  - gridjs
```

The build step (`tools/copy-assets.mjs`) copies the relevant files from `node_modules` to `dist/assets/vendor/`. BX-AI+ overrides for these libraries live in `src/scss/plugins/` and load globally via `app.css`, but the structural CSS only loads where needed.

---

## Build pipeline

Three independent steps orchestrated by npm scripts:

| Tool | Command | Outputs |
|---|---|---|
| Eleventy | `npm run build:html` | `dist/**/*.html` |
| Sass + PostCSS | `npm run build:css` | `dist/assets/css/app.css` + `app.min.css` |
| esbuild | `npm run build:js` | `dist/assets/js/app.js` + `app.min.js` |
| copy-assets | `npm run build:assets` | `dist/assets/{images,fonts,icons,vendor}` |

`npm run dev` runs all four in watch mode behind browser-sync.

### esbuild gotcha

The esbuild config in `tools/build-js.mjs` includes:
```js
define: { global: "globalThis" }
```
This is **required** — some bundled CJS packages (Dragula → crossvent → custom-event) reference Node's `global` symbol, which doesn't exist in browsers. Substituting with `globalThis` keeps them working. Don't remove this without a replacement.

---

## Charts (ApexCharts)

All charts use shared theming defaults from `src/js/components/apex-defaults.js`:

```js
import { palette, themeSettings } from "../components/apex-defaults.js";
const t = themeSettings();
new ApexCharts(el, {
  chart: { ...t.chart, type: "area" },
  colors: palette(),
  grid: t.grid, xaxis: t.xaxis, yaxis: t.yaxis,
  legend: t.legend, tooltip: t.tooltip,
  series: [...]
});
```

Pages with charts re-skin on theme flip by listening for `bx:layoutchange` and calling `chart.updateOptions(...)`. See `src/js/pages/dashboard.js` for the canonical pattern.

---

## Brand assets

- `src/assets/images/brand/bx-ai-icon-full.png` — favicon + tile-framed mark (dark contexts)
- `src/assets/images/brand/bx-ai-icon-full.svg` — transparent BoxLang mark (inline use)

Both are copied from the parent project — replace with final brand assets before shipping.

---

## Known limitations / scope notes

- **No real Web Speech API** — voice toast is a fully mocked state-machine animation. Easy to swap in `voice-toast.js`.
- **No backend** — every form submission, button action, and API call is mocked. Replace handlers per the table above.
- **Lucide icon set is fully bundled** (~600KB minified). For production, switch to per-icon imports — Lucide supports tree-shaking out of the box. See `src/js/core/icons.js`.
- **Bundle size: 1.5 MB minified.** This includes Bootstrap, ApexCharts, FullCalendar, all form plugins, and Lucide. Code-splitting via `import()` already reduces per-page payload. Aggressive trimming + Lucide tree-shake would cut this in half.
- **No service worker / offline.** Out of scope for the demo; trivial to add via Workbox if needed.
- **Self-host fonts** before shipping behind firewalls. Currently loaded from Google Fonts CDN in `_includes/layouts/base.njk`.

---

## Quick handoff checklist

- [ ] Replace mock AI replies (`src/js/ai/mock-ai.js`) with real endpoint
- [ ] Wire stat-card counters to live metrics (`src/js/components/stat-card.js`)
- [ ] Replace mocked notifications data with live feed
- [ ] Replace seeded chart data with real queries
- [ ] Replace voice waveform mock with real STT
- [ ] Audit `pageVendorCss` front-matter on pages that use plugins
- [ ] Self-host fonts (remove Google Fonts CDN)
- [ ] Replace brand assets with finals
- [ ] Tree-shake Lucide to per-icon imports
- [ ] Run `npm run build` and verify `dist/` is clean
