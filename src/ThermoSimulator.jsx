
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import SimuladorView from "./views/SimuladorView";
import GraficosView from "./views/GraficosView";
import HistorialView from "./views/HistorialView";
import CalcMemoryPanel from "./components/CalcMemoryPanel";
import ConfirmReplaceModal from "./components/ConfirmReplaceModal";
import { runSimulation } from "./lib/simulate";
import { validateField } from "./lib/validation";
import { PROCESS_META, DEFAULT_STATE } from "./constants";
import { S } from "./styles";

export default function ThermoSimulator() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [view, setView] = useState("simulador");
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [pendingEntry, setPendingEntry] = useState(null);
  const [savedToast, setSavedToast] = useState(false);
  const [prevCurve, setPrevCurve] = useState(null);
  const [resetPending, setResetPending] = useState(false);
  const lastResultRef = useRef(null);

  const errors = useMemo(() => {
    const errs = {};


    const nR = validateField("n", state.n);
    if (!nR.valid) errs.n = nR.error;
    const tR = validateField("T", state.T_i);
    if (!tR.valid) errs.T = tR.error;
    const piR = validateField("P", state.P_i);
    if (!piR.valid) errs.P_i = piR.error;
    const viR = validateField("V", state.V_i);
    if (!viR.valid) errs.V_i = viR.error;
    const cvR = validateField("Cv", state.Cv);
    if (!cvR.valid) errs.Cv = cvR.error;
    const cpR = validateField("Cp", state.Cp);
    if (!cpR.valid) errs.Cp = cpR.error;
    if (!errs.Cv && !errs.Cp && parseFloat(state.Cp) <= parseFloat(state.Cv)) {
      errs.Cp = "Cp debe ser mayor que Cv";
    }

    if (state.processType === "isocorico") {
      if (state.inputMode === "presiones") {
        const pf = validateField("P", state.P_f);
        if (!pf.valid) errs.P_f = pf.error;
      } else {
        const tf = validateField("T", state.T_f);
        if (!tf.valid) errs.T_f = tf.error;
      }
    } else if (state.processType === "isobarico") {
      if (state.inputMode === "temperaturas") {
        const tf = validateField("T", state.T_f);
        if (!tf.valid) errs.T_f = tf.error;
      } else {
        const vf = validateField("V", state.V_f);
        if (!vf.valid) errs.V_f = vf.error;
      }
    } else if (state.inputMode === "presiones") {
      const pf = validateField("P", state.P_f);
      if (!pf.valid) errs.P_f = pf.error;
    } else {
      const vf = validateField("V", state.V_f);
      if (!vf.valid) errs.V_f = vf.error;
    }

    if (state.gammaMode === "personalizado") {
      const g = parseFloat(state.gammaCustom);
      if (state.gammaCustom !== "" && !isNaN(g)) {
        if (g <= 1) errs.gammaCustom = "γ debe ser mayor que 1";
        else if (g > 2.5) errs.gammaCustom = "Valor de γ fuera de rango físico realista";
      }
    }


    if (state.pathType === "irreversible" && state.processType !== "isocorico") {
      const pe = validateField("Pext", state.P_ext);
      if (!pe.valid) errs.P_ext = pe.error;
    }

    if (state.gasType === "real") {
      const aR = validateField("a", state.a);
      const bR = validateField("b", state.b);
      if (!aR.valid) errs.a = aR.error;
      if (!bR.valid) errs.b = bR.error;
      if (!errs.V_i && !errs.n && !errs.b) {
        const n = parseFloat(state.n), b = parseFloat(state.b || 0), Vi = parseFloat(state.V_i), Vf = parseFloat(state.V_f || 0);
        if (!isNaN(n) && !isNaN(b) && !isNaN(Vi) && Vi <= n * b) errs.V_i = `V_i debe ser > n·b (${(n * b).toFixed(4)} L)`;
        if (state.processType !== "isocorico" && state.inputMode !== "presiones" && !isNaN(n) && !isNaN(b) && !isNaN(Vf) && state.V_f !== "" && Vf <= n * b) {
          errs.V_f = `V_f debe ser > n·b (${(n * b).toFixed(4)} L)`;
        }
      }
    }
    return errs;
  }, [state]);

  const result = useMemo(() => {
    if (Object.keys(errors).length > 0) return null;
    try {
      return runSimulation(state);
    } catch {
      return null;
    }
  }, [state, errors]);

  useEffect(() => {
    if (result) {
      if (lastResultRef.current) setPrevCurve(lastResultRef.current.curve);
      lastResultRef.current = result;
    }
  }, [result]);

  useEffect(() => {
    if (state.gasType !== "ideal") {
      setState((s) => ({ ...s, gasType: "ideal" }));
    }
  }, [state.gasType]);

  const buildLabel = useCallback((s) => {
    const m = PROCESS_META[s.processType];
    return `${m.label} · Gas ideal · ${s.pathType === "reversible" ? "Rev." : "Irrev."}`;
  }, []);

  const saveCurrentToHistory = useCallback(() => {
    if (!result) return;
    setHistory((h) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: buildLabel(state), state, result, timestamp: Date.now() },
      ...h,
    ]);
  }, [state, result, buildLabel]);

  const handleManualSave = useCallback(() => {
    saveCurrentToHistory();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  }, [saveCurrentToHistory]);

  const requestLoadFromHistory = (entry) => setPendingEntry(entry);

  const confirmLoad = () => {
    saveCurrentToHistory();
    setState(pendingEntry.state);
    setPendingEntry(null);
    setView("simulador");
  };

  const cancelLoad = () => setPendingEntry(null);

  const requestReset = () => setResetPending(true);

  const confirmReset = () => {
    saveCurrentToHistory();
    setState(DEFAULT_STATE);
    setResetPending(false);
  };

  const cancelReset = () => setResetPending(false);

  const deleteHistoryEntry = (id) => setHistory((h) => h.filter((e) => e.id !== id));

  return (
    <div style={S.app} className="thermo-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        input::placeholder { color: #7E8E87; }
        input:focus { outline: none; border-color: #195C40 !important; }
        button { cursor: pointer; font-family: inherit; }
        button:hover { opacity: 0.96; }
        .mono-num, .mono-num * { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <header style={S.header} className="thermo-header">
        <div style={S.headerLeft}>
         
          <div>
            <div style={S.appTitle}>Simulador Termodinámico</div>
            <div style={S.appSub}></div>
          </div>
        </div>
        <nav style={S.nav} className="thermo-nav">
          {[
            ["simulador", "Simulador"],
            ["graficos", "Gráficos"],
            ["historial", "Historial"],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setView(key)} style={view === key ? S.navItemActive : S.navItem} className={view === key ? "navItemActive" : "navItem"}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main style={S.main}>
        {view === "simulador" && (
          <SimuladorView
            state={state}
            setState={setState}
            errors={errors}
            result={result}
            prevCurve={prevCurve}
            onOpenMemory={() => setMemoryOpen(true)}
            onSaveToHistory={handleManualSave}
            onReset={requestReset}
          />
        )}
        {view === "graficos" && <GraficosView result={result} state={state} />}
        {view === "historial" && <HistorialView history={history} onLoad={requestLoadFromHistory} onDelete={deleteHistoryEntry} />}
      </main>

      <CalcMemoryPanel open={memoryOpen} onClose={() => setMemoryOpen(false)} steps={result?.steps || []} processLabel={buildLabel(state)} />
      <ConfirmReplaceModal open={!!pendingEntry} entry={pendingEntry} onConfirm={confirmLoad} onCancel={cancelLoad} />
      <ConfirmReplaceModal open={resetPending} mode="reset" onConfirm={confirmReset} onCancel={cancelReset} />

      <div
        style={{
          ...S.toast,
          opacity: savedToast ? 1 : 0,
          transform: `translateX(-50%) translateY(${savedToast ? 0 : 12}px)`,
        }}
      >
         Guardado en el historial
      </div>
    </div>
  );
}
