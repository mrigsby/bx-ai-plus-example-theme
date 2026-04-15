// ---------------------------------------------------------------------------
// tools/build-js.mjs
// Bundles src/js/app.js → dist/assets/js/app.js + app.min.js via esbuild.
//
// Flags:
//   --watch    Re-bundle on source change
// ---------------------------------------------------------------------------

import { context, build } from "esbuild";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const common = {
  entryPoints: [resolve(root, "src/js/app.js")],
  bundle: true,
  format: "iife",
  target: ["es2020"],
  logLevel: "info",
  loader: { ".svg": "text", ".png": "file", ".woff2": "file", ".woff": "file" },
  // Some bundled CommonJS modules (dragula → crossvent → custom-event) reference
  // the Node-only `global` symbol. Substitute the standard browser equivalent
  // so they evaluate without throwing "global is not defined" at load time.
  define: {
    global: "globalThis"
  }
};

const watchMode = process.argv.includes("--watch");

async function run() {
  if (watchMode) {
    const ctx = await context({
      ...common,
      outfile: resolve(root, "dist/assets/js/app.js"),
      sourcemap: true,
      minify: false
    });
    await ctx.watch();
    console.log("[js] Watching src/js for changes...");
  } else {
    await build({
      ...common,
      outfile: resolve(root, "dist/assets/js/app.js"),
      sourcemap: true,
      minify: false
    });
    await build({
      ...common,
      outfile: resolve(root, "dist/assets/js/app.min.js"),
      sourcemap: false,
      minify: true
    });
    console.log("[js] Built app.js + app.min.js");
  }
}

run().catch((err) => {
  console.error("[js] Build failed:", err.message);
  process.exitCode = 1;
});
