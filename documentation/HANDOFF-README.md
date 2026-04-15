# BX-AI+ Theme — Handoff

Welcome. This is the static BX-AI+ dashboard theme that will become the **BoxLang AI+ ColdBox 8.1+ module's UI** (ColdBox module running on a BoxLang server). This one-pager gets you running and points at the deeper docs.

---

## What's in the handoff

| Artifact | What it is |
|---|---|
| `bx-ai-plus-theme-dist.zip` | Pre-built static site — drop on any HTTP server and open `/index.html`. No build required. |
| `OUTPUT/` (source tree) | The full SCSS / Eleventy / esbuild project. Rebuild with `npm install && npm run build`. |
| `screenshots/` | 61 full-page captures (30 pages × dark + light) for visual reference. |
| `BOXLANG-PORT-NOTES.md` | **Read this second.** Complete port guide — seam inventory, data shapes, mock→real swap table, build gotchas. |
| `ARCHITECTURE.md` | Developer-facing architecture notes — toolchain, layering, data attributes, third-party libs. |
| `/documentation/` (inside dist) | Live in-app dev reference. Covers tokens, layouts, widgets, charts, seam markers, porting. |

---

## Run the static theme in 30 seconds

```bash
unzip bx-ai-plus-theme-dist.zip
cd dist
python3 -m http.server 8080   # or any static server
open http://localhost:8080
```

No backend, no build step, no Node runtime required — every page is static HTML/CSS/JS.

## Rebuild from source

```bash
cd OUTPUT
npm install
npm run dev      # live-reload dev server at :3000
npm run build    # production build → dist/
```

Node ≥ 20 required (`.nvmrc` pins the major version).

---

## What the theme is

An AI-centric Bootstrap 5 admin dashboard — **70 HTML pages**, dark-first with a light pivot, SCSS-driven, zero jQuery, all plugins are vanilla JS. Core flagship features:

- **AI chat bar** — topbar pill or <kbd>⌘K</kbd> anywhere opens a command-palette modal, submissions stream into a right-offcanvas AI chat panel with mock replies.
- **Voice toast** — microphone button triggers a bottom-right recording toast with animated waveform, processing spinner, and transcript review. State-machine driven (idle → listening → processing → result → error).
- **AI insight cards** — four variants (anomaly / suggestion / query / summary) across dashboards, each with contextual "Ask AI" buttons.
- **Live-updating widgets** — stat cards "breathe" every few seconds via seeded drift; realtime dashboard streams a rolling 60-second chart.
- **Two layouts** — vertical sidebar (default, ~54 pages) + horizontal nav strip (parallel page set under `/horizontal/`, 12 mirrors). Customizer offcanvas swaps theme/size/color variants with storage persistence.
- **Contextual AI affordances** — every widget has a "3-dot → Ask AI about this" action that passes widget context into the chat panel.

## What the theme is NOT

- No backend. Every form submits nowhere. Every API call is mocked.
- No real voice transcription — the waveform is a seeded-RNG animation, the transcript is a canned string.
- No real AI. Replies come from `src/js/ai/mock-ai.js` regex-matched to buckets.
- No authentication. The `/auth/*` pages are visual only.
- No database, no realtime socket, no telemetry. All chart data is hand-seeded in `src/html/_data/*.json`.

**The port job** is wrapping this static UI in a ColdBox 8.1+ module and replacing the mocks with real handlers/models on BoxLang. See `BOXLANG-PORT-NOTES.md` — it's comprehensive.

---

## Key conventions the ColdBox port must preserve

1. **CSS custom properties drive the theme.** Every visual value lives in `--bx-*` tokens defined in `src/scss/config/_variables-custom.scss`. Changing the palette is a single-file edit. Don't hardcode colors in new components.

2. **HTML data attributes drive layout state.**
   - `<html data-bs-theme="dark|light">` — theme
   - `<html data-sidenav-size="default|compact|hover|offcanvas">` — sidenav size
   - `<html data-sidenav-color|data-topbar-color="dark|light|brand">` — skin
   - `<html data-layout="vertical|horizontal">` — set by the page's layout file, navigation-driven, NOT runtime-toggleable

3. **Seam markers preserve port targets.** Every shared region is wrapped with HTML comments:
   ```html
   <!-- BEGIN :: TOPBAR -->
   … topbar markup …
   <!-- END :: TOPBAR -->
   ```
   These survive Eleventy compilation. A ColdBox port can grep for them and replace each chunk with a `view()` call — e.g. the `TOPBAR` block becomes `#view( view="partials/topbar", module="bxaiplus" )#` in `layouts/Main.cfm`. 16 unique seam names — run `grep -hoE "BEGIN :: [A-Z_]+" dist/**/*.html | sort -u` to list them.

