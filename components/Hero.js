"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { STREAMS } from "@/lib/site";

// An original, illustrated campus (not a photo of any real college), drawn in layers so the
// layers can move at different speeds with the mouse and give the scene depth.

function Clouds() {
  return (
    <svg viewBox="0 0 1440 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><filter id="soft"><feGaussianBlur stdDeviation="7" /></filter></defs>
      <g className="cloud" filter="url(#soft)" fill="#fff" opacity="0.5">
        <ellipse cx="240" cy="150" rx="130" ry="24" /><ellipse cx="320" cy="132" rx="84" ry="22" /><ellipse cx="170" cy="138" rx="70" ry="18" />
      </g>
      <g className="cloud slow" filter="url(#soft)" fill="#fff" opacity="0.42">
        <ellipse cx="980" cy="110" rx="150" ry="26" /><ellipse cx="1060" cy="92" rx="90" ry="22" /><ellipse cx="900" cy="100" rx="70" ry="18" />
      </g>
      <g className="cloud" filter="url(#soft)" fill="#fff" opacity="0.35">
        <ellipse cx="640" cy="215" rx="110" ry="18" /><ellipse cx="700" cy="202" rx="70" ry="16" />
      </g>
    </svg>
  );
}

function Skyline() {
  const blocks = [[0, 80, 520], [90, 60, 480], [160, 90, 500], [270, 70, 455], [350, 110, 505], [470, 60, 470], [1000, 90, 480], [1100, 70, 505], [1180, 100, 462], [1290, 80, 490], [1380, 80, 470]];
  return (
    <svg viewBox="0 0 1440 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0 560 C 200 500 360 540 560 520 S 900 480 1100 520 S 1340 500 1440 530 V700 H0Z" fill="rgba(10,58,117,0.38)" />
      {blocks.map(([x, w, y], i) => <rect key={i} x={x} y={y} width={w} height={640 - y} fill="rgba(8,47,102,0.5)" />)}
    </svg>
  );
}

function Building() {
  const winRows = [462, 520];
  const leftX = [275, 325, 375, 425];
  const rightX = [965, 1015, 1065, 1115];
  const cols = [558, 628, 788, 858];
  return (
    <svg viewBox="0 0 1440 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="wall" x1="0" x2="1"><stop offset="0" stopColor="#fbf6ec" /><stop offset="1" stopColor="#d9cfbc" /></linearGradient>
        <linearGradient id="roof" x1="0" x2="1"><stop offset="0" stopColor="#f3ebdc" /><stop offset="1" stopColor="#cbbfa8" /></linearGradient>
        <linearGradient id="door" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0d4f9a" /><stop offset="1" stopColor="#082f66" /></linearGradient>
        <radialGradient id="lit" cx="0.5" cy="0.9" r="0.9"><stop offset="0" stopColor="#ffe9b0" /><stop offset="1" stopColor="#ffbf5e" /></radialGradient>
      </defs>
      <g transform="translate(120 0)">
      {/* clock tower and dome sit behind the hall */}
      <rect x="690" y="215" width="60" height="120" fill="url(#wall)" />
      <path d="M680 217 Q720 148 760 217Z" fill="#c4d3e8" />
      <line x1="720" y1="150" x2="720" y2="116" stroke="#8fa3c0" strokeWidth="3" />
      <polygon className="flag" points="720,118 762,128 720,140" fill="#e0281d" />
      <circle cx="720" cy="258" r="15" fill="#fff" stroke="#8fa3c0" strokeWidth="3" />
      <path d="M720 258 V248 M720 258 L728 262" stroke="#1b2438" strokeWidth="2" strokeLinecap="round" />
      {/* wings */}
      <rect x="250" y="440" width="250" height="170" fill="url(#wall)" />
      <rect x="940" y="440" width="250" height="170" fill="url(#wall)" />
      <rect x="240" y="430" width="270" height="14" fill="url(#roof)" />
      <rect x="930" y="430" width="270" height="14" fill="url(#roof)" />
      {winRows.map((y) => leftX.map((x) => <rect key={`l${x}${y}`} className="win" x={x} y={y} width="26" height="38" rx="3" fill="url(#lit)" />))}
      {winRows.map((y) => rightX.map((x) => <rect key={`r${x}${y}`} className="win" x={x} y={y} width="26" height="38" rx="3" fill="url(#lit)" />))}
      {/* main hall */}
      <rect x="500" y="385" width="440" height="225" fill="url(#wall)" />
      <polygon points="476,388 720,298 964,388" fill="url(#roof)" />
      <polygon points="520,384 720,314 920,384" fill="none" stroke="#b9ab92" strokeWidth="2" />
      <circle cx="720" cy="352" r="12" fill="#0d4f9a" opacity="0.85" />
      {cols.map((x) => (
        <g key={x}>
          <rect x={x} y="404" width="24" height="186" fill="#fffaf0" />
          <rect x={x + 18} y="404" width="6" height="186" fill="#d6ccb8" />
          <rect x={x - 4} y="398" width="32" height="8" fill="#efe6d4" />
          <rect x={x - 4} y="588" width="32" height="8" fill="#efe6d4" />
        </g>
      ))}
      <rect x="682" y="500" width="76" height="110" rx="3" fill="url(#door)" />
      <rect className="win" x="690" y="508" width="28" height="44" rx="2" fill="url(#lit)" opacity="0.9" />
      <rect className="win" x="722" y="508" width="28" height="44" rx="2" fill="url(#lit)" opacity="0.9" />
      {/* steps */}
      <rect x="470" y="610" width="500" height="10" fill="#e8dfcc" />
      <rect x="452" y="620" width="536" height="10" fill="#ddd2bc" />
      <rect x="434" y="630" width="572" height="10" fill="#cfc3aa" />
      </g>
    </svg>
  );
}

