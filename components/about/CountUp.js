"use client";

import { useEffect, useRef, useState } from "react";

// Counts up to a number like "2000+" or "15" when it scrolls into view. Anything that is not a number
// (or visitors who prefer reduced motion) just sees the final text straight away.
export default function CountUp({ value, duration = 1600, className = "" }) {
  const match = String(value).match(/^(\D*)(\d[\d,]*)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, "")) : null;
  const ref = useRef(null);
  const [n, setN] = useState(target);

  useEffect(() => {
    if (target === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    setN(0);
    let raf;
    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        setN(Math.round(target * (1 - Math.pow(1 - t, 3)))); // ease out
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target, duration]);

  if (target === null) return <span className={className}>{value}</span>;
  return <span ref={ref} className={className}>{match[1]}{n}{match[3]}</span>;
}
