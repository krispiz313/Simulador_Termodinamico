
import { useState, useEffect, useRef } from "react";
import Latex from "./Latex";
import { fmt } from "../lib/format";
import { S } from "../styles";

export default function ResultCard({ labelTex, value, unit, accent }) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value && value !== null && !isNaN(value)) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 480);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
    prevRef.current = value;
  }, [value]);

  return (
    <div
      style={{
        ...S.resultCard,
        borderColor: flash ? accent || "#0B3D2E" : "#DCE8E1",
        boxShadow: flash ? `0 0 0 1px ${accent || "#0B3D2E"}` : "none",
      }}
    >
      <div style={S.resultLabel}>
        <Latex tex={labelTex} />
      </div>
      <div style={{ ...S.resultValue, color: accent || S.resultValue.color }}>
        {fmt(value)} <span style={S.resultUnit}>{unit}</span>
      </div>
    </div>
  );
}
