
import { useState, useEffect, useRef } from "react";
import { loadKatex } from "../hooks/useKatex";

export default function Latex({ tex, display = false, color }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(!!window.katex);

  useEffect(() => {
    if (window.katex) {
      setReady(true);
      return;
    }
    loadKatex()
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, []);

  useEffect(() => {
    if (ready && ref.current && window.katex) {
      try {
        window.katex.render(tex, ref.current, { throwOnError: false, displayMode: display });
      } catch (e) {
        ref.current.textContent = tex;
      }
    }
  }, [ready, tex, display]);

  if (!ready) {
    return <span style={{ fontFamily: "'JetBrains Mono', monospace", color: color || "inherit" }}>{tex}</span>;
  }
  return <span ref={ref} style={{ color: color || "inherit" }} />;
}
