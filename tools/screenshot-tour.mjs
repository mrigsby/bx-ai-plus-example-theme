// ---------------------------------------------------------------------------
// tools/screenshot-tour.mjs
// Launches a headless Chromium against a static file server and captures
// a full-page screenshot of every major page in both dark and light theme.
//
// Usage:  node tools/screenshot-tour.mjs
// Output: screenshots/<path-slug>--<theme>.png
// ---------------------------------------------------------------------------

import { chromium } from "playwright";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");
const outDir  = resolve(root, "screenshots");

// ---- A small static file server so Playwright has stable absolute URLs ----
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".woff": "font/woff",
  ".woff2":"font/woff2"
};

async function tryFiles(reqPath) {
  const candidates = [
    reqPath,
    reqPath + "/index.html",
    reqPath + ".html",
    reqPath.replace(/\/$/, "") + "/index.html"
  ];
  for (const rel of candidates) {
    const abs = join(distDir, rel);
    if (existsSync(abs) && (await readFile(abs).then(() => true, () => false))) {
      return abs;
    }
  }
  return null;
}

function startServer(port = 3901) {
  return new Promise((ok, fail) => {
    const srv = http.createServer(async (req, res) => {
      try {
        let urlPath = decodeURIComponent(req.url.split("?")[0]);
        if (urlPath === "/") urlPath = "/index.html";
        const file = await tryFiles(urlPath);
        if (!file) { res.writeHead(404); return res.end("not found"); }
        const body = await readFile(file);
        res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
        res.end(body);
      } catch (err) {
        res.writeHead(500); res.end(String(err));
      }
    });
    srv.listen(port, () => ok({ srv, port }));
    srv.on("error", fail);
  });
}

// ---- The pages we want captured. Keep it opinionated — flagship views. ----
const PAGES = [
  { slug: "00-dashboard",          url: "/" },
  { slug: "01-dashboard-analytics",url: "/dashboards/analytics/" },
  { slug: "02-dashboard-sales",    url: "/dashboards/sales/" },
  { slug: "03-dashboard-ai-ops",   url: "/dashboards/ai-ops/" },
  { slug: "04-dashboard-realtime", url: "/dashboards/realtime/" },
  { slug: "05-ai-chat",            url: "/ai/chat/" },
  { slug: "06-ai-agents",          url: "/ai/agents/" },
  { slug: "07-ai-insights",        url: "/ai/insights/" },
  { slug: "08-apps-calendar",      url: "/apps/calendar/" },
  { slug: "09-apps-kanban",        url: "/apps/kanban/" },
  { slug: "10-apps-email",         url: "/apps/email/inbox/" },
  { slug: "11-apps-chat",          url: "/apps/chat/" },
  { slug: "12-apps-projects",      url: "/apps/projects/" },
  { slug: "13-ui-widgets-gallery", url: "/ui/widgets/" },
  { slug: "14-ui-buttons",         url: "/ui/buttons/" },
  { slug: "15-ui-cards",           url: "/ui/cards/" },
  { slug: "16-forms-advanced",     url: "/forms/advanced/" },
  { slug: "17-forms-wizard",       url: "/forms/wizard/" },
  { slug: "18-tables-datatables",  url: "/tables/datatables/" },
  { slug: "19-tables-gridjs",      url: "/tables/gridjs/" },
  { slug: "20-charts-line-area",   url: "/charts/line-area/" },
  { slug: "21-charts-bar-column",  url: "/charts/bar-column/" },
  { slug: "22-pages-profile",      url: "/pages/profile/" },
  { slug: "23-pages-pricing",      url: "/pages/pricing/" },
  { slug: "24-pages-invoice",      url: "/pages/invoice/" },
  { slug: "25-pages-timeline",     url: "/pages/timeline/" },
  { slug: "26-auth-sign-in",       url: "/auth/sign-in/" },
  { slug: "27-errors-404",         url: "/errors/404/" },
  { slug: "28-horizontal-dashboard",url: "/horizontal/" },
  { slug: "29-documentation",      url: "/documentation/" }
];

const THEMES = ["dark", "light"];
const VIEWPORT = { width: 1440, height: 900 };

async function capture(page, url, theme) {
  await page.goto(url, { waitUntil: "networkidle" });

  // Force the theme BEFORE the next paint — and disable the theme toggle on
  // subsequent pages by writing localStorage.
  await page.evaluate((t) => {
    try { localStorage.setItem("bx.theme", t); } catch (e) {}
    document.documentElement.setAttribute("data-bs-theme", t);
    // Re-skin any charts that listen for bx:layoutchange
    document.dispatchEvent(new CustomEvent("bx:layoutchange", { detail: { key: "bs-theme", value: t } }));
  }, theme);

  // Settle — let chart re-skins, sparkline pulses, and font loading finish.
  await page.waitForTimeout(600);
  await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
  await page.waitForTimeout(200);
}

async function main() {
  if (!existsSync(distDir)) {
    console.error("[tour] dist/ not found — run `npm run build` first.");
    process.exit(1);
  }
  await mkdir(outDir, { recursive: true });

  const { srv, port } = await startServer();
  const base = `http://127.0.0.1:${port}`;
  console.log(`[tour] static server at ${base}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "dark"
  });
  const page = await context.newPage();

  let count = 0;
  for (const p of PAGES) {
    for (const theme of THEMES) {
      const filename = `${p.slug}--${theme}.png`;
      process.stdout.write(`[tour] ${p.url} (${theme}) → ${filename} ... `);
      try {
        await capture(page, base + p.url, theme);
        await page.screenshot({
          path: join(outDir, filename),
          fullPage: true,
          animations: "disabled"
        });
        count++;
        process.stdout.write("ok\n");
      } catch (err) {
        process.stdout.write("FAIL — " + err.message + "\n");
      }
    }
  }

  // One extra bonus shot — the index dashboard with the right AI chat panel open.
  try {
    await page.goto(base + "/");
    await page.evaluate(() => localStorage.setItem("bx.theme", "dark"));
    await page.reload({ waitUntil: "networkidle" });
    await page.evaluate(() => {
      const ev = new CustomEvent("click");
      document.querySelector("[data-bs-toggle='offcanvas'][data-bs-target='#bx-chat-panel']")?.click();
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(outDir, "99-dashboard-with-ai-panel--dark.png"), fullPage: false });
    count++;
    console.log("[tour] bonus: dashboard + AI panel");
  } catch (_) { /* optional */ }

  await browser.close();
  srv.close();

  console.log(`\n[tour] captured ${count} screenshots → ${outDir}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