4. **Menu + data shapes are pre-locked.** All page data lives as JSON in `src/html/_data/`. Each file corresponds to a ColdBox model method whose return struct matches the documented shape; handlers (or a `preLayout` interceptor) place those structs onto `prc` under the same top-level keys so views read them unchanged. Exact schemas documented in `BOXLANG-PORT-NOTES.md` § "Data shapes".

5. **Page modules lazy-load.** Only pages that need ApexCharts, FullCalendar, Dragula, etc. get them. The opt-in is `page_module: <name>` in front matter + a case in `src/js/app.js`. Add new pages the same way.

---

## Directory map

```
OUTPUT/
├── src/
│   ├── html/                 Eleventy input — pages, layouts, partials, _data
│   │   ├── _data/            All page data (menu.json, dashboard.json, etc.)
│   │   ├── _includes/        Layouts + partials (seams live here)
│   │   └── …                 Pages, organized by section
│   ├── scss/
│   │   ├── config/           Tokens, Bootstrap overrides, theme-mode
│   │   ├── structure/        Topbar, sidenav, content, customizer
│   │   ├── components/       Bootstrap component overrides
│   │   ├── ai/               Chat bar, voice toast, insight cards
│   │   ├── pages/            Page-specific styles
│   │   └── plugins/          Third-party library theming
│   ├── js/
│   │   ├── core/             Layout, theme, sidenav, icons, tooltips
│   │   ├── ai/               Chat, voice, mock-ai, ai-inline
│   │   ├── components/       Stat-card, apex-defaults, notifications
│   │   ├── pages/            Per-page modules (lazy-loaded)
│   │   └── util/             rng, format, dom
│   └── assets/               Images, brand, fonts
├── tools/                    Build scripts (clean, css, js, asset copy, screenshot tour)
├── dist/                     Build output — this is what ships
├── screenshots/              Output of `node tools/screenshot-tour.mjs`
├── ARCHITECTURE.md           Developer-facing architecture notes
├── BOXLANG-PORT-NOTES.md     Full port guide — read this for porting
└── HANDOFF-README.md         You are here
```

---

## Where to start reading

1. **This README** — you just did it. ✔︎
2. **`BOXLANG-PORT-NOTES.md`** — the port guide. Seam inventory, data shapes, mock→real table.
3. **`ARCHITECTURE.md`** — for how the pipeline is wired.
4. **`/documentation/index.html` inside the dist** — live, browsable, same content as above but with working code examples.
5. **Pick a page like `src/html/index.njk`** — read top to bottom, follow the partial includes, trace a widget from HTML → SCSS → JS.

## Gotchas worth knowing up front

- **esbuild + `global`.** Some bundled CJS packages (Dragula transitively) reference Node's `global`. `tools/build-js.mjs` has `define: { global: "globalThis" }` — don't remove it.
- **Vendor CSS load order.** `pageVendorCss:` front-matter items are linked **before** `app.css` on purpose so BX overrides win without `!important` everywhere.
- **Lucide is fully bundled** (~600KB). Switch to per-icon imports before shipping if bundle size matters.
- **Google Fonts CDN** is used for Inter + JetBrains Mono. Self-host before deploying behind a corporate firewall.
- **`data-layout` is navigation, not state.** Don't try to toggle vertical ↔ horizontal in JS — route the user to the parallel `/horizontal/*` page instead. The customizer does this.
- **Theme persistence split:** `localStorage['bx.theme']` for theme (sticky), `sessionStorage['bx.sidenav.*']` for layout toggles (per-tab).

## Running the screenshot tour yourself

```bash
npm run build
npm run tour         # npm script added in package.json
# → screenshots/*.png
```

---

## Final-ship checklist

- [ ] Replace mock AI replies (`src/js/ai/mock-ai.js`) with a ColdBox handler action (e.g. `bxaiplus:ai.ask`) that proxies to the BoxLang AI service
- [ ] Wire live stat-card counters (`src/js/components/stat-card.js`) to a real metrics feed (SSE from a ColdBox handler or a CBWire component)
- [ ] Replace `_data/notifications.json` with `NotificationService` output populated onto `prc.notifications`
- [ ] Replace seeded chart data with real queries
- [ ] Replace voice waveform mock with real STT
- [ ] Self-host Inter + JetBrains Mono (remove Google Fonts CDN)
- [ ] Replace brand assets in `src/assets/images/brand/` with finals
- [ ] Tree-shake Lucide to per-icon imports
- [ ] Add a service worker if offline matters
- [ ] `npm run build` — verify `dist/` is clean

Questions during port: the seam inventory (with exact `view()` calls) and data-shape tables in `BOXLANG-PORT-NOTES.md` are the authoritative reference. Start there.
