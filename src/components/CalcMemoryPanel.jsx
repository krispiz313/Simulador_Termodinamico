
import Latex from "./Latex";
import { fmt } from "../lib/format";
import { S } from "../styles";

export default function CalcMemoryPanel({ open, onClose, steps, processLabel }) {
  return (
    <div style={{ ...S.memoryOverlay, pointerEvents: open ? "auto" : "none", opacity: open ? 1 : 0 }} onClick={onClose}>
      <div style={{ ...S.memoryPanel, transform: open ? "translateX(0)" : "translateX(100%)" }} onClick={(e) => e.stopPropagation()}>
        <div style={S.memoryHeader}>
          <div>
            <div style={S.memoryTitle}>Memoria de cálculo</div>
            <div style={S.memorySub}>{processLabel} · actualización en vivo</div>
          </div>
          <button onClick={onClose} style={S.iconButton} aria-label="Cerrar panel">✕</button>
        </div>
        <div style={S.memoryTimeline}>
          {steps.map((s, i) => (
            <div key={s.id} style={S.memoryStep}>
              <div style={S.memoryDot} />
              {i < steps.length - 1 && <div style={S.memoryLine} />}
              <div style={S.memoryContent}>
                <div style={S.memoryStepLabel}>{s.label}</div>
                <div style={S.memoryFormula}>
                  <Latex tex={s.formula} display />
                </div>
                {s.value !== null && (
                  <div style={S.memoryStepValue}>
                    <Latex tex={`= ${fmt(s.value, 4)}`} /> {s.unit}
                  </div>
                )}
              </div>
            </div>
          ))}
          {steps.length === 0 && (
            <div style={S.memoryEmpty}>Completa los datos de entrada para ver el desarrollo del cálculo aquí.</div>
          )}
        </div>
      </div>
    </div>
  );
}
