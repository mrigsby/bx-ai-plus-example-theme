// ---------------------------------------------------------------------------
// pages/realtime.js — fast-updating live chart + counters.
// ---------------------------------------------------------------------------

import ApexCharts from "apexcharts";

import { makeDrifter, mulberry32 } from "../util/rng.js";
import { formatValue } from "../util/format.js";
import { palette, themeSettings } from "../components/apex-defaults.js";

const TICK_MS = 900;

let liveChart;
let handles = [];

function pumpStat(el, seed) {
  const valueEl = el.querySelector("[data-bx-stat-value]");
  const pulseEl = el.querySelector("[data-bx-stat-pulse]");
  const min = parseFloat(el.getAttribute("data-bx-stat-drift-min"));
  const max = parseFloat(el.getAttribute("data-bx-stat-drift-max"));
  const step = parseFloat(el.getAttribute("data-bx-stat-drift-step"));
  const format = el.getAttribute("data-bx-stat-format") || "decimal";
  const start = parseFloat(valueEl.textContent) || 0;

  const rng = mulberry32(seed * 757 + 3);
  const d = makeDrifter({ value: start, min, max, stepMax: step, rng });

  const h = setInterval(() => {
    const v = d();
    valueEl.textContent = formatValue(v, format);
    valueEl.classList.remove("is-pulsing");
    void valueEl.offsetWidth;
    valueEl.classList.add("is-pulsing");
    if (pulseEl) {
      pulseEl.classList.remove("is-pulsing");
      void pulseEl.offsetWidth;
      pulseEl.classList.add("is-pulsing");
    }
  }, TICK_MS + (seed % 200));
  handles.push(h);
}

function buildLiveChart() {
  const el = document.querySelector("[data-bx-chart-realtime]");
  if (!el) return;

  const t = themeSettings();
  const now = Date.now();
  const points = 60;
  const initial = Array.from({ length: points }, (_, i) => ({
    x: now - (points - i) * 1000,
    y: 120 + Math.sin(i / 4) * 14 + (Math.random() * 10 - 5)
  }));

  liveChart = new ApexCharts(el, {
    chart: {
      ...t.chart,
      type: "area",
      height: 320,
      animations: { enabled: true, easing: "linear", dynamicAnimation: { speed: 800 } },
      toolbar: { show: false }
    },
    series: [{ name: "Requests/sec", data: initial }],
    colors: [palette()[0]],
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] }
    },
    xaxis: {
      ...t.xaxis,
      type: "datetime",
      labels: { ...t.xaxis.labels, datetimeUTC: false, format: "HH:mm:ss" },
      range: points * 1000
    },
    yaxis: { ...t.yaxis, min: 80, max: 200 },
    grid: t.grid,
    legend: { show: false },
    markers: { size: 0 },
    tooltip: { ...t.tooltip, x: { format: "HH:mm:ss" } }
  });
  liveChart.render();

  let lastX = now;
  let lastY = 120;
  const h = setInterval(() => {
    lastX += 1000;
    lastY = Math.max(80, Math.min(200, lastY + (Math.random() * 18 - 9)));
    liveChart.appendData([{ data: [{ x: lastX, y: Math.round(lastY) }] }]);
  }, 1000);
  handles.push(h);
}

export function init() {
  document.querySelectorAll("[data-bx-stat-id]").forEach((el, idx) => pumpStat(el, idx + 1));
  buildLiveChart();

  document.addEventListener("bx:layoutchange", (e) => {
    if (e.detail?.key !== "bs-theme" || !liveChart) return;
    const t = themeSettings();
    liveChart.updateOptions({
      theme: t.theme,
      chart: { foreColor: t.chart.foreColor },
      xaxis: t.xaxis,
      yaxis: t.yaxis,
      grid: t.grid,
      tooltip: t.tooltip,
      colors: [palette()[0]]
    }, false, false);
  });
}

export function teardown() {
  for (const h of handles) clearInterval(h);
  handles = [];
  if (liveChart) { try { liveChart.destroy(); } catch (_) {} liveChart = null; }
}
