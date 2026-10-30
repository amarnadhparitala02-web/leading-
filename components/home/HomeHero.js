"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icons";

// Shown until a real photo is uploaded in the admin Photos tab (slot: Homepage hero).
// An original illustration, not a photo of any real college or person.
function CampusArt() {
  return (
    <svg viewBox="0 0 600 720" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="hsky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#cfe3c4" /><stop offset="0.6" stopColor="#eef5e6" /><stop offset="1" stopColor="#fbf6e6" /></linearGradient>
        <linearGradient id="hwall" x1="0" x2="1"><stop offset="0" stopColor="#fffaf0" /><stop offset="1" stopColor="#e3d9c4" /></linearGradient>
        <linearGradient id="hlawn" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7fb069" /><stop offset="1" stopColor="#3d7a4a" /></linearGradient>
      </defs>
      <rect width="600" height="720" fill="url(#hsky)" />
      <circle cx="450" cy="150" r="70" fill="#fff3c4" opacity="0.9" className="gleam" />
      <g className="drift" fill="#fff" opacity="0.85"><ellipse cx="130" cy="120" rx="70" ry="16" /><ellipse cx="180" cy="108" rx="44" ry="14" /><ellipse cx="420" cy="230" rx="60" ry="12" /></g>
      <path d="M0 470 C110 420 230 450 330 430 S520 400 600 440 V720 H0Z" fill="#a6c98f" opacity="0.8" />
      {/* main hall */}
      <rect x="110" y="380" width="380" height="230" fill="url(#hwall)" />
      <polygon points="92,384 300,300 508,384" fill="#c9bfa8" />
      <polygon points="120,380 300,316 480,380" fill="#efe6d2" />
      <rect x="270" y="236" width="60" height="90" fill="url(#hwall)" />
      <path d="M262 238 Q300 176 338 238Z" fill="#2f6b45" />
      <line x1="300" y1="178" x2="300" y2="150" stroke="#123d32" strokeWidth="3" />
      <polygon points="300,150 334,158 300,168" fill="#a5cf83" />
      {[130, 196, 372, 438].map((x) => <g key={x}><rect x={x} y="396" width="22" height="190" fill="#fffdf6" /><rect x={x - 3} y="390" width="28" height="8" fill="#efe6d2" /></g>)}
      <rect x="262" y="500" width="76" height="110" rx="3" fill="#123d32" />
      {[150, 212, 370, 432].map((x) => <rect key={x} className="gleam" x={x} y="430" width="18" height="30" rx="2" fill="#ffe8a8" />)}
      <rect x="80" y="610" width="440" height="10" fill="#e8dfcc" /><rect x="60" y="620" width="480" height="10" fill="#d9cfb8" />
      <rect x="0" y="630" width="600" height="90" fill="url(#hlawn)" />
      <polygon points="270,630 330,630 420,720 180,720" fill="#efe6d2" opacity="0.9" />
      {[[50, 640, 1], [550, 640, 1], [150, 665, 0.7], [455, 665, 0.7]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><rect x="-5" y="-26" width="10" height="40" fill="#6b4a2f" /><circle cx="0" cy="-58" r="32" fill="#2f7a47" /><circle cx="-22" cy="-40" r="22" fill="#3c8f55" /><circle cx="22" cy="-42" r="24" fill="#276b3e" /></g>
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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#eef4e8] to-background">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-[1.05fr_0.95fr] md:pb-24 md:pt-16">
        <div>
          <p className="eyebrow">Your +2 journey is complete</p>
          <h1 className="mt-4 text-4xl leading-[1.08] md:text-6xl">
            Your future journey <em className="font-semibold italic text-moss">starts here.</em>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-700">
            From choosing the right course to finding a college that fits your goals, we help you understand your
            options and take the next step with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#journey" className="btn btn-accent inline-flex items-center gap-2 whitespace-nowrap">
              Explore Your Journey <Icon name="arrow" className="h-4 w-4" />
            </a>
            <Link href="/rank-guidance" className="btn btn-outline">Check Your Rank</Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
            {["Verified cutoff data", "Honest, student-first guidance", "Free counselling request"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-moss" />{t}</li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="relative aspect-[5/6] overflow-hidden rounded-[2rem] bg-soft shadow-[0_30px_60px_rgba(18,61,50,0.18)] ring-1 ring-[color:var(--line)] md:aspect-[4/5]">
            {hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero.url} alt={hero.caption || "Students beginning their next chapter"} className="h-full w-full object-cover" />
            ) : (
              <CampusArt />
            )}
          </div>
          <p className="absolute -bottom-5 left-5 rotate-[-3deg] rounded-2xl bg-white px-5 py-3 font-serif text-xl italic text-brand shadow-lg" style={{ fontFamily: "var(--font-playfair)" }}>
            Dream · Plan · Achieve
          </p>
          <p className="absolute -right-2 top-6 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-brand shadow-md md:-right-4">
            AP &amp; TS EAPCET
          </p>
        </div>
      </div>
    </section>
  );
}
