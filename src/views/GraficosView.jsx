
import ResultCard from "../components/ResultCard";
import PVChart from "../components/PVChart";
import PistonDiagram from "../components/PistonDiagram";
import { PROCESS_META } from "../constants";
import { fmt } from "../lib/format";
import { S } from "../styles";

export default function GraficosView({ result, state }) {
  if (!result) return <div style={S.emptyState}>No hay datos válidos para graficar.</div>;
  const meta = PROCESS_META[state.processType];
  const diff = result.W_irrev_J != null ? Math.abs(result.W_rev_J) - Math.abs(result.W_irrev_J) : null;

  return (
    <div style={S.reportWrap}>
      <div style={S.reportHeadRow}>
        <div>
          <div style={S.reportTitle}>Análisis gráfico</div>
          <div style={S.reportSub}>
            {meta.label} · Gas ideal · comparación
            reversible vs. irreversible
          </div>
        </div>
      </div>

      <div style={S.resultsGrid}>
        <ResultCard labelTex="\Delta U" value={result.dU_J} unit="J" />
        <ResultCard labelTex="\Delta H" value={result.dH_J} unit="J" />
        <ResultCard labelTex="W \text{ (trabajo)}" value={result.W_J} unit="J" accent={result.W_J < 0 ? "#0B3D2E" : "#C33A2F"} />
        <ResultCard labelTex="q \text{ (calor)}" value={result.q_J} unit="J" />
      </div>

      <div style={S.graphFullRow} className="graphFullRow">
        <div style={S.chartBox} className="chartBox">
          <div style={S.chartHead} className="chartHead">
            <span>Diagrama P–V — ambos caminos</span>
            <span style={S.chartLegend} className="chartLegend">
              <span style={{ color: "#0B3D2E" }}>● Reversible</span>
              <span style={{ color: "#C33A2F", marginLeft: 12 }}>┄ Irreversible</span>
            </span>
          </div>
          <PVChart
            compareMode
            curveRev={result.curveRev}
            curveIrrev={result.curveIrrev}
            processType={state.processType}
            isothermHigh={result.isothermHigh}
            isothermLow={result.isothermLow}
            width={1040}
            height={460}
          />
          {state.processType === "adiabatico" && (
            <div style={S.isoLegendRow}>
              <span style={{ color: "#6FE3A8" }}> Isoterma T alta = {fmt(Math.max(state.T_i, result.T_f), 1)} K </span> 
              <span style={{ color: "#E0524A", marginLeft: 16 }}> Isoterma T baja = {fmt(Math.min(state.T_i, result.T_f), 1)} K</span>
            </div>
          )}
          {result.W_rev_J != null && (
            <div style={S.compareRow}>
              <div style={S.compareItem}>
                <span style={{ color: "#0B3D2E" }}>W reversible</span>
                <span style={S.mono}>{fmt(result.W_rev_J, 1)} J</span>
              </div>
              <div style={S.compareItem}>
                <span style={{ color: "#C33A2F" }}>W irreversible</span>
                <span style={S.mono}>{fmt(result.W_irrev_J, 1)} J</span>
              </div>
              <div style={S.compareItem}>
                <span style={{ color: "#9AB0A6" }}>Diferencia</span>
                <span style={S.mono}>{fmt(Math.abs(diff), 1)} J</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={S.graphTripleGrid}>
        <div style={S.chartBox} className="chartBox">
          <div style={S.chartHead} className="chartHead">
            <span>Proceso {meta.label} (en vivo)</span>
          </div>
          <PistonDiagram V_i={state.V_i} V_f={result.inputs?.V_f} processType={state.processType} pathType={state.pathType} gasType={state.gasType} />
        </div>

        <div style={S.panel}>
          <div style={S.panelHead}>Estado del sistema</div>
          <table style={S.dataTable}>
            <thead>
              <tr>
                <th style={S.th}>Variable</th>
                <th style={S.th}>Punto</th>
                <th style={S.th}>Punto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={S.td}>Presión (atm)</td>
                <td style={S.tdMono}>{fmt(result.inputs?.P_i)}</td>
                <td style={S.tdMono}>{fmt(result.P_f)}</td>
              </tr>
              <tr>
                <td style={S.td}>Volumen (L)</td>
                <td style={S.tdMono}>{fmt(state.V_i)}</td>
                <td style={S.tdMono}>{fmt(result.inputs?.V_f)}</td>
              </tr>
              <tr>
                <td style={S.td}>Temperatura (K)</td>
                <td style={S.tdMono}>{fmt(state.T_i)}</td>
                <td style={S.tdMono}>{fmt(result.T_f)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: 16 }}>
            <div style={S.refTitle}>Interpretación</div>
            <div style={S.refText}>
              {diff != null && diff > 0.01
                ? "El camino reversible aprovecha más trabajo que el irreversible (área sombreada en el gráfico). Esta diferencia representa la energía perdida por la irreversibilidad del proceso real."
                : "Ambos caminos coinciden o la diferencia es despreciable para los valores actuales."}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={S.refTitle}>Pendiente de la curva</div>
            <div style={S.refText}>
              {state.processType === "adiabatico"
                ? "La pendiente de la adiabática es más pronunciada que la de una isoterma equivalente, ya que γ > 1 — esto refleja la ausencia de transferencia de calor."
                : "La forma de la curva depende del tipo de proceso seleccionado. Cambia los parámetros de entrada para observar cómo se modifica en tiempo real."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
