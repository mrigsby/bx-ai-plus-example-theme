# BX-AI+ — AI-centric Bootstrap 5 Dashboard Theme

Custom Bootstrap 5 admin theme for Ortus Solutions **BoxLang AI+**. Static HTML/CSS/JS showcase; designed so its partials and conventions can be mechanically ported into a BoxLang-powered module later.

See **[`BX-AI-GENERATE-PLAN.md`](../BX-AI-GENERATE-PLAN.md)** for the full implementation plan and design decisions, and **[`BOXLANG-PORT-NOTES.md`](BOXLANG-PORT-NOTES.md)** for the porting guide.

---

## Prerequisites

- **Node.js ≥ 20** (`.nvmrc` pins the major version)
- **npm ≥ 10** (ships with Node 20)

## Getting started

```bash
# One-time install
npm install

# Full build → dist/
npm run build

# Live-reload dev server (http://localhost:3000)
npm run dev
```

## Project layout

```
src/
├── html/        Eleventy input — pages, layouts, partials, _data
├── scss/        SCSS sources — config, components, structure, ai, pages, plugins, utilities
├── js/          JS modules — core, ai, components, pages, data, util
├── assets/      Images, fonts, brand marks (mirrored 1:1 to dist/assets)
└── static/      Top-level static files (favicons, robots.txt)

tools/           Build scripts — clean, css, js, asset copy
dist/            Build output (gitignored)
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run clean` | Wipe `dist/` |
| `npm run build` | Full production build (HTML + CSS + JS + assets) |
| `npm run build:html` | Eleventy only |
| `npm run build:css` | Sass + PostCSS only |
| `npm run build:js` | esbuild only |
| `npm run dev` | Watch + serve with live reload |

## Theme architecture

- **Bootstrap 5.3** imported from source via SCSS.
- **CSS variables** (`--bx-*`) drive theming; layered on top of Bootstrap's `--bs-*`.
- **HTML data-attributes** control layout state (`data-bs-theme`, `data-layout`, `data-sidenav-size`, etc.) — persisted via storage.
- **Eleventy + Nunjucks** for build-time HTML includes (partials, recursive menu macro).
- **No jQuery.** Vanilla JS modules + Bootstrap 5 JS only.

## Status

**Phase 1 — Foundation & build pipeline.** See the plan for all phases.
