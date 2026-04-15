// ---------------------------------------------------------------------------
// pages/widgets-gallery.js
// Mounts the /ui/widgets/ gallery:
//   - live stat-card counters (shared with all dashboards)
//   - three demo charts (area / donut / bar) on the page
//   - re-themes charts when the user flips dark ↔ light
// ---------------------------------------------------------------------------

import ApexCharts from "apexcharts";

import { initStatCards, refreshSparkColors } from "../components/stat-card.js";
import { palette, themeSettings } from "../components/apex-defaults.js";

const charts = [];

function buildArea() {
  const el = document.querySelector('[data-bx-widget-chart="area"]');
  if (!el) return;
  const t = themeSettings();
  const c = new ApexCharts(el, {
    chart: { ...t.chart, type: "area", height: 240, toolbar: { show: false } },
    series: [
      { name: "Revenue",       data: [3200,3450,3380,3620,3810,3920,4100,4260,4420,4580,4710,4830,4910,5020,5180] },
      { name: "Inference cost", data: [ 420, 440, 430, 460, 480, 490, 510, 520, 535, 565, 590, 605, 615, 628, 645] }
    ],
    colors: [palette()[0], palette()[2]],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] } },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 4 } },
    xaxis: { ...t.xaxis, categories: ["Mar 17","Mar 19","Mar 21","Mar 23","Mar 25","Mar 27","Mar 29","Mar 31","Apr 2","Apr 4","Apr 6","Apr 8","Apr 10","Apr 12","Apr 14"] },
    yaxis: t.yaxis,
    grid: t.grid,
    legend: { ...t.legend, position: "top", horizontalAlign: "right" },
    tooltip: t.tooltip
  });
  c.render();
  charts.push({ chart: c, type: "cartesian" });
}

function buildDonut() {
  const el = document.querySelector('[data-bx-widget-chart="donut"]');
  if (!el) return;
  const t = themeSettings();
  const c = new ApexCharts(el, {
    chart: { ...t.chart, type: "donut", height: 200 },
    series: [21, 4, 2, 1],
    labels: ["Healthy", "Degraded", "Errored", "Paused"],
    colors: [palette()[0], "#F6B93B", "#EF476F", "#8A9AA0"],
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: { color: t.chart.foreColor, fontSize: "12px" },
            value: { color: t.chart.foreColor, fontSize: "18px", fontWeight: 600 },
            total: { show: true, label: "Agents", color: t.chart.foreColor }
          }
        }
      }
    },
    tooltip: t.tooltip
  });
  c.render();
  charts.push({ chart: c, type: "donut" });
}

function buildBar() {
  const el = document.querySelector('[data-bx-widget-chart="bar"]');
  if (!el) return;
  const t = themeSettings();
  const c = new ApexCharts(el, {
    chart: { ...t.chart, type: "bar", height: 240, stacked: true, toolbar: { show: false } },
    series: [
      { name: "Prompt",     data: [280, 420, 140, 110,  90] },
      { name: "Completion", data: [132, 260,  50,  44,  28] }
    ],
    colors: [palette()[0], palette()[3]],
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { ...t.xaxis, categories: ["summarizer-v3","planner-alpha","retriever-xl","classifier-m","rewriter-lg"] },
    yaxis: { ...t.yaxis, labels: { ...t.yaxis.labels, formatter: (v) => `${v}k` } },
    grid: t.grid,
    legend: { ...t.legend, position: "top", horizontalAlign: "right" },
    tooltip: t.tooltip
  });
  c.render();
  charts.push({ chart: c, type: "cartesian" });
}

function refreshTheme(stats) {
  refreshSparkColors(stats.charts);
  const t = themeSettings();
  for (const entry of charts) {
    if (entry.type === "donut") {
      entry.chart.updateOptions({
        theme: t.theme, tooltip: t.tooltip, chart: { foreColor: t.chart.foreColor },
        plotOptions: { pie: { donut: { labels: { show: true,
          name:  { color: t.chart.foreColor },
          value: { color: t.chart.foreColor },
          total: { show: true, label: "Agents", color: t.chart.foreColor } } } } }
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
  buildArea();
  buildDonut();
  buildBar();
  document.addEventListener("bx:layoutchange", (e) => {
    if (e.detail?.key === "bs-theme") requestAnimationFrame(() => refreshTheme(stats));
  });
}
