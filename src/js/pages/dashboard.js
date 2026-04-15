// ---------------------------------------------------------------------------
// pages/dashboard.js — flagship dashboard.
// Stat-card init lives in components/stat-card.js (shared with secondary
// dashboards). This module wires the page-specific charts.
// ---------------------------------------------------------------------------

import ApexCharts from "apexcharts";

import { formatValue } from "../util/format.js";
import { palette, themeSettings } from "../components/apex-defaults.js";
import { initStatCards, refreshSparkColors } from "../components/stat-card.js";

const registry = [];
const liveHandles = [];

function initRevenueChart() {
  const el = document.querySelector("[data-bx-chart-revenue]");
  if (!el) return;
  const data = JSON.parse(el.getAttribute("data-bx-chart-data"));
  const t = themeSettings();
  const chart = new ApexCharts(el, {
    chart: { ...t.chart, type: "area", height: 300, toolbar: { show: false } },
    series: data.series,
    colors: [palette()[0], palette()[2]],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] } },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 5 } },
    xaxis: { ...t.xaxis, categories: data.categories, tickAmount: 7 },
    yaxis: { ...t.yaxis, labels: { ...t.yaxis.labels, formatter: (v) => formatValue(v, "number") } },
    grid: t.grid,
    legend: { ...t.legend, position: "top", horizontalAlign: "right" },
    tooltip: t.tooltip
  });
  chart.render();
  registry.push({ chart, type: "cartesian" });
}

function initDonut() {
  const el = document.querySelector("[data-bx-chart-donut]");
  if (!el) return;
  const data = JSON.parse(el.getAttribute("data-bx-chart-data"));
  const t = themeSettings();
  const sliceColors = data.legend.map((l) => {
    switch (l.variant) {
      case "success": return palette()[0];
      case "warning": return "#F6B93B";
      case "danger":  return "#EF476F";
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
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: { color: t.chart.foreColor, fontSize: "12px" },
            value: { color: t.chart.foreColor, fontSize: "20px", fontWeight: 600 },
            total: { show: true, label: "Agents", color: t.chart.foreColor }
          }
        }
      }
    },
    tooltip: t.tooltip
  });
  chart.render();
  registry.push({ chart, type: "donut" });
}

function initTokenChart() {
  const el = document.querySelector("[data-bx-chart-tokens]");
  if (!el) return;
  const data = JSON.parse(el.getAttribute("data-bx-chart-data"));
  const t = themeSettings();
  const chart = new ApexCharts(el, {
    chart: { ...t.chart, type: "bar", height: 280, stacked: true, toolbar: { show: false } },
    series: data.series,
    colors: [palette()[0], palette()[3]],
    plotOptions: { bar: { horizontal: false, columnWidth: "52%", borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { ...t.xaxis, categories: data.categories },
    yaxis: { ...t.yaxis, labels: { ...t.yaxis.labels, formatter: (v) => `${v}k` } },
    grid: t.grid,
    legend: { ...t.legend, position: "top", horizontalAlign: "right" },
    tooltip: t.tooltip
  });
  chart.render();
  registry.push({ chart, type: "cartesian" });
}

function refreshThemeAll(stats) {
  refreshSparkColors(stats.charts);
  const t = themeSettings();
  for (const entry of registry) {
    if (entry.type === "donut") {
      entry.chart.updateOptions({
        theme: t.theme, tooltip: t.tooltip, chart: { foreColor: t.chart.foreColor },
        plotOptions: { pie: { donut: { labels: { show: true, name: { color: t.chart.foreColor }, value: { color: t.chart.foreColor }, total: { show: true, label: "Agents", color: t.chart.foreColor } } } } }
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
  liveHandles.push(...stats.handles);

  initRevenueChart();
  initDonut();
  initTokenChart();

  document.addEventListener("bx:layoutchange", (e) => {
    if (e.detail?.key === "bs-theme") {
      requestAnimationFrame(() => refreshThemeAll(stats));
    }
  });
}
