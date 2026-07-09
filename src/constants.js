
export const PROCESS_META = {
  isotermico: { label: "Isotérmico", sub: "\\Delta T = 0", icon: "≡" },
  isobarico: { label: "Isobárico", sub: "\\Delta P = 0", icon: "▭" },
  isocorico: { label: "Isocórico", sub: "\\Delta V = 0", icon: "‖" },
  adiabatico: { label: "Adiabático", sub: "q = 0", icon: "◢" },
};


export const DEFAULT_STATE = {
  gasType: "ideal",
  processType: "isotermico",
  pathType: "reversible",
  inputMode: "volumenes",
  n: "1", T_i: "300", T_f: "450", P_i: "2.462", V_i: "10", V_f: "20", P_f: "1.231",
  Cv: "20.785", Cp: "29.099", P_ext: "1", a: "0", b: "0",
  gammaMode: "diatomico", gammaCustom: "1.40",
};