function Tree({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y="-30" width="10" height="46" fill="#5b3b24" />
      <circle cx="0" cy="-70" r="38" fill="#1f6b3a" />
      <circle cx="-26" cy="-48" r="28" fill="#2a8449" />
      <circle cx="26" cy="-50" r="30" fill="#1a5c31" />
      <circle cx="-8" cy="-86" r="20" fill="#35a05a" opacity="0.8" />
    </g>
  );
}

function Foreground() {
  return (
    <svg viewBox="0 0 1440 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><linearGradient id="lawn" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2f8a4c" /><stop offset="1" stopColor="#174d2b" /></linearGradient></defs>
      <rect x="0" y="640" width="1440" height="80" fill="url(#lawn)" />
      <polygon points="810,640 870,640 1020,720 660,720" fill="#eadfc9" opacity="0.92" />
      <Tree x={120} y={650} s={1.05} /><Tree x={235} y={660} s={0.8} />
      <Tree x={1215} y={660} s={0.8} /><Tree x={1330} y={650} s={1.1} />
      <Tree x={20} y={690} s={1.5} /><Tree x={1425} y={690} s={1.5} />
    </svg>
  );
}

function QuickRank() {
  const router = useRouter();
  const [stream, setStream] = useState("btech");
  const [rank, setRank] = useState("");

  function go(e) {
    e.preventDefault();
    const q = new URLSearchParams({ stream });
    if (rank) q.set("rank", rank);
    router.push(`/rank-guidance?${q}`);
  }

  return (
    <form onSubmit={go} className="glass-dark relative rounded-3xl p-6 md:p-7">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Quick rank check</p>
      <h2 className="mt-1 text-xl font-bold">See colleges within your reach</h2>
      <div className="mt-4 grid gap-3">
        <select value={stream} onChange={(e) => setStream(e.target.value)} className="input" aria-label="Stream">
          {Object.entries(STREAMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={rank} onChange={(e) => setRank(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Your EAPCET rank" className="input" aria-label="EAPCET rank" />
        <button className="btn btn-accent">Show potential colleges</button>
      </div>
      <p className="mt-3 text-xs text-white/60">Based on historical cutoffs. Never a guarantee of admission.</p>
    </form>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const frame = useRef(0);

  // Mouse position drives the parallax layers (CSS variables, one animation frame at a time).
  function onMove(e) {
    if (e.pointerType === "touch") return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.style.setProperty("--mx", ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
      el.style.setProperty("--my", ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
    });
  }

  return (
    <section ref={ref} onPointerMove={onMove} className="hero relative isolate overflow-hidden text-white">
      <div className="hero-sky" aria-hidden="true" />
      <div className="hero-layer" style={{ "--k": 5 }} aria-hidden="true"><Clouds /></div>
      <div className="hero-layer" style={{ "--k": 9 }} aria-hidden="true"><Skyline /></div>
      <div className="hero-layer" style={{ "--k": 16 }} aria-hidden="true"><Building /></div>
      <div className="hero-layer" style={{ "--k": 28 }} aria-hidden="true"><Foreground /></div>
      <div className="hero-shade" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="glass-dark inline-block rounded-full px-4 py-1.5 text-sm font-medium">
            Hyderabad · B.Tech &amp; Agriculture admissions
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] md:text-6xl">
            Find the college that fits{" "}
            <span className="bg-gradient-to-r from-[#ffd29a] to-[#ff7a6e] bg-clip-text text-transparent">your EAPCET rank.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-100/90">
            Check potential colleges from verified historical cutoffs, then get honest guidance from our counsellors.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/rank-guidance" className="btn btn-accent">Check My Rank</Link>
            <Link href="/colleges" className="btn btn-ghost">Explore Colleges</Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
            {["Verified cutoffs only", "No false promises", "Free counselling"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#7dffb0]" fill="currentColor" aria-hidden="true"><path d="M7.7 13.3 4.4 10l-1.4 1.4 4.7 4.7L17 6.8l-1.4-1.4z" /></svg>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          {/* the 3D cube echoes the logo; chips float at different depths */}
          <div className="cube-scene float d2 pointer-events-none absolute -top-24 right-2 z-20 hidden md:block" aria-hidden="true">
            <div className="cube" style={{ "--s": "96px" }}>
              <div className="f side front" /><div className="f side back" /><div className="f side left" /><div className="f side right" />
              <div className="f top" /><div className="f base" />
            </div>
          </div>
          <div className="glass-dark float pointer-events-none absolute -left-10 -top-6 z-20 hidden rounded-full px-4 py-2 text-xs font-semibold lg:block" aria-hidden="true">B.Tech</div>
          <div className="glass-dark float d3 pointer-events-none absolute -bottom-8 -right-4 z-20 hidden rounded-full px-4 py-2 text-xs font-semibold lg:block" aria-hidden="true">Agriculture</div>
          <QuickRank />
        </div>
      </div>
    </section>
  );
}
