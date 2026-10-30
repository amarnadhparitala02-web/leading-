"use client";

import { useEffect, useRef } from "react";

// Fades and lifts content in as it scrolls into view. Content stays fully visible
// without JavaScript, and for visitors who prefer reduced motion.
export default function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.classList.add("rv-hidden");
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.remove("rv-hidden");
        io.disconnect();
      }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} className={`rv ${className}`} style={{ "--d": `${delay}ms` }}>{children}</div>;
}
