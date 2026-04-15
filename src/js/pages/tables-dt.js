// ---------------------------------------------------------------------------
// pages/tables-dt.js — simple-datatables (vanilla, no jQuery).
// ---------------------------------------------------------------------------

import { DataTable } from "simple-datatables";

export function init() {
  const el = document.getElementById("bx-dt");
  if (!el) return;

  new DataTable(el, {
    perPage: 5,
    perPageSelect: [5, 10, 25, 50],
    searchable: true,
    sortable: true,
    labels: {
      placeholder: "Search agents…",
      // v9: this is appended next to the perPage <select> — plain text, no template.
      perPage: "per page",
      noRows: "No agents match",
      info: "Showing {start} to {end} of {rows} agents"
    },
    classes: {
      table: "table table-hover bx-dt-table"
      // Don't pass `input` / `selector` classes here — the library applies
      // them to EVERY dynamic input/select it renders, including any inside
      // headers, which turns column headers into grey form-select-looking
      // boxes. We style the per-page <select> via plugin SCSS instead.
    }
  });
}
