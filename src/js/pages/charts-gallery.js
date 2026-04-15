// ---------------------------------------------------------------------------
// pages/charts-gallery.js — single module that mounts all chart variants
// referenced by `data-bx-chart="kind"` on the line-area, bar-column, and
// mixed chart pages.
// ---------------------------------------------------------------------------

import ApexCharts from "apexcharts";

import { palette, themeSettings } from "../components/apex-defaults.js";

const charts = [];

function months(n = 12) {
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return m.slice(0, n);
}

const FACTORIES = {
  // ---- Line / area ----
  line: () => ({
    chart: { type: "line", height: 280 },
    series: [{ name: "Revenue", data: [820, 880, 920, 860, 940, 1080, 1240, 1380, 1420, 1560, 1640, 1482] }],
    stroke: { curve: "smooth", width: 3 },
    xaxis: { categories: months() },
    markers: { size: 4 }
  }),
  "multi-line": () => ({
    chart: { type: "line", height: 280 },
    series: [
      { name: "summarizer-v3", data: [128,142,138,150,160,178,194,205,220,235,245,260] },
      { name: "planner-alpha", data: [212,234,225,210,198,205,228,245,260,280,295,310] },
      { name: "retriever-xl",  data: [ 88, 96,102,108,118,126,134,140,150,158,166,172] }
    ],
    stroke: { curve: "smooth", width: 2 },
    xaxis: { categories: months() },
    markers: { size: 4, hover: { size: 6 } }
  }),
  area: () => ({
    chart: { type: "area", height: 280 },
    series: [{ name: "Sessions", data: [12000,13500,14800,15200,16400,17900,18800,19500,20800,22100,23400,24812] }],
    stroke: { curve: "smooth", width: 2 },
    xaxis: { categories: months() }
  }),
  "area-stacked": () => ({
    chart: { type: "area", height: 280, stacked: true },
    series: [
      { name: "Organic",  data: [820,880,920,1020,1140,1280,1420,1560,1700,1840,1980,2140] },
      { name: "Direct",   data: [320,340,360, 380, 410, 440, 470, 500, 530, 560, 590, 620] },
      { name: "Referral", data: [180,190,200, 215, 230, 245, 258, 272, 286, 300, 314, 328] }
    ],
    stroke: { curve: "smooth", width: 2 },
    xaxis: { categories: months() }
  }),
  dashed: () => ({
    chart: { type: "line", height: 300 },
    series: [
      { name: "Closed-won",  data: [82, 88, 92, 86, 94,108,124,138,142,156,164,148] },
      { name: "Forecast",    data: [80, 85, 90, 95,100,110,120,135,145,155,165,170] }
    ],
    stroke: { curve: "smooth", width: [3, 2], dashArray: [0, 6] },
    markers: { size: 0, hover: { size: 5 } },
    xaxis: { categories: months() }
  }),

  // ---- Bar / column ----
  bars: () => ({
    chart: { type: "bar", height: 280 },
    series: [{ name: "Sessions", data: [820,940,1080,1240,1380,1420,1560,1640,1482] }],
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 4 } },
    xaxis: { categories: ["Apr 1","Apr 2","Apr 3","Apr 4","Apr 5","Apr 6","Apr 7","Apr 8","Apr 9"] }
  }),
  hbars: () => ({
    chart: { type: "bar", height: 280 },
    series: [{ name: "Spend (k)", data: [412, 680, 190, 110, 90, 60, 40] }],
    plotOptions: { bar: { horizontal: true, barHeight: "62%", borderRadius: 4 } },
    xaxis: { categories: ["summarizer-v3","planner-alpha","retriever-xl","classifier-m","rewriter-lg","router-s","guardrails"] }
  }),
  grouped: () => ({
    chart: { type: "bar", height: 280 },
    series: [
      { name: "Production", data: [44, 55, 57, 56, 61, 58] },
      { name: "Staging",    data: [28, 35, 40, 32, 36, 30] }
    ],
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 4 } },
    xaxis: { categories: ["Jan","Feb","Mar","Apr","May","Jun"] }
  }),
  stacked: () => ({
    chart: { type: "bar", height: 280, stacked: true },
    series: [
      { name: "Prompt",     data: [280, 420, 140, 110,  90,  60,  40] },
      { name: "Completion", data: [132, 260,  50,  44,  28,  18,  12] }
    ],
    plotOptions: { bar: { columnWidth: "52%", borderRadius: 4 } },
    xaxis: { categories: ["summarizer-v3","planner-alpha","retriever-xl","classifier-m","rewriter-lg","router-s","guardrails"] }
  }),
  donut: () => ({
    chart: { type: "donut", height: 240 },
    series: [21, 4, 2, 1],
    labels: ["Healthy","Degraded","Errored","Paused"],
    plotOptions: { pie: { donut: { size: "70%" } } },
    legend: { position: "bottom" }
  }),
  pie: () => ({
    chart: { type: "pie", height: 240 },
    series: [44, 28, 18, 10],
    labels: ["Desktop","Mobile","Tablet","Other"],
    legend: { position: "bottom" }
  }),
  radial: () => ({
    chart: { type: "radialBar", height: 240 },
    series: [78, 64, 92],
    labels: ["Tasks","Tokens","Cache"],
    plotOptions: { radialBar: { hollow: { size: "44%" } } }
  }),

  // ---- Mixed / specialty ----
  combo: () => ({
    chart: { type: "line", height: 320 },
    series: [
      { name: "Tokens (k)",  type: "column", data: [320, 380, 410, 460, 510, 560, 610, 660, 700, 740, 790, 820] },
      { name: "p95 latency", type: "line",   data: [220, 234, 225, 210, 205, 198, 196, 201, 194, 192, 188, 192] }
    ],
    stroke: { width: [0, 3] },
    plotOptions: { bar: { columnWidth: "50%", borderRadius: 4 } },
    xaxis: { categories: months() }
  }),

  "spark-area": () => ({
    chart: { type: "area", height: 80, sparkline: { enabled: true } },
    series: [{ data: [12,14,18,20,22,28,32,36,40,44,52,58] }],
    stroke: { curve: "smooth", width: 2 }
  }),
  "spark-bars": () => ({
    chart: { type: "bar", height: 80, sparkline: { enabled: true } },
    series: [{ data: [5,8,10,7,11,14,12,15,9,13,16,18] }]
  }),
  "spark-line": () => ({
    chart: { type: "line", height: 80, sparkline: { enabled: true } },
    series: [{ data: [220,234,225,210,205,198,196,201,194,192,188,192] }],
    stroke: { curve: "smooth", width: 2 }
  }),
  "spark-pie": () => ({
    chart: { type: "donut", height: 80, sparkline: { enabled: true } },
    series: [21, 4, 2, 1],
    plotOptions: { pie: { donut: { size: "60%" } } }
  }),

  radar: () => ({
    chart: { type: "radar", height: 300 },
    series: [
      { name: "v1",  data: [80, 65, 70, 60, 75, 85] },
      { name: "v2",  data: [88, 78, 82, 74, 80, 92] }
    ],
    xaxis: { categories: ["Latency","Quality","Cost","Throughput","Recovery","Safety"] }
  }),

  heatmap: () => ({
    chart: { type: "heatmap", height: 300 },
    series: Array.from({ length: 6 }, (_, i) => ({
      name: ["Mon","Tue","Wed","Thu","Fri","Sat"][i],
      data: Array.from({ length: 12 }, (_, h) => ({
        x: `${h * 2}h`,
        y: Math.floor(20 + Math.sin(i + h / 2) * 30 + Math.random() * 25)
      }))
    })),
    plotOptions: { heatmap: { radius: 4 } }
  })
};

