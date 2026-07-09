
export const LIMITS = {
  n: { min: 1e-6, max: 1000, label: "n" },
  T: { min: 1, max: 5000, label: "T" },
  P: { min: 1e-3, max: 1000, label: "P" },
  V: { min: 1e-3, max: 1000, label: "V" },
  Cv: { min: 1e-3, max: 200, label: "Cv" },
  Cp: { min: 1e-3, max: 200, label: "Cp" },
  Pext: { min: 1e-3, max: 1000, label: "P_ext" },
  a: { min: 0, max: 50, label: "a" },
  b: { min: 0, max: 5, label: "b" },
};

export function validateField(key, rawValue) {
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return { valid: false, error: "Campo obligatorio" };
  }
  if (!/^-?\d*\.?\d*$/.test(rawValue)) {
    return { valid: false, error: "Solo números" };
  }
  const num = parseFloat(rawValue);
  if (isNaN(num)) return { valid: false, error: "Número inválido" };
  if (num < 0) return { valid: false, error: "No se aceptan negativos" };
  const lim = LIMITS[key];
  if (lim) {
    if (num !== 0 && num < lim.min) return { valid: false, error: `Mínimo ${lim.min}` };
    if (num > lim.max) return { valid: false, error: `Máximo realista: ${lim.max}` };
  }
  return { valid: true, value: num };
}
