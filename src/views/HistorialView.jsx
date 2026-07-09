
import { PROCESS_META } from "../constants";
import { fmt } from "../lib/format";
import { S } from "../styles";

export default function HistorialView({ history, onLoad, onDelete }) {
  return (
    <div style={S.reportWrap}>
      <div style={S.reportHeadRow}>
        <div>
          <div style={S.reportTitle}>Historial de simulaciones</div>
          <div style={S.reportSub}>Registro cronológico. Haz clic en un registro para cargarlo en el simulador.</div>
        </div>
        <div style={S.statPill}>
          {history.length} {history.length === 1 ? "registro" : "registros"}
        </div>
      </div>

      {history.length === 0 ? (
        <div style={S.emptyState}>
          Aún no hay simulaciones guardadas. Cuando reemplaces los datos del simulador, el estado actual se
          guardará aquí automáticamente.
        </div>
      ) : (
        <div style={S.historyList}>
          {history.map((entry) => (
            <div key={entry.id} style={S.historyRow}>
              <div style={S.historyMain} onClick={() => onLoad(entry)}>
                <div style={S.historyBadge}>{PROCESS_META[entry.state.processType]?.icon}</div>
                <div>
                  <div style={S.historyLabel}>{entry.label}</div>
                  <div style={S.historySub}>
                    Gas ideal ·{" "}
                    {entry.state.pathType === "reversible" ? "Reversible" : "Irreversible"} ·{" "}
                    {new Date(entry.timestamp).toLocaleString("es-EC")}
                  </div>
                </div>
              </div>
              <div style={S.historyStats}>
                <div style={S.historyStat}>
                  <span style={S.historyStatLabel}>W</span>
                  <span style={S.mono}>{fmt(entry.result?.W_J, 1)} J</span>
                </div>
                <div style={S.historyStat}>
                  <span style={S.historyStatLabel}>q</span>
                  <span style={S.mono}>{fmt(entry.result?.q_J, 1)} J</span>
                </div>
              </div>
              <button style={S.historyDelete} onClick={() => onDelete(entry.id)} aria-label="Eliminar registro">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
