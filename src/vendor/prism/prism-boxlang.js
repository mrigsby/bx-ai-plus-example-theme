// ---------------------------------------------------------------------------
// prism-boxlang.js — minimal BoxLang grammar.
//
// Extends Prism's CFScript grammar (BoxLang is near-CFML/CFScript) with
// BoxLang-specific keywords and decorators. Aliased as both `boxlang` and
// `bx`. Must be registered AFTER prism-cfscript is loaded.
// ---------------------------------------------------------------------------

import Prism from "prismjs";
import "prismjs/components/prism-cfscript.js";

Prism.languages.boxlang = Prism.languages.extend("cfscript", {
  keyword: /\b(?:component|interface|function|return|if|else|elseif|for|foreach|while|do|switch|case|default|break|continue|var|new|import|include|property|remote|public|private|package|protected|abstract|final|static|any|numeric|string|boolean|struct|array|date|query|void|throw|try|catch|finally|rethrow|lambda|true|false|null|this|super|instanceof|isInstanceOf)\b/,
  "class-name": /@[A-Z_$][\w$]*/,
  builtin: /\b(?:writeOutput|writeDump|createObject|arrayLen|arrayAppend|arrayFind|arrayContains|structKeyExists|structNew|structGet|listFirst|listLast|listLen|listToArray|isNull|isDefined|isStruct|isArray|isNumeric|isSimpleValue|len|trim|lcase|ucase|left|right|mid|replace|reReplace|reFind|now|dateFormat|timeFormat|dateAdd|dateDiff|getMetadata|invoke|dump|println|print)\b/
});

Prism.languages.bx = Prism.languages.boxlang;
