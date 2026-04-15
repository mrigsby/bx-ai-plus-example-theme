// ---------------------------------------------------------------------------
// tools/build-css.mjs
// Compiles src/scss/app.scss → dist/assets/css/app.css + app.min.css
// Pipeline: Sass → PostCSS (autoprefixer + cssnano for min)
//
// Flags:
//   --watch    Re-compile on .scss change (via chokidar)
// ---------------------------------------------------------------------------

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import chokidar from "chokidar";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const entry = resolve(root, "src/scss/app.scss");
const outDir = resolve(root, "dist/assets/css");
const outFile = resolve(outDir, "app.css");
const outMin = resolve(outDir, "app.min.css");

const watchMode = process.argv.includes("--watch");

async function build() {
  const started = Date.now();
  try {
    const result = sass.compile(entry, {
      style: "expanded",
      loadPaths: [resolve(root, "node_modules"), resolve(root, "src/scss")],
      sourceMap: false,
      // Bootstrap 5.3 still uses legacy color functions (red(), green(), mix()...)
      // which Dart Sass warns about. Silence those specific warnings so our
      // build stays quiet without hiding real issues.
      silenceDeprecations: ["color-functions", "global-builtin", "import", "slash-div"],
      quietDeps: true
    });

    const processed = await postcss([autoprefixer]).process(result.css, { from: undefined });
    const minified = await postcss([cssnano({ preset: "default" })]).process(processed.css, { from: undefined });

    await mkdir(outDir, { recursive: true });
    await writeFile(outFile, processed.css);
    await writeFile(outMin, minified.css);

    console.log(`[css] Built app.css (${(processed.css.length / 1024).toFixed(1)} KB) + app.min.css in ${Date.now() - started}ms`);
  } catch (err) {
    console.error("[css] Build failed:", err.message);
    if (!watchMode) process.exitCode = 1;
  }
}

await build();

if (watchMode) {
  const watcher = chokidar.watch(resolve(root, "src/scss/**/*.scss"), { ignoreInitial: true });
  watcher.on("all", (evt, path) => {
    console.log(`[css] ${evt} ${path}`);
    build();
  });
  console.log("[css] Watching src/scss for changes...");
}
