// One-shot script: creates empty SCSS stub partials with consistent headers.
// Run once at Phase 2 kickoff; safe to re-run (skips existing non-empty files).

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const scssDir = resolve(__dirname, "..", "src/scss");

const manifest = {
  components: [
    "_accordion", "_alerts", "_avatars", "_badges", "_breadcrumbs",
    "_buttons", "_cards", "_dropdowns", "_forms", "_icons",
    "_list-group", "_modal", "_navs", "_offcanvas", "_pagination",
    "_popovers", "_progress", "_tables", "_toasts", "_tooltips"
  ],
  structure: [
    "_layout", "_topbar", "_sidenav", "_sidenav-menu", "_horizontal-nav",
    "_content", "_footer", "_page-title", "_customizer"
  ],
  ai: [
    "_chat-bar", "_chat-panel", "_voice-toast", "_waveform",
    "_ai-glow", "_ai-insight-card", "_ai-inline-prompt"
  ],
  pages: [
    "_auth", "_error", "_dashboard", "_ai-chat", "_profile",
    "_pricing", "_invoice", "_kanban", "_chat", "_email",
    "_calendar", "_documentation"
  ],
  plugins: [
    "_apexcharts", "_simple-datatables", "_gridjs", "_flatpickr", "_choices",
    "_quill", "_simplebar", "_sweetalert2", "_dropzone", "_fullcalendar",
    "_nouislider"
  ],
  utilities: [
    "_shadows", "_gradients", "_hover-effects", "_text",
    "_backgrounds", "_borders", "_animations"
  ]
};

function header(category, name) {
  return `// ---------------------------------------------------------------------------
// ${category}/${name}.scss
//
// Phase 2 stub — populated in later phases.
// ---------------------------------------------------------------------------
`;
}

let created = 0;
let skipped = 0;
for (const [category, names] of Object.entries(manifest)) {
  const dir = resolve(scssDir, category);
  await mkdir(dir, { recursive: true });
  for (const name of names) {
    const path = resolve(dir, `${name}.scss`);
    if (existsSync(path)) {
      const existing = await readFile(path, "utf8");
      if (existing.trim().length > 0) { skipped++; continue; }
    }
    await writeFile(path, header(category, name));
    created++;
  }
}

console.log(`[scaffold-scss] Created ${created} stubs, skipped ${skipped} existing.`);
