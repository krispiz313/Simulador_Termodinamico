
import { R_ATM, LITER_ATM_TO_J, computeP, computeT, solveVFromP } from "./engine";

export function runSimulation(state) {
  const { gasType, processType, pathType, inputMode } = state;
  const n = parseFloat(state.n);
  const T_i = parseFloat(state.T_i);
  const V_i = parseFloat(state.V_i);
  const P_i = parseFloat(state.P_i);
  const Cv = parseFloat(state.Cv);
  const Cp = parseFloat(state.Cp);
  const P_ext = parseFloat(state.P_ext || 0);
  const a = parseFloat(state.a || 0);
  const b = parseFloat(state.b || 0);
  const gp = { n, a, b };
  const gamma = Cp / Cv;


  let V_f, T_f_isocoricoInput;
  if (processType === "isocorico") {
    V_f = V_i; // fijo por definición
    if (inputMode === "presiones") {
      const P_f_input = parseFloat(state.P_f);
      T_f_isocoricoInput = computeT(gasType, { ...gp, P: P_f_input, V: V_i });
    } else {
      T_f_isocoricoInput = parseFloat(state.T_f);
    }
  } else if (processType === "isobarico") {
    if (inputMode === "temperaturas") {
      const T_f_input = parseFloat(state.T_f);
      V_f = solveVFromP(gasType, n, T_f_input, P_i, a, b);
    } else {
      V_f = parseFloat(state.V_f);
    }
  } else if (inputMode === "presiones") {
    const P_f_input = parseFloat(state.P_f);
    if (processType === "isotermico") {
      V_f = solveVFromP(gasType, n, T_i, P_f_input, a, b);
    } else if (processType === "adiabatico") {
      // P_f·V_f^γ = P_i·V_i^γ  =>  V_f = V_i·(P_i/P_f)^(1/γ)
      V_f = V_i * Math.pow(P_i / P_f_input, 1 / gamma);
    } else {
      V_f = parseFloat(state.V_f);
    }
  } else {
    V_f = parseFloat(state.V_f);
  }

  const steps = [];
  const pushStep = (label, formula, value, unit) => {
    steps.push({ id: steps.length, label, formula, value, unit });
  };

  let P_f, T_f, W_J, q_J, dU_J, dH_J;

  pushStep(
    "Datos de entrada",
    `n=${n}\\text{ mol},\\ T_i=${T_i}\\text{ K},\\ P_i=${P_i}\\text{ atm},\\ V_i=${V_i}\\text{ L}`,
    null,
    ""
  );
  if (inputMode === "presiones" && (processType === "isotermico" || processType === "adiabatico")) {
    pushStep(
      "Volumen final (derivado de P_f)",
      processType === "isotermico" ? "V_f = \\dfrac{nRT_i}{P_f}" : "V_f = V_i\\left(\\dfrac{P_i}{P_f}\\right)^{1/\\gamma}",
      V_f,
      "L"
    );
  }
  pushStep("Relación de capacidades caloríficas", "\\gamma = \\dfrac{C_p}{C_v}", gamma, "");

  if (processType === "isotermico") {
    T_f = T_i;
    P_f = computeP(gasType, { ...gp, T: T_i, V: V_f });
    pushStep("Temperatura final (isotérmico)", "T_f = T_i", T_f, "K");
    pushStep(
      "Presión final",
      gasType === "real" ? "P_f = \\dfrac{nRT_i}{V_f - nb} - \\dfrac{an^2}{V_f^2}" : "P_f = \\dfrac{nRT_i}{V_f}",
      P_f,
      "atm"
    );
    if (pathType === "reversible") {
      const W_atm = -n * R_ATM * T_i * Math.log(V_f / V_i);
      W_J = W_atm * LITER_ATM_TO_J;
      pushStep("Trabajo reversible", "W = -nRT\\ln\\!\\left(\\dfrac{V_f}{V_i}\\right)", W_atm, "L·atm");
    } else {
      const W_atm = -P_ext * (V_f - V_i);
      W_J = W_atm * LITER_ATM_TO_J;
      pushStep("Trabajo irreversible", "W = -P_{ext}(V_f - V_i)", W_atm, "L·atm");
    }
    dU_J = 0;
    dH_J = 0;
    q_J = -W_J;
    pushStep("Energía interna", "\\Delta U = 0\\quad\\text{(isotérmico, gas ideal)}", 0, "J");
    pushStep("Entalpía", "\\Delta H = 0\\quad\\text{(isotérmico, gas ideal)}", 0, "J");
    pushStep("Calor transferido", "q = -W", q_J, "J");
  } else if (processType === "isobarico") {
    P_f = P_i;
    if (inputMode === "temperaturas") {
      pushStep(
        "Volumen final (derivado de T_f)",
        gasType === "real" ? "V_f \\text{ resuelto de } (P_i + an^2/V_f^2)(V_f-nb)=nRT_f" : "V_f = \\dfrac{nRT_f}{P_i}",
        V_f,
        "L"
      );
    }
    T_f = computeT(gasType, { ...gp, P: P_i, V: V_f });
    pushStep("Presión final (isobárico)", "P_f = P_i", P_f, "atm");
    pushStep(
      "Temperatura final",
      gasType === "real" ? "T_f = \\dfrac{(V_f - nb)\\left(P_f + \\frac{an^2}{V_f^2}\\right)}{nR}" : "T_f = \\dfrac{P_f V_f}{nR}",
      T_f,
      "K"
    );
    const Peff = pathType === "reversible" ? P_i : P_ext;
    const W_atm = -Peff * (V_f - V_i);
    W_J = W_atm * LITER_ATM_TO_J;
    pushStep(
      pathType === "reversible" ? "Trabajo (reversible, P_{ext} = P_i)" : "Trabajo irreversible",
      "W = -P_{ext}(V_f - V_i)",
      W_atm,
      "L·atm"
    );
    q_J = n * Cp * (T_f - T_i);
    dU_J = n * Cv * (T_f - T_i);
    dH_J = q_J;
    pushStep("Calor transferido", "q = nC_p(T_f - T_i)", q_J, "J");
    pushStep("Energía interna", "\\Delta U = nC_v(T_f - T_i)", dU_J, "J");
    pushStep("Entalpía", "\\Delta H = q", dH_J, "J");
  } else if (processType === "isocorico") {
    T_f = T_f_isocoricoInput;
    P_f = computeP(gasType, { ...gp, T: T_f, V: V_i });
    W_J = 0;
    pushStep("Trabajo (isocórico)", "W = 0", 0, "L·atm");
    if (inputMode === "presiones") {
      pushStep(
        "Temperatura final (derivada de P_f)",
        gasType === "real" ? "T_f = \\dfrac{(V_i - nb)\\left(P_f + \\frac{an^2}{V_i^2}\\right)}{nR}" : "T_f = \\dfrac{P_f V_i}{nR}",
        T_f,
        "K"
      );
    }
    pushStep(
      "Presión final",
      gasType === "real" ? "P_f = \\dfrac{nRT_f}{V_i - nb} - \\dfrac{an^2}{V_i^2}" : "P_f = \\dfrac{nRT_f}{V_i}",
      P_f,
      "atm"
    );
    q_J = n * Cv * (T_f - T_i);
    dU_J = q_J;
    dH_J = n * Cp * (T_f - T_i);
    pushStep("Calor transferido", "q = nC_v(T_f - T_i)", q_J, "J");
    pushStep("Energía interna", "\\Delta U = q", dU_J, "J");
    pushStep("Entalpía", "\\Delta H = nC_p(T_f - T_i)", dH_J, "J");
  } else if (processType === "adiabatico") {
    if (pathType === "reversible") {
      T_f = T_i * Math.pow(V_i / V_f, gamma - 1);
      P_f = P_i * Math.pow(V_i / V_f, gamma);
      pushStep("Temperatura final (adiabático rev.)", "T_f = T_i\\left(\\dfrac{V_i}{V_f}\\right)^{\\gamma - 1}", T_f, "K");
      pushStep("Presión final", "P_f = P_i\\left(\\dfrac{V_i}{V_f}\\right)^{\\gamma}", P_f, "atm");
      // Para gas ideal, ΔU = nCv(T_f - T_i) siempre. Con q=0 (adiabático), W = ΔU.
      dU_J = n * Cv * (T_f - T_i);
      W_J = dU_J;
      pushStep(
        "Trabajo y energía interna",
        "\\Delta U = nC_v(T_f - T_i)\\, ,\\quad W = \\Delta U\\ \\ (q = 0)",
        W_J / LITER_ATM_TO_J,
        "L·atm"
      );
    } else {
      T_f = T_i + (-P_ext * (V_f - V_i) * LITER_ATM_TO_J) / (n * Cv);
      P_f = computeP(gasType, { ...gp, T: T_f, V: V_f });
      pushStep(
        "Temperatura final (adiabático irrev.)",
        "nC_v(T_f - T_i) = -P_{ext}(V_f - V_i)\\ \\Rightarrow\\ T_f",
        T_f,
        "K"
      );
      pushStep(
        "Presión final",
        gasType === "real" ? "P_f = \\dfrac{nRT_f}{V_f - nb} - \\dfrac{an^2}{V_f^2}" : "P_f = \\dfrac{nRT_f}{V_f}",
        P_f,
        "atm"
      );
      const W_atm = -P_ext * (V_f - V_i);
      W_J = W_atm * LITER_ATM_TO_J;
      dU_J = W_J;
      pushStep("Trabajo", "W = -P_{ext}(V_f - V_i)", W_atm, "L·atm");
    }
    q_J = 0;
    dH_J = dU_J + (P_f * V_f - P_i * V_i) * LITER_ATM_TO_J;
    pushStep("Calor transferido (adiabático)", "q = 0", 0, "J");
    pushStep("Energía interna", "\\Delta U = W", dU_J, "J");
    pushStep("Entalpía", "\\Delta H = \\Delta U + \\Delta(PV)", dH_J, "J");
  }

 
  const N = 48;

  const curveRev = [];
  for (let j = 0; j <= N; j++) {
    const Vj = V_i + (V_f - V_i) * (j / N);
    let Pj;
    if (processType === "isotermico") Pj = computeP(gasType, { ...gp, T: T_i, V: Vj });
    else if (processType === "adiabatico") Pj = P_i * Math.pow(V_i / Vj, gamma);
    else if (processType === "isobarico") Pj = P_i;
    else if (processType === "isocorico") Pj = P_i + (P_f - P_i) * (j / N); // Vj=V_i fijo, P varía
    else Pj = P_i + (P_f - P_i) * (j / N);
    curveRev.push({ v: Vj, p: Pj });
  }

  const PextForCurve = processType === "isocorico" ? P_f : P_ext > 0 ? P_ext : P_f;
  const curveIrrev = [
    { v: V_i, p: P_i },
    { v: V_i, p: PextForCurve },
    { v: V_f, p: PextForCurve },
  ];

  const curve = pathType === "reversible" ? curveRev : curveIrrev;

  let W_rev_J, W_irrev_J;
  if (processType === "isotermico") {
    W_rev_J = -n * R_ATM * T_i * Math.log(V_f / V_i) * LITER_ATM_TO_J;
    W_irrev_J = -PextForCurve * (V_f - V_i) * LITER_ATM_TO_J;
  } else if (processType === "isobarico") {
    W_rev_J = -P_i * (V_f - V_i) * LITER_ATM_TO_J;
    W_irrev_J = -PextForCurve * (V_f - V_i) * LITER_ATM_TO_J;
  } else if (processType === "isocorico") {
    W_rev_J = 0;
    W_irrev_J = 0;
  } else if (processType === "adiabatico") {
    const T_f_rev = T_i * Math.pow(V_i / V_f, gamma - 1);
    W_rev_J = n * Cv * (T_f_rev - T_i);
    const T_f_irrev = T_i + (-PextForCurve * (V_f - V_i) * LITER_ATM_TO_J) / (n * Cv);
    W_irrev_J = n * Cv * (T_f_irrev - T_i);
  }

  return {
    P_f, T_f, W_J, q_J, dU_J, dH_J, gamma, curve, curveRev, curveIrrev, W_rev_J, W_irrev_J, steps,
    isothermHigh: processType === "adiabatico" ? n * R_ATM * Math.max(T_i, T_f) : null,
    isothermLow: processType === "adiabatico" ? n * R_ATM * Math.min(T_i, T_f) : null,
    inputs: { gasType, processType, pathType, n, T_i, P_i, V_i, V_f, Cv, Cp, P_ext, a, b },
    timestamp: Date.now(),
  };
}
