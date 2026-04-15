// ---------------------------------------------------------------------------
// pages/analytics.js — secondary dashboard: web analytics.
// ---------------------------------------------------------------------------

import ApexCharts from "apexcharts";

import { palette, themeSettings } from "../components/apex-defaults.js";
import { initStatCards, refreshSparkColors } from "../components/stat-card.js";
import { formatValue } from "../util/format.js";

const registry = [];

function initTraffic() {
  const el = document.querySelector("[data-bx-chart-traffic]");
  if (!el) return;
  const data = JSON.parse(el.getAttribute("data-bx-chart-data"));
  const t = themeSettings();
  const chart = new ApexCharts(el, {
    chart: { ...t.chart, type: "bar", height: 320, stacked: true, toolbar: { show: false } },
    series: data.series,
    colors: [palette()[0], palette()[2], palette()[3]],
    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 3 } },
    dataLabels: { enabled: false },
    xaxis: { ...t.xaxis, categories: data.categories },
    yaxis: { ...t.yaxis },
    grid: t.grid,
    legend: { ...t.legend, position: "top", horizontalAlign: "right" },
    tooltip: t.tooltip
  });
  chart.render();
  registry.push({ chart, type: "cartesian" });
}

function initDeviceMix() {
  const el = document.querySelector("[data-bx-chart-device]");
  if (!el) return;
  const data = JSON.parse(el.getAttribute("data-bx-chart-data"));
  const t = themeSettings();
  const sliceColors = data.legend.map((l) => {
    switch (l.variant) {
      case "success": return palette()[0];
      case "warning": return "#F6B93B";
      case "muted":   return "#8A9AA0";
      default:        return palette()[2];
    }
  });
  const chart = new ApexCharts(el, {
    chart: { ...t.chart, type: "donut", height: 220 },
    series: data.legend.map((l) => l.value),
    labels: data.legend.map((l) => l.label),
    colors: sliceColors,
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: { donut: { size: "70%", labels: { show: true, name: { color: t.chart.foreColor }, value: { color: t.chart.foreColor, fontSize: "20px", fontWeight: 600 }, total: { show: true, label: "%", color: t.chart.foreColor } } } }
    },
    tooltip: { ...t.tooltip, y: { formatter: (v) => `${v}%` } }
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
        theme: t.theme, tooltip: { ...t.tooltip, y: { formatter: (v) => `${v}%` } }, chart: { foreColor: t.chart.foreColor },
        plotOptions: { pie: { donut: { labels: { show: true, name: { color: t.chart.foreColor }, value: { color: t.chart.foreColor }, total: { show: true, label: "%", color: t.chart.foreColor } } } } }
      }, false, false);
    } else {
      entry.chart.updateOptions({
        theme: t.theme, tooltip: t.tooltip, chart: { foreColor: t.chart.foreColor },
        grid: t.grid, xaxis: t.xaxis, yaxis: t.yaxis, legend: t.legend
      }, false, false);
    }
  }
}

export function init() {
  const stats = initStatCards();
  initTraffic();
  initDeviceMix();
  document.addEventListener("bx:layoutchange", (e) => {
    if (e.detail?.key === "bs-theme") requestAnimationFrame(() => refreshTheme(stats));
  });
}
