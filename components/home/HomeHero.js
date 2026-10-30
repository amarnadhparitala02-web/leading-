"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icons";

// Shown until a real photo is uploaded in the admin Photos tab (slot: Homepage hero).
// An original, colourful illustration, not a photo of any real college or person.
function CampusArt() {
  return (
    <svg viewBox="0 0 600 720" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="hsky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#4f7bff" /><stop offset="0.55" stopColor="#9db8ff" /><stop offset="1" stopColor="#ffe3a8" /></linearGradient>
        <linearGradient id="hwall" x1="0" x2="1"><stop offset="0" stopColor="#fffaf0" /><stop offset="1" stopColor="#f3dcc0" /></linearGradient>
        <linearGradient id="hlawn" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#38d68a" /><stop offset="1" stopColor="#12a063" /></linearGradient>
      </defs>
      <rect width="600" height="720" fill="url(#hsky)" />
      <circle cx="455" cy="150" r="96" fill="#ffd54a" opacity="0.35" className="gleam" />
      <circle cx="455" cy="150" r="62" fill="#ffc83d" className="gleam" />
      <g className="drift" fill="#fff"><ellipse cx="130" cy="120" rx="76" ry="18" opacity="0.95" /><ellipse cx="186" cy="106" rx="46" ry="15" opacity="0.95" /><ellipse cx="400" cy="250" rx="62" ry="13" opacity="0.8" /></g>
      <path d="M0 470 C110 420 230 450 330 430 S520 400 600 440 V720 H0Z" fill="#19c9a4" />
      <path d="M0 520 C140 480 260 510 380 490 S540 470 600 500 V720 H0Z" fill="#0fa585" />
      {/* main hall */}
      <rect x="110" y="380" width="380" height="230" fill="url(#hwall)" stroke="#15173f" strokeWidth="3" />
      <polygon points="92,384 300,300 508,384" fill="#2b3cc4" stroke="#15173f" strokeWidth="3" />
      <polygon points="130,378 300,320 470,378" fill="#4a5df0" />
      <rect x="270" y="236" width="60" height="90" fill="url(#hwall)" stroke="#15173f" strokeWidth="3" />
      <path d="M262 238 Q300 170 338 238Z" fill="#f2483b" stroke="#15173f" strokeWidth="3" />
      <line x1="300" y1="172" x2="300" y2="140" stroke="#15173f" strokeWidth="4" />
      <polygon points="300,140 340,150 300,162" fill="#ffc83d" stroke="#15173f" strokeWidth="2.5" />
      {[130, 196, 372, 438].map((x) => <g key={x}><rect x={x} y="396" width="22" height="190" fill="#fff" stroke="#15173f" strokeWidth="2.5" /><rect x={x - 4} y="390" width="30" height="9" fill="#f3dcc0" stroke="#15173f" strokeWidth="2" /></g>)}
      <rect x="262" y="500" width="76" height="110" rx="4" fill="#1d2a8c" stroke="#15173f" strokeWidth="3" />
      <circle cx="326" cy="558" r="4" fill="#ffc83d" />
      {[150, 212, 370, 432].map((x) => <rect key={x} className="gleam" x={x} y="430" width="18" height="30" rx="2" fill="#ffc83d" stroke="#15173f" strokeWidth="2" />)}
      <rect x="80" y="610" width="440" height="10" fill="#f3dcc0" /><rect x="60" y="620" width="480" height="10" fill="#e6c9a3" />
      <rect x="0" y="630" width="600" height="90" fill="url(#hlawn)" />
      <polygon points="270,630 330,630 420,720 180,720" fill="#ffe9bd" />
      {[[50, 640, 1, "#12a063"], [550, 640, 1, "#0fa585"], [150, 665, 0.7, "#2fd18d"], [455, 665, 0.7, "#2fd18d"]].map(([x, y, s, c], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><rect x="-5" y="-26" width="10" height="40" fill="#7a4b2a" /><circle cx="0" cy="-58" r="32" fill={c} stroke="#15173f" strokeWidth="3" /><circle cx="-22" cy="-40" r="22" fill="#38d68a" stroke="#15173f" strokeWidth="3" /><circle cx="22" cy="-42" r="24" fill={c} stroke="#15173f" strokeWidth="3" /></g>
      ))}
    </svg>
  );
}

