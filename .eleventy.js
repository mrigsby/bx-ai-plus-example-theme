// ---------------------------------------------------------------------------
// Eleventy config — BX-AI+ theme
//
// Input:  src/html
// Output: dist
//
// Responsibilities:
//   - Resolve Nunjucks partials (layouts + partials) from src/html/_includes
//   - Expose global data from src/html/_data (menu.json, site.json, etc.)
//   - Pass through ad-hoc static files (favicons, robots.txt) via src/static
//
// Intentionally minimal — CSS/JS are compiled by separate tools
// (tools/build-css.mjs, tools/build-js.mjs), not by Eleventy.
// ---------------------------------------------------------------------------

export default function (eleventyConfig) {
  // Copy /src/static/* straight through to /dist
  eleventyConfig.addPassthroughCopy({ "src/static": "." });

  // Shortcodes for seam markers — keeps seam markers consistent across partials.
  // The ColdBox port greps for these comments in the built HTML and replaces
  // each region with a ColdBox view() call.
  // Usage in .njk:   {% seamBegin "TOPBAR" %} … {% seamEnd "TOPBAR" %}
  eleventyConfig.addShortcode("seamBegin", (name) => `<!-- BEGIN :: ${name} -->`);
  eleventyConfig.addShortcode("seamEnd", (name) => `<!-- END :: ${name} -->`);

  // Year filter used by footer partial
  eleventyConfig.addShortcode("year", () => new Date().getFullYear().toString());

  // Pythonic-style printf format — usage: {{ "%.2f" | format(num) }}
  eleventyConfig.addFilter("format", (formatSpec, num) => {
    const m = /%\.(\d+)f/.exec(formatSpec);
    if (m) return Number(num).toFixed(Number(m[1]));
    return String(num);
  });

  return {
    dir: {
      input: "src/html",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
      output: "dist"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
