
import { S } from "../styles";

export default function ConfirmReplaceModal({ open, onConfirm, onCancel, entry, mode = "load" }) {
  if (!open) return null;
  const isReset = mode === "reset";

  return (
    <div style={S.modalOverlay}>
      <div style={S.modalBox}>
        <div style={S.modalIcon}>⚠</div>
        <div style={S.modalTitle}>
          {isReset ? "Vas a reiniciar todos los valores" : "Vas a reemplazar la simulación actual"}
        </div>
        <p style={S.modalText}>
          {isReset ? (
            <>
              Todos los campos volverán a sus valores estándar predeterminados. Los cálculos que tienes en
              pantalla ahora se guardarán automáticamente como el último registro del historial antes de
              reiniciarse — no se pierden, pero dejarán de estar activos.
            </>
          ) : (
            <>
              Se cargarán los datos de <strong style={{ color: "#0B3D2E" }}>{entry?.label}</strong>. Los
              cálculos que tienes en pantalla ahora se guardarán automáticamente como el último registro del
              historial antes de reemplazarse — no se pierden, pero dejarán de estar activos.
            </>
          )}
        </p>
        <div style={S.modalActions}>
          <button style={S.modalBtnGhost} onClick={onCancel}>
            Cancelar
          </button>
          <button style={S.modalBtnPrimary} onClick={onConfirm}>
            {isReset ? "Reiniciar y continuar" : "Cargar y continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
