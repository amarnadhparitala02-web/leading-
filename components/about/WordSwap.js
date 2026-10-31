"use client";

import { useEffect, useState } from "react";

// A headline word that changes every few seconds with a soft fade. With reduced motion it stays on the first word.
export default function WordSwap({ words, every = 2600, className = "" }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % words.length), every);
    return () => clearInterval(t);
  }, [words, every]);

  return (
    <span className={`inline-grid ${className}`} aria-live="off">
      {/* All words share one grid cell so the line never jumps in width. */}
      {words.map((w, k) => (
        <span key={w} aria-hidden={k !== i} className={`word-swap col-start-1 row-start-1 ${k === i ? "word-on" : "word-off"}`}>{w}</span>
      ))}
    </span>
  );
}
