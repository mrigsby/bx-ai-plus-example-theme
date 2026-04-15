// ---------------------------------------------------------------------------
// pages/tables-gridjs.js — GridJS modern table.
// ---------------------------------------------------------------------------

import { Grid, html } from "gridjs";

export function init() {
  const el = document.querySelector("[data-bx-gridjs]");
  if (!el) return;

  const data = JSON.parse(el.getAttribute("data-bx-gridjs-data"));

  new Grid({
    columns: [
      { name: "Page", formatter: (v) => html(`<code>${v}</code>`) },
      { name: "Pageviews", formatter: (v) => v.toLocaleString() },
      { name: "Avg time (s)" },
      { name: "Exit rate (%)", formatter: (v) => `${v}%` }
    ],
    data: data.map((p) => [p.path, p.views, p.avg, p.exit]),
    sort: true,
    search: true,
    pagination: { enabled: true, limit: 5, summary: true },
    className: { container: "bx-gridjs-container" }
  }).render(el);
}
