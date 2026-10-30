"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icons";

const steps = [
  ["cap", "Intermediate completed", "Celebrate the milestone. It is normal to feel excited, uncertain or under pressure."],
  ["compass", "Explore interests and careers", "Understand the pathways open to you based on your stream, interests and eligibility."],
  ["book", "Choose a course", "Get B.Tech and Agriculture explained clearly, with next-step guidance."],
  ["chart", "Understand your EAPCET rank", "Pick AP EAPCET or TS EAPCET and see indicative options for your rank."],
  ["building", "Discover and compare colleges", "Verified profiles: branches, location, fees where verified, and cutoff context."],
  ["chat", "Request counselling", "Share your name and number only when you want a counsellor to follow up."],
  ["doc", "Admission and joining", "Application steps, document preparation, counselling milestones and confirmation."],
  ["star", "Begin college life", "Start your next chapter with clarity and the confidence of an informed choice."],
];

// The rail fills and the steps light up as the visitor scrolls through the section.
export default function JourneyTimeline() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // 0 when the section's top reaches 85% of the screen, 1 when its bottom reaches 75%.
      const p = (window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.1);
      setProgress(reduce ? 1 : Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  const active = Math.ceil(progress * steps.length);

  return (
    <section id="journey" ref={ref} className="scroll-mt-20 bg-soft py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <p className="eyebrow">Your journey</p>
        <h2 className="mt-3 max-w-2xl text-3xl md:text-5xl">From +2 to your dream college</h2>
        <p className="mt-4 max-w-2xl text-slate-700">One step at a time, with the right guidance.</p>

        <div className="timeline-rail mt-8" role="progressbar" aria-label="Journey progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <div className="timeline-fill" style={{ "--p": `${Math.round(progress * 100)}%` }} />
        </div>

        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([icon, title, text], i) => (
            <li key={title} className={`step card p-5 ${i < active ? "on" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="badge flex h-9 w-9 items-center justify-center rounded-full bg-soft text-sm font-bold text-brand">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-moss"><Icon name={icon} className="h-7 w-7" /></span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-brand">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
