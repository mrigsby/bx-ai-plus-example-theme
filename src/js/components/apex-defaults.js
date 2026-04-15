// ---------------------------------------------------------------------------
// components/apex-defaults.js — theme-aware defaults for ApexCharts.
// Reads CSS custom properties so charts re-theme automatically.
// ---------------------------------------------------------------------------

export function readCSSVar(name, fallback = "") {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function palette() {
  return [
    readCSSVar("--bx-chart-1", "#0DD3A8"),
    readCSSVar("--bx-chart-2", "#227762"),
    readCSSVar("--bx-chart-3", "#6173A0"),
    readCSSVar("--bx-chart-4", "#4B4265"),
    readCSSVar("--bx-chart-5", "#8FE7D1"),
    readCSSVar("--bx-chart-6", "#D7DDE0")
  ];
}

export function themeSettings() {
  const bg = readCSSVar("--bx-surface-1", "#0E2D2B");
  const text = readCSSVar("--bx-text", "#E6ECEF");
  const muted = readCSSVar("--bx-text-muted", "#8A9AA0");
  const border = readCSSVar("--bx-border", "rgba(215,221,224,.08)");

  return {
    chart: {
      background: "transparent",
      foreColor: text,
      fontFamily: "inherit",
      toolbar: { show: false },
      animations: { enabled: true, easing: "easeOutSine", speed: 400 }
    },
    grid: {
      borderColor: border,
      strokeDashArray: 3,
      padding: { left: 8, right: 8 }
    },
    tooltip: {
      theme: document.documentElement.getAttribute("data-bs-theme") === "light" ? "light" : "dark",
      style: { fontSize: "12px" }
    },
    legend: {
      labels: { colors: muted },
      fontSize: "12px",
      markers: { radius: 4 }
    },
    xaxis: {
      labels: { style: { colors: muted, fontSize: "11px" } },
      axisBorder: { color: border },
      axisTicks:  { color: border }
    },
    yaxis: {
      labels: { style: { colors: muted, fontSize: "11px" } }
    },
    theme: { mode: document.documentElement.getAttribute("data-bs-theme") === "light" ? "light" : "dark" },
    _bg: bg
  };
}
