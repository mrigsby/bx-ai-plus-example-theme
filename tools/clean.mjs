// ---------------------------------------------------------------------------
// tools/clean.mjs
// Wipes the dist/ directory before a fresh build.
// ---------------------------------------------------------------------------

import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "..", "dist");

await rm(distDir, { recursive: true, force: true });
console.log(`[clean] Removed ${distDir}`);
