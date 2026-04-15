// ---------------------------------------------------------------------------
// prism-entry.js — custom Prism bundle for BX-AI+.
//
// Ships only the languages we actually render and skins them via CSS tokens
// (see scss/plugins/_prism.scss). Code-split target — loaded on demand from
// src/js/pages/code.js when a `<pre><code class="language-…">` is on the page.
// ---------------------------------------------------------------------------

import Prism from "prismjs";

// Languages (order matters — dependents must come after their deps).
import "prismjs/components/prism-markup.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-sql.js";
import "prismjs/components/prism-markdown.js";
import "prismjs/components/prism-yaml.js";
import "prismjs/components/prism-java.js";
import "./prism-boxlang.js"; // also imports prism-cfscript

// Plugins — stop Prism from auto-running on DOMContentLoaded; code.js drives it.
window.Prism = window.Prism || Prism;
Prism.manual = true;

import "prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.js";
import "prismjs/plugins/toolbar/prism-toolbar.js";
import "prismjs/plugins/show-language/prism-show-language.js";
import "prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";

// Tune normalize-whitespace defaults — dashboards tend to over-indent code
// that's nested inside Nunjucks template indentation.
Prism.plugins.NormalizeWhitespace.setDefaults({
  "remove-trailing": true,
  "remove-indent": true,
  "left-trim": true,
  "right-trim": true
});

export default Prism;