function build(el) {
  const kind = el.getAttribute("data-bx-chart");
  const factory = FACTORIES[kind];
  if (!factory) return;

  const t = themeSettings();
  const cfg = factory();
  const isSparkline = cfg.chart?.sparkline?.enabled;

  const merged = {
    ...cfg,
    chart: {
      foreColor: t.chart.foreColor,
      fontFamily: "inherit",
      toolbar: { show: false },
      animations: { enabled: true, easing: "easeOutSine", speed: 400 },
      ...cfg.chart
    },
    colors: cfg.colors || palette(),
    dataLabels: cfg.dataLabels ?? { enabled: false },
    grid: isSparkline ? { show: false } : { ...t.grid, ...(cfg.grid || {}) },
    xaxis: isSparkline ? cfg.xaxis : { ...t.xaxis, ...(cfg.xaxis || {}) },
    yaxis: isSparkline ? cfg.yaxis : { ...t.yaxis, ...(cfg.yaxis || {}) },
    legend: { ...t.legend, ...(cfg.legend || {}) },
    tooltip: { ...t.tooltip, ...(cfg.tooltip || {}) }
  };

  const chart = new ApexCharts(el, merged);
  chart.render();
  charts.push({ chart, factory });
}

function refreshTheme() {
  const t = themeSettings();
  for (const { chart } of charts) {
    try {
      chart.updateOptions({
        theme: t.theme,
        chart: { foreColor: t.chart.foreColor },
        tooltip: t.tooltip,
        grid: t.grid,
        xaxis: t.xaxis,
        yaxis: t.yaxis,
        legend: t.legend
      }, false, false);
    } catch (_) {}
  }
}

export function init() {
  document.querySelectorAll("[data-bx-chart]").forEach(build);
  document.addEventListener("bx:layoutchange", (e) => {
    if (e.detail?.key === "bs-theme") requestAnimationFrame(refreshTheme);
  });
}
