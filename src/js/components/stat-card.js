// ---------------------------------------------------------------------------
// components/stat-card.js
// Shared stat-card behaviour used by every dashboard:
//   - Render sparkline (if data-bx-sparkline)
//   - Live-drift the value (if data-bx-stat-drift-min/max/step)
//   - Pulse animation on each tick
// Returns { handles, charts } so the caller can clean up if needed.
// ---------------------------------------------------------------------------

import ApexCharts from "apexcharts";

import { formatValue } from "../util/format.js";
import { makeDrifter, mulberry32 } from "../util/rng.js";
import { palette } from "./apex-defaults.js";

const TICK_BASE_MS = 2800;

export function initStatCards(opts = {}) {
  const root = opts.root || document;
  const tickMs = opts.tickMs || TICK_BASE_MS;

  const handles = [];
  const charts = [];

  const cards = root.querySelectorAll("[data-bx-stat-id]");
  cards.forEach((el, idx) => {
    const seed = idx + 1;
    const valueEl = el.querySelector("[data-bx-stat-value]");
    const pulseEl = el.querySelector("[data-bx-stat-pulse]");
    const sparkEl = el.querySelector("[data-bx-sparkline]");
    const format = el.getAttribute("data-bx-stat-format") || "number";
    const driftMin = parseFloat(el.getAttribute("data-bx-stat-drift-min"));
    const driftMax = parseFloat(el.getAttribute("data-bx-stat-drift-max"));
    const driftStep = parseFloat(el.getAttribute("data-bx-stat-drift-step"));
    const seriesJSON = sparkEl?.getAttribute("data-bx-sparkline-series");
    const series = seriesJSON ? JSON.parse(seriesJSON) : [];

    const startValue = parseFloat(valueEl.textContent.replace(/[^\d.-]/g, "")) || 0;
    valueEl.textContent = formatValue(startValue, format);

    let sparkChart = null;
    if (sparkEl && series.length) {
      sparkChart = new ApexCharts(sparkEl, {
        chart: { type: "area", height: 36, sparkline: { enabled: true }, animations: { enabled: false } },
        stroke: { curve: "smooth", width: 2 },
        fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.0, stops: [0, 100] } },
        colors: [palette()[0]],
        series: [{ data: series.slice() }],
        tooltip: { enabled: false }
      });
      sparkChart.render();
      charts.push({ chart: sparkChart, type: "spark", seriesData: series.slice() });
    }

    if (!isNaN(driftMin) && !isNaN(driftMax) && !isNaN(driftStep)) {
      const rng = mulberry32(seed * 9973 + 1);
      const drifter = makeDrifter({ value: startValue, min: driftMin, max: driftMax, stepMax: driftStep, rng });

      const handle = setInterval(() => {
        const next = drifter();
        valueEl.textContent = formatValue(next, format);
        valueEl.classList.remove("is-pulsing");
        void valueEl.offsetWidth;
        valueEl.classList.add("is-pulsing");
        if (pulseEl) {
          pulseEl.classList.remove("is-pulsing");
          void pulseEl.offsetWidth;
          pulseEl.classList.add("is-pulsing");
        }
        if (sparkChart) {
          const entry = charts.find((c) => c.chart === sparkChart);
          if (entry) {
            entry.seriesData.push(next);
            if (entry.seriesData.length > 30) entry.seriesData.shift();
            sparkChart.updateSeries([{ data: entry.seriesData.slice() }], false);
          }
        }
      }, tickMs + (seed % 800));

      handles.push(handle);
    }
  });

  return { handles, charts };
}

export function refreshSparkColors(charts) {
  for (const entry of charts) {
    if (entry.type === "spark") {
      try { entry.chart.updateOptions({ colors: [palette()[0]] }, false, false); } catch (_) {}
    }
  }
}
