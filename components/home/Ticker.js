const items = ["B.Tech", "Agriculture", "AP EAPCET", "TS EAPCET", "Verified cutoffs", "Free counselling", "Hyderabad", "Andhra Pradesh & Telangana"];

// A slowly scrolling colour band. Pauses on hover; still for visitors who prefer reduced motion.
export default function Ticker() {
  const row = (key) => (
    <ul key={key} className="flex shrink-0 items-center" aria-hidden={key === "b" ? "true" : undefined}>
      {items.map((t, i) => (
        <li key={t} className="flex items-center whitespace-nowrap px-6 text-lg font-extrabold uppercase tracking-wide md:text-xl" style={{ fontFamily: "var(--font-display)" }}>
          <span className={i % 3 === 0 ? "text-accent" : i % 3 === 1 ? "text-white" : "text-[#ff8f86]"}>{t}</span>
          <svg viewBox="0 0 24 24" className="ml-12 h-5 w-5 text-white/50" fill="currentColor" aria-hidden="true"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" /></svg>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="overflow-hidden py-4">
      <div className="marquee -mx-2 -rotate-1 border-y-4 border-ink bg-brand py-4 shadow-lg" role="region" aria-label="Highlights">
        <div className="marquee-track">{row("a")}{row("b")}</div>
      </div>
    </div>
  );
}
