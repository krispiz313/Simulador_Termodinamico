
export default function PVChart({
  curve,
  prevCurve,
  processType,
  pathType,
  isothermHigh,
  isothermLow,
  compareMode,
  curveRev,
  curveIrrev,
  width = 520,
  height = 280,
}) {
  const W = width, H = height, PAD_L = 58, PAD_B = 40, PAD_T = 24, PAD_R = 20;
  const mainCurve = compareMode ? curveRev : curve;
  if (!mainCurve || mainCurve.length === 0) return null;

  const allCurvesForRange = compareMode ? [...curveRev, ...curveIrrev] : mainCurve;
  const allV = allCurvesForRange.map((p) => p.v);
  const allP = allCurvesForRange.map((p) => p.p);
  let isoHighCurve = null, isoLowCurve = null;
  if (isothermHigh && isothermLow) {
    isoHighCurve = mainCurve.map((pt) => ({ v: pt.v, p: isothermHigh / pt.v }));
    isoLowCurve = mainCurve.map((pt) => ({ v: pt.v, p: isothermLow / pt.v }));
    allP.push(...isoHighCurve.map((p) => p.p), ...isoLowCurve.map((p) => p.p));
  }
  let vMin = Math.min(...allV) * 0.92;
  let vMax = Math.max(...allV) * 1.08;
  let pMin = Math.min(...allP) * 0.9;
  let pMax = Math.max(...allP) * 1.1;

  const vRange = vMax - vMin || Math.max(1, Math.abs(vMin) * 0.1, Math.abs(vMax) * 0.1);
  const pRange = pMax - pMin || Math.max(1, Math.abs(pMin) * 0.1, Math.abs(pMax) * 0.1);
  if (vRange === 0) {
    vMin -= 0.5;
    vMax += 0.5;
  }
  if (pRange === 0) {
    pMin -= 0.5;
    pMax += 0.5;
  }

  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B;
  const x = (v) => PAD_L + ((v - vMin) / (vMax - vMin || 1)) * plotW;
  const y = (p) => H - PAD_B - ((p - pMin) / (pMax - pMin || 1)) * plotH;

  const toPath = (arr) => arr.map((pt, i) => `${i === 0 ? "M" : "L"}${x(pt.v).toFixed(2)},${y(pt.p).toFixed(2)}`).join(" ");
  const start = mainCurve[0], end = mainCurve[mainCurve.length - 1];

  const N_TICKS = 5;
  const vTicks = Array.from({ length: N_TICKS + 1 }, (_, i) => vMin + ((vMax - vMin) * i) / N_TICKS);
  const pTicks = Array.from({ length: N_TICKS + 1 }, (_, i) => pMin + ((pMax - pMin) * i) / N_TICKS);
  const fmtTick = (v) => {
    if (Math.abs(v) >= 100) return v.toFixed(0);
    if (Math.abs(v) >= 10) return v.toFixed(1);
    return v.toFixed(2);
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Diagrama presión-volumen">
      {/* grid completo: líneas horizontales y verticales en cada marca */}
      {pTicks.map((pt, i) => (
        <line key={`gh${i}`} x1={PAD_L} x2={W - PAD_R} y1={y(pt)} y2={y(pt)} stroke="#1C2B25" strokeWidth="1" />
      ))}
      {vTicks.map((vt, i) => (
        <line key={`gv${i}`} x1={x(vt)} x2={x(vt)} y1={PAD_T} y2={H - PAD_B} stroke="#1C2B25" strokeWidth="1" />
      ))}

      {/* axes */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="#3A5048" strokeWidth="1.5" />
      <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="#3A5048" strokeWidth="1.5" />

      {/* marcas numéricas del eje Y (presión) */}
      {pTicks.map((pt, i) => (
        <text key={`pl${i}`} x={PAD_L - 8} y={y(pt) + 3} textAnchor="end" fontSize="10" fill="#7A938A" fontFamily="JetBrains Mono, monospace">
          {fmtTick(pt)}
        </text>
      ))}
      {/* marcas numéricas del eje X (volumen) */}
      {vTicks.map((vt, i) => (
        <text key={`vl${i}`} x={x(vt)} y={H - PAD_B + 16} textAnchor="middle" fontSize="10" fill="#7A938A" fontFamily="JetBrains Mono, monospace">
          {fmtTick(vt)}
        </text>
      ))}

      <text x={PAD_L} y={14} fill="#9AB0A6" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">P (atm)</text>
      <text x={W - PAD_R - 38} y={H - 6} fill="#9AB0A6" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">V (L)</text>

      {/* Isotermas de comparación (solo adiabático): T alta y T baja, punteadas */}
      {isoHighCurve && (
        <path d={toPath(isoHighCurve)} fill="none" stroke="#6FE3A8" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.65" />
      )}
      {isoLowCurve && (
        <path d={toPath(isoLowCurve)} fill="none" stroke="#E0524A" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.65" />
      )}

      {/* curva previa (fantasma) — solo aplica en modo simple */}
      {compareMode ? (
        <>
          {/* Área sombreada entre ambas curvas*/}
          <path d={`${toPath(curveRev)} ${toPath([...curveIrrev].reverse()).replace("M", "L")} Z`} fill="#9AB0A615" />
          {/* Curva reversible (continua, verde) */}
          <path d={toPath(curveRev)} fill="none" stroke="#0B3D2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Curva irreversible (continua, rojo) */}
          <path d={toPath(curveIrrev)} fill="none" stroke="#C33A2F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Puntos finales de cada trayectoria */}
          <circle cx={x(curveRev[curveRev.length - 1].v)} cy={y(curveRev[curveRev.length - 1].p)} r="5" fill="#0B3D2E" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx={x(curveIrrev[curveIrrev.length - 1].v)} cy={y(curveIrrev[curveIrrev.length - 1].p)} r="5" fill="#C33A2F" stroke="#FFFFFF" strokeWidth="1.5" />
        </>
      ) : (
        <path d={toPath(mainCurve)} fill="none" stroke={pathType === "reversible" ? "#0B3D2E" : "#C33A2F"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="opacity" from="0" to="1" dur="0.4s" fill="freeze" />
        </path>
      )}

      <circle cx={x(start.v)} cy={y(start.p)} r="5" fill="#E8F0ED" stroke="#0B1210" strokeWidth="1.5" />
      <text x={x(start.v) + 8} y={y(start.p) - 8} fill="#E8F0ED" fontSize="11" fontFamily="JetBrains Mono, monospace">①</text>
      {!compareMode && (
        <>
          <circle cx={x(end.v)} cy={y(end.p)} r="5" fill={pathType === "reversible" ? "#0B3D2E" : "#C33A2F"} stroke="#FFFFFF" strokeWidth="1.5" />
          <text x={x(end.v) + 8} y={y(end.p) - 8} fill="#E8F0ED" fontSize="11" fontFamily="JetBrains Mono, monospace">②</text>
        </>
      )}
    </svg>
  );
}
