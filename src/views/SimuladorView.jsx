
import Latex from "../components/Latex";
import NumField from "../components/NumField";
import ResultCard from "../components/ResultCard";
import PVChart from "../components/PVChart";
import PistonDiagram from "../components/PistonDiagram";
import { PROCESS_META } from "../constants";
import { GAS_PRESETS, gammaToCvCp } from "../lib/engine";
import { S } from "../styles";

export default function SimuladorView({ state, setState, errors, result, prevCurve, onOpenMemory, onSaveToHistory, onReset }) {
  const handleChange = (key, val) => setState((s) => ({ ...s, [key]: val }));
  const meta = PROCESS_META[state.processType];
  const needsPext = state.pathType === "irreversible" && state.processType !== "isocorico";


  const handleInputModeChange = (newMode) => {
    if (!result || newMode === state.inputMode) {
      setState((s) => ({ ...s, inputMode: newMode }));
      return;
    }
    const toInputStr = (num) => (num === null || num === undefined || isNaN(num) ? "" : num.toFixed(4));
    const patch = { inputMode: newMode };
    if (state.processType === "isocorico") {
    
      if (newMode === "presiones") patch.P_f = toInputStr(result.P_f);
      else patch.T_f = toInputStr(result.T_f);
    } else if (state.processType === "isobarico") {
   
      if (newMode === "temperaturas") patch.T_f = toInputStr(result.T_f);
      else patch.V_f = toInputStr(result.inputs?.V_f);
    } else {
   
      if (newMode === "presiones") patch.P_f = toInputStr(result.P_f);
      else patch.V_f = toInputStr(result.inputs?.V_f);
    }
    setState((s) => ({ ...s, ...patch }));
  };

  return (
    <div style={S.grid3} className="grid3">
      {/* COLUMNA 1: Configuración */}
      <div style={S.panel} className="panel">
        <div style={S.panelHead}>Configuración</div>

        <div style={S.toggleRow} className="toggleRow">
          <span style={S.toggleLabel}>Modelo activo</span>
          <div style={{ ...S.segmented, background: "#F3FAF6" }} className="segmented">
            <div style={{ ...S.segActive, background: "#EAF6F0", color: "#0B3D2E" }}>Gas ideal</div>
          </div>
          <div style={S.helperText}>Esta versión del simulador trabaja únicamente con gases ideales.</div>
        </div>

        <div style={S.processGrid} className="processGrid">
          {Object.entries(PROCESS_META).map(([key, m]) => (
            <button
              key={key}
              onClick={() => setState((s) => ({ ...s, processType: key }))}
              style={state.processType === key ? S.processBtnActive : S.processBtn}
              className={state.processType === key ? "processBtnActive" : "processBtn"}
            >
              <span style={S.processIcon}>{m.icon}</span>
              <span style={S.processLabel}>{m.label}</span>
              <span style={S.processSub}>
                <Latex tex={m.sub} />
              </span>
            </button>
          ))}
        </div>

        <div style={S.toggleRow} className="toggleRow">
          <span style={S.toggleLabel}>Camino del proceso</span>
          <div style={S.segmented} className="segmented">
            <button style={state.pathType === "reversible" ? S.segActive : S.seg} className={state.pathType === "reversible" ? "segActive" : "seg"} onClick={() => setState((s) => ({ ...s, pathType: "reversible" }))}>
              Reversible
            </button>
            <button style={state.pathType === "irreversible" ? S.segActive : S.seg} className={state.pathType === "irreversible" ? "segActive" : "seg"} onClick={() => setState((s) => ({ ...s, pathType: "irreversible" }))}>
              Irreversible
            </button>
          </div>
        </div>

        {/* Combobox "Tipo de entrada" varía según qué variable está fija por definición del proceso */}
        {(state.processType === "isotermico" || state.processType === "adiabatico") && (
          <div style={S.toggleRow} className="toggleRow">
            <span style={S.toggleLabel}>Tipo de entrada</span>
            <div style={S.gammaRow} className="gammaRow">
              <select value={state.inputMode} onChange={(e) => handleInputModeChange(e.target.value)} style={S.select} className="select">
                <option value="volumenes">Volúmenes</option>
                <option value="presiones">Presiones</option>
              </select>
              <div style={S.inputModeTag}>
                {state.inputMode === "volumenes" ? <Latex tex="(V_i,\ V_f)" /> : <Latex tex="(P_i,\ P_f)" />}
              </div>
            </div>
          </div>
        )}

        {state.processType === "isobarico" && (
          <div style={S.toggleRow}>
            <span style={S.toggleLabel}>Tipo de entrada</span>
            <div style={S.gammaRow}>
              <select
                value={state.inputMode === "presiones" ? "volumenes" : state.inputMode}
                onChange={(e) => handleInputModeChange(e.target.value)}
                style={S.select}
              >
                <option value="volumenes">Volumen</option>
                <option value="temperaturas">Temperatura</option>
              </select>
              <div style={S.inputModeTag}>
                {state.inputMode === "temperaturas" ? <Latex tex="(T_f)" /> : <Latex tex="(V_f)" />}
              </div>
            </div>
          </div>
        )}

        {state.processType === "isocorico" && (
          <div style={S.toggleRow}>
            <span style={S.toggleLabel}>Tipo de entrada</span>
            <div style={S.gammaRow}>
              <select value={state.inputMode} onChange={(e) => handleInputModeChange(e.target.value)} style={S.select}>
                <option value="volumenes">Temperatura</option>
                <option value="presiones">Presión</option>
              </select>
              <div style={S.inputModeTag}>
                {state.inputMode === "volumenes" ? <Latex tex="(T_f)" /> : <Latex tex="(P_f)" />}
              </div>
            </div>
          </div>
        )}

        <div style={S.fieldsGrid} className="fieldsGrid">
          <NumField field={{ key: "n", labelTex: "n", unit: "mol", help: "Moles de sustancia" }} value={state.n} onChange={handleChange} error={errors.n} />
          <NumField field={{ key: "T_i", labelTex: "T_i", unit: "K", help: "Temperatura inicial" }} value={state.T_i} onChange={handleChange} error={errors.T} />
          <NumField field={{ key: "P_i", labelTex: "P_i", unit: "atm", help: "Presión inicial" }} value={state.P_i} onChange={handleChange} error={errors.P_i} />
          <NumField field={{ key: "V_i", labelTex: "V_i", unit: "L", help: "Volumen inicial" }} value={state.V_i} onChange={handleChange} error={errors.V_i} />

          {/* Variable final: bifurca según proceso + combobox activo */}
          {state.processType === "isocorico" ? (
            state.inputMode === "presiones" ? (
              <NumField field={{ key: "P_f", labelTex: "P_f", unit: "atm", help: "Presión final" }} value={state.P_f} onChange={handleChange} error={errors.P_f} />
            ) : (
              <NumField field={{ key: "T_f", labelTex: "T_f", unit: "K", help: "Temperatura final" }} value={state.T_f} onChange={handleChange} error={errors.T_f} />
            )
          ) : state.processType === "isobarico" ? (
            state.inputMode === "temperaturas" ? (
              <NumField field={{ key: "T_f", labelTex: "T_f", unit: "K", help: "Temperatura final" }} value={state.T_f} onChange={handleChange} error={errors.T_f} />
            ) : (
              <NumField field={{ key: "V_f", labelTex: "V_f", unit: "L", help: "Volumen final" }} value={state.V_f} onChange={handleChange} error={errors.V_f} />
            )
          ) : state.inputMode === "presiones" ? (
            <NumField field={{ key: "P_f", labelTex: "P_f", unit: "atm", help: "Presión final" }} value={state.P_f} onChange={handleChange} error={errors.P_f} />
          ) : (
            <NumField field={{ key: "V_f", labelTex: "V_f", unit: "L", help: "Volumen final" }} value={state.V_f} onChange={handleChange} error={errors.V_f} />
          )}

          <NumField field={{ key: "Cv", labelTex: "C_v", unit: "J/mol·K", help: "Capacidad calorífica a V constante" }} value={state.Cv} onChange={handleChange} error={errors.Cv} />
          <NumField field={{ key: "Cp", labelTex: "C_p", unit: "J/mol·K", help: "Capacidad calorífica a P constante" }} value={state.Cp} onChange={handleChange} error={errors.Cp} />

          {needsPext && (
            <NumField field={{ key: "P_ext", labelTex: "P_{ext}", unit: "atm", help: "Presión externa" }} value={state.P_ext} onChange={handleChange} error={errors.P_ext} />
          )}
        </div>

        {/* Atajo opcional: autocompleta Cv/Cp */}
        <div style={S.toggleRow}>
          <span style={S.toggleLabel}>Tipo de gas — autocompleta Cv/Cp</span>
          <div style={S.gammaRow}>
            <select
              value={state.gammaMode}
              onChange={(e) => {
                const mode = e.target.value;
                if (mode === "personalizado") {
                  setState((s) => ({ ...s, gammaMode: mode }));
                  return;
                }
                const { Cv, Cp } = gammaToCvCp(GAS_PRESETS[mode].gamma);
                setState((s) => ({ ...s, gammaMode: mode, Cv: Cv.toFixed(3), Cp: Cp.toFixed(3) }));
              }}
              style={S.select}
            >
              <option value="monoatomico">Monoatómico (γ=1.67)</option>
              <option value="diatomico">Diatómico (γ=1.40)</option>
              <option value="personalizado">Personalizado (edición manual)</option>
            </select>
          </div>
          <div style={S.helperText}>Selecciona un tipo de gas para autocompletar Cv/Cp, o edítalos directamente arriba.</div>
        </div>

        <div style={S.actionRow} className="actionRow">
          <button style={S.memoryButton} className="memoryButton" onClick={onOpenMemory}>
            <span> Memoria de cálculo</span>
            <span style={S.memoryButtonBadge}>{result?.steps?.length || 0} pasos</span>
          </button>
          <button style={{ ...S.saveButton, opacity: result ? 1 : 0.4, cursor: result ? "pointer" : "not-allowed" }} className="saveButton" onClick={onSaveToHistory} disabled={!result}>
            <span> Guardar en historial</span>
          </button>
          <button style={S.resetButton} className="resetButton" onClick={onReset}>
            <span>↺ Reiniciar valores</span>
          </button>
        </div>
      </div>

      {/* COLUMNA 2: Resultados + gráfico */}
      <div style={S.panel} className="panel">
        <div style={S.panelHeadRow}>
          <span style={S.panelHead}>Resultados</span>
          <span
            style={{
              ...S.statusBadge,
              background: Object.keys(errors).length ? "#FCEBEC" : "#EAF6F0",
              color: Object.keys(errors).length ? "#C33A2F" : "#0B3D2E",
            }}
          >
            {Object.keys(errors).length ? "Revisa entradas" : ""}
          </span>
        </div>

        {result ? (
          <>
            <div style={S.resultsGrid} className="resultsGrid">
              <ResultCard labelTex="P_f \text{ (final)}" value={result.P_f} unit="atm" />
              <ResultCard labelTex="T_f \text{ (final)}" value={result.T_f} unit="K" />
              <ResultCard labelTex="W \text{ (trabajo)}" value={result.W_J} unit="J" accent={result.W_J < 0 ? "#0B3D2E" : "#C33A2F"} />
              <ResultCard labelTex="q \text{ (calor)}" value={result.q_J} unit="J" />
              <ResultCard labelTex="\Delta U" value={result.dU_J} unit="J" />
              <ResultCard labelTex="\Delta H" value={result.dH_J} unit="J" />
            </div>

            <div style={S.dualChartGrid} className="dualChartGrid">
              <div style={S.chartBox} className="chartBox">
                <div style={S.chartHead} className="chartHead">
                  <span>Diagrama P–V</span>
                  <span style={S.chartLegend} className="chartLegend">
                    <span style={{ color: state.pathType === "reversible" ? "#0B3D2E" : "#6E7C74" }}>● Reversible</span>
                    <span style={{ color: state.pathType === "irreversible" ? "#C33A2F" : "#6E7C74", marginLeft: 12 }}>● Irreversible</span>
                  </span>
                </div>
                <PVChart
                  curve={result.curve}
                  prevCurve={prevCurve}
                  processType={state.processType}
                  pathType={state.pathType}
                  isothermHigh={result.isothermHigh}
                  isothermLow={result.isothermLow}
                />
              </div>
              <div style={S.chartBox} className="chartBox">
                <div style={S.chartHead} className="chartHead">
                  <span>Pistón</span>
                </div>
                <PistonDiagram V_i={state.V_i} V_f={result.inputs?.V_f} processType={state.processType} pathType={state.pathType} gasType={state.gasType} />
              </div>
            </div>
          </>
        ) : (
          <div style={S.emptyState}>Corrige los campos marcados para ver resultados.</div>
        )}
      </div>

      {/* COLUMNA 3: Referencia rápida */}
      <div style={S.panel} className="panel">
        <div style={S.panelHead}>Referencia rápida</div>
        <div style={S.refCard}>
          <div style={S.refTitle}>{meta.label}</div>
          <div style={S.refText}>
            {state.processType === "isotermico" && "La temperatura permanece constante. Para gas ideal, ΔU = 0 porque la energía interna depende solo de T."}
            {state.processType === "isobarico" && "La presión permanece constante. El volumen y la temperatura cambian proporcionalmente (ley de Gay-Lussac/Charles)."}
            {state.processType === "isocorico" && "El volumen permanece constante, por lo que no hay trabajo de expansión/compresión: W = 0."}
            {state.processType === "adiabatico" && "No hay intercambio de calor con el entorno (q = 0). Todo cambio de energía interna proviene del trabajo."}
          </div>
        </div>
        <div style={S.refCard}>
          <div style={S.refTitle}>Constantes</div>
          <div style={S.constRow}>
            <span>R (gas ideal)</span>
            <span style={S.mono}>0.08206 L·atm/mol·K</span>
          </div>
          <div style={S.constRow}>
            <span>R (SI)</span>
            <span style={S.mono}>8.314 J/mol·K</span>
          </div>
          <div style={S.constRow}>
            <span>1 L·atm</span>
            <span style={S.mono}>101.325 J</span>
          </div>
        </div>
        <div style={S.refCard}>
          <div style={S.refTitle}>Convención de signos</div>
          <div style={S.refText}>
            Se usa la convención IUPAC: trabajo positivo W&gt;0 cuando se hace sobre el sistema compresión y negativo cuando el sistema lo realiza expansión.
          </div>
        </div>
      </div>
    </div>
  );
}
