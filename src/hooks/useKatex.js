
let katexLoadPromise = null;

export function loadKatex() {
  if (katexLoadPromise) return katexLoadPromise;
  katexLoadPromise = new Promise((resolve, reject) => {
    if (window.katex) return resolve(window.katex);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    script.onload = () => resolve(window.katex);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return katexLoadPromise;
}
