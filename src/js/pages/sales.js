// ---------------------------------------------------------------------------
// pages/sales.js — secondary dashboard: sales pipeline.
// ---------------------------------------------------------------------------

import ApexCharts from "apexcharts";

import { palette, themeSettings } from "../components/apex-defaults.js";
import { initStatCards, refreshSparkColors } from "../components/stat-card.js";
import { formatValue } from "../util/format.js";

const registry = [];

function initTrend() {
  const el = document.querySelector("[data-bx-chart-sales-trend]");
  if (!el) return;
  const data = JSON.parse(el.getAttribute("data-bx-chart-data"));
  const t = themeSettings();
  const chart = new ApexCharts(el, {
    chart: { ...t.chart, type: "line", height: 320, toolbar: { show: false } },
    series: data.series,
    colors: [palette()[0], palette()[3]],
    stroke: { curve: "smooth", width: [3, 2], dashArray: [0, 5] },
    markers: { size: 4 },
    dataLabels: { enabled: false },
    xaxis: { ...t.xaxis, categories: data.categories },
    yaxis: { ...t.yaxis, labels: { ...t.yaxis.labels, formatter: (v) => formatValue(v, "currency") } },
    grid: t.grid,
    legend: { ...t.legend, position: "top", horizontalAlign: "right" },
    tooltip: { ...t.tooltip, y: { formatter: (v) => formatValue(v, "currency") } }
  });
  chart.render();
  registry.push({ chart, type: "cartesian", curr: true });
}

function initStages() {
  const el = document.querySelector("[data-bx-chart-stages]");
  if (!el) return;
  const data = JSON.parse(el.getAttribute("data-bx-chart-data"));
  const t = themeSettings();
  const sliceColors = data.legend.map((l) => {
    switch (l.variant) {
      case "success": return palette()[0];
      case "warning": return "#F6B93B";
      case "danger":  return "#EF476F";
      case "muted":   return "#6173A0";
      default:        return palette()[2];
    }
  });
  const chart = new ApexCharts(el, {
    chart: { ...t.chart, type: "donut", height: 240 },
    series: data.legend.map((l) => l.value),
    labels: data.legend.map((l) => l.label),
    colors: sliceColors,
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: { donut: { size: "70%", labels: { show: true, name: { color: t.chart.foreColor }, value: { color: t.chart.foreColor, fontSize: "16px", fontWeight: 600, formatter: (v) => formatValue(v, "currency") }, total: { show: true, label: "Pipeline", color: t.chart.foreColor, formatter: () => formatValue(data.legend.reduce((s, l) => s + l.value, 0), "currency") } } } }
    },
    tooltip: { ...t.tooltip, y: { formatter: (v) => formatValue(v, "currency") } }
  });
  chart.render();
  registry.push({ chart, type: "donut" });
}

function refreshTheme(stats) {
  refreshSparkColors(stats.charts);
  const t = themeSettings();
  for (const entry of registry) {
    if (entry.type === "donut") {
      entry.chart.updateOptions({
        theme: t.theme, tooltip: entry.chart.opts.tooltip, chart: { foreColor: t.chart.foreColor }
      }, false, false);
    } else {
      entry.chart.updateOptions({
        theme: t.theme, tooltip: entry.chart.opts.tooltip, chart: { foreColor: t.chart.foreColor },
        grid: t.grid, xaxis: t.xaxis, yaxis: t.yaxis, legend: t.legend
      }, false, false);
    }
  }
}

export function init() {
  const stats = initStatCards();
  initTrend();
  initStages();
  document.addEventListener("bx:layoutchange", (e) => {
    if (e.detail?.key === "bs-theme") requestAnimationFrame(() => refreshTheme(stats));
  });
}
