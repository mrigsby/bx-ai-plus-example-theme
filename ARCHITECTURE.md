# BX-AI+ Architecture

## Toolchain

| Tool | Role |
|---|---|
| Eleventy 3 | HTML templating (Nunjucks), partials, build-time includes, `_data/` globals |
| Sass CLI (dart-sass) | SCSS compilation — `src/scss/app.scss` → `dist/assets/css/app.css` |
| PostCSS + autoprefixer + cssnano | Vendor prefixing + minification |
| esbuild | JS bundling — `src/js/app.js` → `dist/assets/js/app.js` |
| browser-sync | Live-reload dev server |
| chokidar | Watchers (CSS, asset mirror) |

## Layering

```
Bootstrap 5 SCSS (node_modules)
        ↓ var overrides via src/scss/config/_variables.scss
        ↓ imported in src/scss/app.scss
BX-AI+ custom tokens (config/_variables-custom.scss) — --bx-* CSS vars
        ↓
Theme-mode pivot (config/_theme-mode.scss) — light-theme overrides
        ↓
Structure, components, ai, pages, plugins, utilities partials
        ↓
Compiled app.css + app.min.css
```

## Data-attribute layout controller

All layout state lives on `<html>` as `data-*` attributes. A single controller in `src/js/core/layout.js` reads, writes, and persists them to storage, and dispatches a `bx:layoutchange` event so charts/plugins can restyle.

| Attribute | Values |
|---|---|
| `data-bs-theme` | `dark` \| `light` |
| `data-layout` | `vertical` \| `horizontal` |
| `data-sidenav-size` | `default` \| `compact` \| `hover` \| `offcanvas` |
| `data-sidenav-color` | `dark` \| `light` \| `brand` |
| `data-topbar-color` | `dark` \| `light` \| `brand` |
| `data-layout-width` | `fluid` \| `boxed` |

## Seam markers

Every shared partial wraps its output in `<!-- BEGIN :: NAME --> … <!-- END :: NAME -->` comments emitted via the `{% seamBegin "NAME" %}` / `{% seamEnd "NAME" %}` Eleventy shortcodes. These survive HTML compilation and give the later **ColdBox port** a mechanical find-and-replace path — each seam maps to a `view()` call in the module's layout (see `BOXLANG-PORT-NOTES.md` § "Seam inventory" for the exact calls).

## Third-party library roster

Signed off at end of Phase 2.

| Library | Role | Notes |
|---|---|---|
| Bootstrap 5.3 | Framework | Imported from node_modules via SCSS + esbuild JS bundle |
| ApexCharts | Primary chart library | Dashboard widgets, sparklines, analytics |
| SimpleBar | Custom scrollbars | Sidenav, chat panel, notifications list |
| Lucide | Primary icon library | Data-attribute auto-init (`<i data-lucide="…">`) |
| FullCalendar | Calendar app | Apps section |
| simple-datatables | Advanced tables | Vanilla substitution for DataTables.net (no jQuery) |
| GridJS | Modern table demo | Alternative to simple-datatables |
| Choices.js | Enhanced select | Replaces Select2 (no jQuery) |
| Flatpickr | Date / time / range pickers | |
| Inputmask | Masked inputs | |
| noUiSlider | Range sliders | |
| Quill | Rich text editor | Email composer, prompt library |
| Dropzone | File upload with preview | |
| SweetAlert2 | Styled alert/confirm dialogs | |
| Dragula | Drag & drop | Kanban, sortable lists |
| jsVectorMap | Vector world map | One demo only |
| Leaflet | Tiled map | One demo only |

**Skipped** (documented for posterity): Select2 (redundant with Choices); Chart.js (redundant with Apex); Pickr (use native color input); Google Maps (API key friction); Date Range Picker (Flatpickr covers it); DataTables KeyTable/Select/FixedColumns (niche); AOS; Toastify (use Bootstrap Toast).

**Icons:** Lucide primary. Tabler icons optional on the icon-gallery page in Phase 8.

**Fonts:** Inter + JetBrains Mono. Loaded via Google Fonts CDN in Phase 2; self-hosted package created in Phase 3+ if offline-first deploys are required.

### jQuery-free guarantee
Every library in the roster is vanilla JS or can be driven without jQuery. This is an explicit constraint — no library that transitively requires jQuery is permitted.
