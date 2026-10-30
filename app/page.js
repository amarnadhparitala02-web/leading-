import Link from "next/link";
import FeaturedColleges from "@/components/FeaturedColleges";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import Tilt from "@/components/Tilt";

const steps = [
  ["Enter your rank", "Tell us your EAPCET rank, stream and category."],
  ["See potential colleges", "Based on verified historical cutoffs, with the year and round shown."],
  ["Talk to a counsellor", "Get one-to-one help with options, web counselling and admission."],
];

const iconProps = { viewBox: "0 0 24 24", className: "h-7 w-7", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
const services = [
  ["B.Tech guidance", "Branches, colleges and counselling support for engineering aspirants.",
    <svg key="a" {...iconProps}><path d="M3 9l9-5 9 5-9 5-9-5z" /><path d="M7 12v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4" /></svg>],
  ["Agriculture guidance", "Agriculture and allied programmes, with the right admission process.",
    <svg key="b" {...iconProps}><path d="M12 21V9" /><path d="M12 13c-4 0-6-2-6-6 4 0 6 2 6 6z" /><path d="M12 16c4 0 6-2 6-6-4 0-6 2-6 6z" /></svg>],
  ["College references", "Direct references and verified partner colleges, shown only where authorised.",
    <svg key="c" {...iconProps}><path d="M3 21h18" /><path d="M5 21V10l7-5 7 5v11" /><path d="M9 21v-6h6v6" /></svg>],
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">How it works</p>
          <h2 className="mt-1 text-3xl font-extrabold">Three steps to a confident choice</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3" style={{ perspective: "1200px" }}>
          {steps.map(([t, d], i) => (
            <Reveal key={t} delay={i * 120}>
              <Tilt className="glass-card h-full p-6">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f23a2d] to-[#c8190f] text-xl font-extrabold text-white shadow-lg"
                  style={{ transform: "translateZ(40px)" }}
                >
                  {i + 1}
                </span>
                <p className="mt-4 text-lg font-bold" style={{ transform: "translateZ(24px)" }}>{t}</p>
                <p className="mt-1 text-sm text-slate-600">{d}</p>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">What we help with</p>
          <h2 className="mt-1 text-3xl font-extrabold">Guidance for every path</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3" style={{ perspective: "1200px" }}>
          {services.map(([t, d, icon], i) => (
            <Reveal key={t} delay={i * 120}>
              <Tilt className="glass-card h-full p-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1566c4] to-[#0a3a75] text-white shadow-lg" style={{ transform: "translateZ(40px)" }}>
                  {icon}
                </span>
                <p className="mt-4 text-lg font-bold" style={{ transform: "translateZ(24px)" }}>{t}</p>
                <p className="mt-1 text-sm text-slate-600">{d}</p>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      <FeaturedColleges />
      <Gallery />

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d4f9a] to-[#082f66] p-8 text-white shadow-2xl md:flex md:items-center md:justify-between md:p-10">
            <div className="blob -right-10 -top-16 h-56 w-56 bg-[#e0281d]" aria-hidden="true" />
            <div className="blob -bottom-20 left-1/3 h-48 w-48 bg-[#4a93e0]" aria-hidden="true" />
            <div className="relative">
              <p className="text-2xl font-extrabold">Not sure where to start?</p>
              <p className="mt-1 text-slate-100/90">Request a free counselling call with our Hyderabad team.</p>
            </div>
            <Link href="/contact" className="btn btn-accent relative mt-5 md:mt-0">Request Counselling</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
