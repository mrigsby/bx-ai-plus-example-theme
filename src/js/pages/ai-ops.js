// ---------------------------------------------------------------------------
// pages/ai-ops.js — secondary dashboard: AI ops / runtime telemetry.
// ---------------------------------------------------------------------------

import ApexCharts from "apexcharts";

import { palette, themeSettings } from "../components/apex-defaults.js";
import { initStatCards, refreshSparkColors } from "../components/stat-card.js";

const registry = [];

function initThroughput() {
  const el = document.querySelector("[data-bx-chart-throughput]");
  if (!el) return;
  const data = JSON.parse(el.getAttribute("data-bx-chart-data"));
  const t = themeSettings();
  const chart = new ApexCharts(el, {
    chart: { ...t.chart, type: "line", height: 320, toolbar: { show: false } },
    series: data.series,
    colors: [palette()[0], palette()[3]],
    stroke: { curve: "smooth", width: [3, 2] },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 4 } },
    xaxis: { ...t.xaxis, categories: data.categories },
    yaxis: [
      { ...t.yaxis, title: { text: "Req/s", style: { color: t.chart.foreColor, fontSize: "11px" } } },
      { ...t.yaxis, opposite: true, title: { text: "p95 ms", style: { color: t.chart.foreColor, fontSize: "11px" } } }
    ],
    grid: t.grid,
    legend: { ...t.legend, position: "top", horizontalAlign: "right" },
    tooltip: t.tooltip
  });
  chart.render();
  registry.push({ chart, type: "cartesian" });
}

function initByModel() {
  const el = document.querySelector("[data-bx-chart-models]");
  if (!el) return;
  const data = JSON.parse(el.getAttribute("data-bx-chart-data"));
  const t = themeSettings();
  const chart = new ApexCharts(el, {
    chart: { ...t.chart, type: "bar", height: 280, stacked: true, toolbar: { show: false } },
    series: data.series,
    colors: [palette()[0], palette()[3]],
    plotOptions: { bar: { horizontal: true, barHeight: "62%", borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { ...t.xaxis, categories: data.categories, labels: { ...t.xaxis.labels, formatter: (v) => `${v}k` } },
    yaxis: t.yaxis,
    grid: t.grid,
    legend: { ...t.legend, position: "top", horizontalAlign: "right" },
    tooltip: t.tooltip
  });
  chart.render();
  registry.push({ chart, type: "cartesian" });
}

function refreshTheme(stats) {
  refreshSparkColors(stats.charts);
  const t = themeSettings();
  for (const entry of registry) {
    entry.chart.updateOptions({
      theme: t.theme, tooltip: t.tooltip, chart: { foreColor: t.chart.foreColor },
      grid: t.grid, xaxis: t.xaxis, yaxis: t.yaxis, legend: t.legend
    }, false, false);
  }
}

export function init() {
  const stats = initStatCards();
  initThroughput();
  initByModel();
  document.addEventListener("bx:layoutchange", (e) => {
    if (e.detail?.key === "bs-theme") requestAnimationFrame(() => refreshTheme(stats));
  });
}
