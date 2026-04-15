// ---------------------------------------------------------------------------
// pages/ai-filters.js — filter pills for the prompts library + insights feed.
// One module, two configurations.
// ---------------------------------------------------------------------------

function bindFilters({ filterAttr, gridSelector, itemAttr }) {
  const buttons = Array.from(document.querySelectorAll(`[${filterAttr}]`));
  const items = Array.from(document.querySelectorAll(`${gridSelector} > [${itemAttr}]`));
  if (!buttons.length || !items.length) return;

  function apply(value) {
    for (const it of items) {
      const cat = it.getAttribute(itemAttr);
      it.style.display = (value === "all" || cat === value) ? "" : "none";
    }
    for (const b of buttons) {
      b.classList.toggle("is-active", b.getAttribute(filterAttr) === value);
    }
  }

  for (const b of buttons) {
    b.addEventListener("click", () => apply(b.getAttribute(filterAttr)));
  }
}

function bindStarToggles() {
  document.addEventListener("click", (e) => {
    const star = e.target.closest("[data-bx-prompt-star]");
    if (!star) return;
    star.classList.toggle("is-on");
  });
}

export function init() {
  bindFilters({
    filterAttr: "data-bx-prompt-filter",
    gridSelector: "[data-bx-prompt-grid]",
    itemAttr: "data-bx-prompt-cat"
  });
  bindFilters({
    filterAttr: "data-bx-insight-filter",
    gridSelector: "[data-bx-insight-grid]",
    itemAttr: "data-bx-insight-variant"
  });
  bindStarToggles();
}
