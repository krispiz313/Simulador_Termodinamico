
export function fmt(v, decimals = 2) {
  if (v === null || v === undefined || isNaN(v)) return "—";
  if (Math.abs(v) >= 100000 || (Math.abs(v) < 0.001 && v !== 0)) return v.toExponential(2);
  return v.toLocaleString("es-EC", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