export default function HomeHero() {
  const [hero, setHero] = useState(null);

  useEffect(() => {
    fetch("/api/gallery").then((r) => r.json()).then((d) => setHero(d.hero)).catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fff3c9] via-[#fffbf3] to-[#e4e9ff]">
      {/* soft colour blobs and floating shapes */}
      <div className="blob -left-24 top-10 h-72 w-72 bg-[#8aa2ff]" aria-hidden="true" />
      <div className="blob right-0 top-40 h-80 w-80 bg-[#ffb3a8]" style={{ animationDelay: "-4s" }} aria-hidden="true" />
      <div className="blob bottom-0 left-1/3 h-60 w-60 bg-[#ffe08a]" style={{ animationDelay: "-7s" }} aria-hidden="true" />
      <svg className="spin-slow pointer-events-none absolute left-[46%] top-16 hidden h-10 w-10 text-coral md:block" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" /></svg>
      <svg className="bob pointer-events-none absolute bottom-24 left-[44%] hidden h-8 w-8 text-lilac md:block" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l10 18H2z" /></svg>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 md:grid-cols-[1.05fr_0.95fr] md:pb-28 md:pt-16">
        <div>
          <p className="sticker wiggle text-sm">🎓 Your +2 journey is complete!</p>
          <h1 className="mt-6 text-5xl md:text-6xl lg:text-[4.2rem]">
            Your future journey <span className="hl">starts here.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-700">
            From choosing the right course to finding a college that fits your goals, we help you understand your
            options and take the next step with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#journey" className="btn btn-accent whitespace-nowrap text-lg">
              Explore Your Journey <Icon name="arrow" className="h-5 w-5" />
            </a>
            <Link href="/rank-guidance" className="btn btn-outline text-lg">Check Your Rank</Link>
          </div>
          <ul className="mt-9 flex flex-wrap gap-3 text-sm font-semibold">
            <li className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-2 ring-[color:var(--line)]"><span className="h-2.5 w-2.5 rounded-full bg-mint" />Verified cutoff data</li>
            <li className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-2 ring-[color:var(--line)]"><span className="h-2.5 w-2.5 rounded-full bg-coral" />Honest guidance</li>
            <li className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-2 ring-[color:var(--line)]"><span className="h-2.5 w-2.5 rounded-full bg-lilac" />Free counselling request</li>
          </ul>
        </div>

        <div className="relative">
          <div className="relative aspect-[5/6] rotate-2 overflow-hidden rounded-[2.2rem] border-4 border-ink bg-brand shadow-[10px_10px_0_var(--ink)] md:aspect-[4/5]">
            {hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero.url} alt={hero.caption || "Students beginning their next chapter"} className="h-full w-full object-cover" />
            ) : (
              <CampusArt />
            )}
          </div>
          <p className="sticker bob absolute -right-3 top-5 rotate-6 text-xs md:-right-5 md:text-sm">AP &amp; TS EAPCET</p>
          <p className="bob d2 absolute -bottom-5 -left-3 -rotate-3 rounded-2xl border-2 border-ink bg-coral px-5 py-3 text-lg font-extrabold text-white shadow-[4px_4px_0_var(--ink)] md:-left-6" style={{ fontFamily: "var(--font-display)" }}>
            Dream · Plan · Achieve
          </p>
          <span className="bob d3 absolute -left-6 top-1/3 hidden h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink bg-accent text-ink shadow-[4px_4px_0_var(--ink)] md:flex" aria-hidden="true">
            <Icon name="cap" className="h-8 w-8" />
          </span>
        </div>
      </div>
    </section>
  );
}
