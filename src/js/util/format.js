// ---------------------------------------------------------------------------
// util/format.js — number / currency / percent formatters.
// ---------------------------------------------------------------------------

const numberFmt = new Intl.NumberFormat("en-US");
const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});
const decimalFmt = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1
});

export function formatValue(value, format) {
  if (value == null || isNaN(value)) return "—";
  switch (format) {
    case "currency": return currencyFmt.format(Math.round(value));
    case "decimal":  return decimalFmt.format(value);
    case "number":
    default:         return numberFmt.format(Math.round(value));
  }
}
