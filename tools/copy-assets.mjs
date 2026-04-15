// ---------------------------------------------------------------------------
// tools/copy-assets.mjs
// Mirrors src/assets/** → dist/assets/** (images, fonts, icons),
// plus copies vendor plugin CSS files we need at the page level.
//
// Flags:
//   --watch    Re-copy on change
// ---------------------------------------------------------------------------

import { cp, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const srcDir = resolve(root, "src/assets");
const outDir = resolve(root, "dist/assets");
const vendorOut = resolve(outDir, "vendor");

// Plugin CSS files we link via <link> tags on pages that need them.
// The BX-AI+ override SCSS lives in src/scss/plugins/* and theme on top.
const VENDOR_CSS = [
  ["choices.js/public/assets/styles/choices.css",   "choices.css"],
  ["flatpickr/dist/flatpickr.min.css",              "flatpickr.css"],
  ["nouislider/dist/nouislider.css",                "nouislider.css"],
  ["quill/dist/quill.snow.css",                     "quill.snow.css"],
  ["dropzone/dist/dropzone.css",                    "dropzone.css"],
  ["sweetalert2/dist/sweetalert2.min.css",          "sweetalert2.css"],
  ["simplebar/dist/simplebar.css",                  "simplebar.css"],
  ["simple-datatables/dist/style.css",              "simple-datatables.css"],
  ["gridjs/dist/theme/mermaid.min.css",             "gridjs.css"]
];

async function copyVendor() {
  await mkdir(vendorOut, { recursive: true });
  let ok = 0, miss = 0;
  for (const [src, dest] of VENDOR_CSS) {
    if (!dest) continue;
    const from = resolve(root, "node_modules", src);
    if (!existsSync(from)) { miss++; continue; }
    await copyFile(from, resolve(vendorOut, dest));
    ok++;
  }
  console.log(`[assets] Vendor CSS copied: ${ok} files (${miss} skipped)`);
}

async function mirror() {
  if (!existsSync(srcDir)) {
    console.log("[assets] No src/assets yet — skipping");
    return;
  }
  await mkdir(outDir, { recursive: true });
  await cp(srcDir, outDir, { recursive: true, force: true });
  await copyVendor();
  console.log(`[assets] Copied src/assets → dist/assets`);
}

await mirror();

if (process.argv.includes("--watch")) {
  const watcher = chokidar.watch(srcDir, { ignoreInitial: true });
  watcher.on("all", (evt, path) => {
    console.log(`[assets] ${evt} ${relative(root, path)}`);
    mirror();
  });
  console.log("[assets] Watching src/assets for changes...");
}
