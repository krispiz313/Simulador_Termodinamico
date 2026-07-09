
export const R_ATM = 0.08206; // L·atm/(mol·K)
export const R_J = 8.314;     // J/(mol·K)
export const LITER_ATM_TO_J = 101.325;

export const GAS_PRESETS = {
  monoatomico: { label: "Monoatómico", gamma: 1.6667 },
  diatomico: { label: "Diatómico", gamma: 1.4 },
  personalizado: { label: "Personalizado", gamma: null },
};


export function gammaToCvCp(gamma) {
  const Cv = R_J / (gamma - 1);
  const Cp = gamma * Cv;
  return { Cv, Cp };
}

export function pressureIdeal(n, T, V) {
  return (n * R_ATM * T) / V;
}

export function temperatureIdeal(n, P, V) {
  return (P * V) / (n * R_ATM);
}

export function pressureVdW(n, T, V, a, b) {
  const Veff = V - n * b;
  return (n * R_ATM * T) / Veff - (a * n * n) / (V * V);
}

export function temperatureVdW(n, P, V, a, b) {
  const Veff = V - n * b;
  return (Veff * (P + (a * n * n) / (V * V))) / (n * R_ATM);
}

export function computeP(gasType, { n, T, V, a, b }) {
  return gasType === "real" ? pressureVdW(n, T, V, a, b) : pressureIdeal(n, T, V);
}

export function computeT(gasType, { n, P, V, a, b }) {
  return gasType === "real" ? temperatureVdW(n, P, V, a, b) : temperatureIdeal(n, P, V);
}

export function solveVFromP(gasType, n, T, P, a, b) {
  if (gasType !== "real") return (n * R_ATM * T) / P;
  let V = (n * R_ATM * T) / P;
  for (let i = 0; i < 60; i++) {
    const f = (P + (a * n * n) / (V * V)) * (V - n * b) - n * R_ATM * T;
    const h = 1e-6;
    const f2 = (P + (a * n * n) / ((V + h) * (V + h))) * (V + h - n * b) - n * R_ATM * T;
    const df = (f2 - f) / h;
    if (!isFinite(df) || df === 0) break;
    V = V - f / df;
  }
  return V;
}
