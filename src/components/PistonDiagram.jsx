
export default function PistonDiagram({ V_i: V_i_raw, V_f: V_f_raw, processType, pathType, gasType }) {
  const V_i = parseFloat(V_i_raw);
  const V_f = parseFloat(V_f_raw);
  const W = 220, H = 260;
  const cylTop = 30, cylBottom = H - 40, cylLeft = 55, cylRight = W - 55;
  const cylHeight = cylBottom - cylTop;

  const allV = [V_i, V_f].filter((v) => !isNaN(v) && v > 0);
  const vMin = Math.min(...allV) * 0.85 || 1;
  const vMax = Math.max(...allV) * 1.15 || 10;
  const vToY = (v) => cylBottom - ((v - vMin) / (vMax - vMin || 1)) * cylHeight * 0.85 - cylHeight * 0.1;

  const yPistonTarget = vToY(V_f);
  const isCompression = V_f < V_i;

  const accent = pathType === "reversible" ? "#0B3D2E" : "#C33A2F";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Diagrama de pistón">
      {/* Cilindro fijo */}
      <rect x={cylLeft} y={cylTop} width={cylRight - cylLeft} height={cylHeight} rx="6" fill="none" stroke="#3A5048" strokeWidth="2" />
      {/* Base */}
      <rect x={cylLeft - 8} y={cylBottom} width={cylRight - cylLeft + 16} height="10" rx="3" fill="#3A5048" />

      {/* Gas (relleno que sube/baja con el pistón, animado) */}
      <rect
        x={cylLeft + 2}
        y={yPistonTarget}
        width={cylRight - cylLeft - 4}
        height={cylBottom - yPistonTarget - 2}
        fill={gasType === "real" ? "#FCEBEC" : "#EAF6F0"}
        style={{ transition: "y 0.6s cubic-bezier(0.4,0,0.2,1), height 0.6s cubic-bezier(0.4,0,0.2,1)" }}
      />

      {/* Pistón (rectángulo + vástago) — se mueve animado a la posición final */}
      <g style={{ transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)" }} transform={`translate(0, ${yPistonTarget - 14})`}>
        <rect x={cylLeft - 4} y="0" width={cylRight - cylLeft + 8} height="14" rx="3" fill="#9AB0A6" />
        <rect x={(cylLeft + cylRight) / 2 - 3} y="-22" width="6" height="22" fill="#7A938A" />
        <circle cx={(cylLeft + cylRight) / 2} cy="-26" r="5" fill={accent} />
      </g>

      {/* Flecha indicando dirección del movimiento */}
      <text x={W / 2} y={cylTop - 12} textAnchor="middle" fontSize="11" fill={accent} fontFamily="JetBrains Mono, monospace">
        {isCompression ? "▼ compresión" : "▲ expansión"}
      </text>

      {/* Etiquetas de volumen */}
      <text x={cylLeft - 10} y={vToY(V_i)} textAnchor="end" fontSize="9.5" fill="#7A938A" fontFamily="JetBrains Mono, monospace">V_i</text>
      <text x={cylRight + 10} y={vToY(V_f)} textAnchor="start" fontSize="9.5" fill={accent} fontFamily="JetBrains Mono, monospace">V_f</text>
    </svg>
  );
}
