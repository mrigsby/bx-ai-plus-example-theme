// ---------------------------------------------------------------------------
// tools/zip-dist.mjs
// Packages dist/ + handoff docs into a single archive the BoxLang team can
// drop on any static server.
//
// Usage:  node tools/zip-dist.mjs
// Output: bx-ai-plus-theme-dist.zip (in project root)
// ---------------------------------------------------------------------------

import { execFileSync, execSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");
const zipPath = resolve(root, "bx-ai-plus-theme-dist.zip");

if (!existsSync(distDir)) {
  console.error("[zip] dist/ not found — run `npm run build` first.");
  process.exit(1);
}

// Files outside dist/ to include in the archive.
const EXTRAS = [
  "documentation/HANDOFF-README.md",
  "documentation/BOXLANG-PORT-NOTES.md",
  "documentation/ARCHITECTURE.md"
].filter((f) => existsSync(resolve(root, f)));

// Remove any previous archive before rebuilding.
try { execSync(`rm -f "${zipPath}"`); } catch (_) {}

// Build the archive. -r recurse, -9 max compression, -q quiet-ish.
const args = ["-r", "-9", zipPath, "dist"];
for (const f of EXTRAS) args.push(f);

try {
  execFileSync("zip", args, { cwd: root, stdio: "inherit" });
  const size = statSync(zipPath).size;
  const mb = (size / 1024 / 1024).toFixed(1);
  console.log(`\n[zip] ${zipPath} (${mb} MB)`);
  console.log(`[zip] included: dist/ + ${EXTRAS.join(", ")}`);
} catch (err) {
  console.error("[zip] failed:", err.message);
  process.exit(1);
}
