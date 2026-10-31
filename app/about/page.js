"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CountUp from "@/components/about/CountUp";
import WordSwap from "@/components/about/WordSwap";
import Gallery from "@/components/Gallery";
import Icon from "@/components/Icons";
import Reveal from "@/components/Reveal";
import { useSettings } from "@/components/SettingsProvider";
import { youtubeId } from "@/lib/settings";

const what = [
  ["chart", "Rank-based guidance", "Colleges that may fit your EAPCET rank, using verified cutoffs."],
  ["chat", "One-to-one counselling", "Time for students and parents to ask every question."],
  ["building", "Web counselling support", "Help with web options and choosing the order of colleges."],
  ["doc", "Admission help", "Certificate verification and the steps through to joining."],
];

const values = [
  ["shield", "Honest guidance", "We tell you what a college offers and what it does not. We never promise a seat."],
  ["chart", "Verified information", "Cutoffs and fees are shown with their year and source."],
  ["cap", "Student first", "The right course and college for your goals, not the most expensive one."],
];

// Text, years, videos and documents come from Admin > Site settings > About page. Photos come from Media.
// The partner college list follows the colleges marked as partners in Admin > Colleges.
export default function About() {
  const { settings: s } = useSettings();
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    fetch("/api/colleges")
      .then((r) => r.json())
      .then((d) => setColleges(d.colleges || []))
      .catch(() => {});
  }, []);

  const partners = colleges.filter((c) => c.partner);
  // The strip lists real colleges only; demo entries are left out.
  const strip = colleges.filter((c) => !/^demo\b/i.test(c.name));
  const states = [...new Set(strip.map((c) => c.state).filter(Boolean))];

  const years = s.about.years;
  const paragraphs = s.about.intro.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const intro = paragraphs.length
    ? paragraphs
    : [
        `For ${years} years, ${s.name} has guided students and parents through one of the biggest decisions after +2: which course, and which college.`,
        `Over that time we have built relationships with many colleges across India, including direct MOUs with partner colleges, and ${s.about.students} students have joined colleges through us. This helps us explain each college honestly, share verified information, and support families from the first question to the day of admission.`,
      ];

  return (
    <>
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #eaf2ff 0%, #f7faff 60%, #ffffff 100%)" }}>
        <div className="drift absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#cfe0ff] opacity-60 blur-3xl" aria-hidden="true" />
        <div className="drift-slow absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-[#ffe1e1] opacity-60 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="eyebrow">About {s.short}</p>
            <h1 className="mt-3 text-4xl leading-tight md:text-6xl">
              Guiding students to the right{" "}
              <WordSwap words={["college", "course", "career", "future"]} className="text-moss" />
            </h1>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-700">
              {intro.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-accent">Talk to a counsellor</Link>
              <Link href="/colleges" className="btn btn-outline">Browse colleges</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-2xl bg-brand p-6 text-white shadow-lg">
              <p className="text-5xl font-extrabold leading-none md:text-6xl"><CountUp value={years} /></p>
              <p className="mt-2 font-semibold text-white/85">years guiding students</p>
            </div>
            <div className="card p-5">
              <p className="text-3xl font-extrabold text-brand"><CountUp value={s.about.students} /></p>
              <p className="mt-1 text-sm text-slate-600">students joined colleges across India</p>
            </div>
            <div className="card p-5">
              <p className="text-3xl font-extrabold text-brand">MOUs</p>
              <p className="mt-1 text-sm text-slate-600">with partner colleges</p>
            </div>
          </div>
        </div>
      </section>

      {strip.length > 0 && (
        <section className="border-y border-[color:var(--line)] bg-white py-5" aria-label="Colleges we guide students to">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
            Colleges across India{states.length > 1 ? ` · ${states.join(" · ")}` : ""}
          </p>
          <div className="marquee-wrap overflow-hidden">
            <ul className="marquee flex w-max gap-3 px-3">
              {[...strip, ...strip].map((c, i) => (
                <li key={i} aria-hidden={i >= strip.length} className="flex items-center gap-2 whitespace-nowrap rounded-full bg-soft px-4 py-2 text-sm font-medium text-brand">
                  <Icon name="building" className="h-4 w-4 text-moss" /> {c.name}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {partners.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <p className="eyebrow">Our partners</p>
          <h2 className="mt-3 text-2xl md:text-3xl">Colleges we have an MOU with</h2>
          <p className="mt-2 max-w-2xl text-slate-600">A direct MOU means we work with these colleges on admissions and can answer your questions about them.</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((c, i) => (
              <li key={c.id}>
                <Reveal delay={i * 80}>
                <Link href={`/colleges/${c.id}`} className="card flex h-full items-center gap-4 overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-md">
                  {c.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.cover} alt="" loading="lazy" className="h-24 w-28 shrink-0 object-cover" />
                  ) : (
                    <span className="flex h-24 w-28 shrink-0 items-center justify-center bg-soft text-moss"><Icon name="building" className="h-8 w-8" /></span>
                  )}
                  <span className="py-3 pr-4">
                    <span className="block font-bold leading-snug text-brand">{c.name}</span>
                    <span className="mt-1 block text-sm text-slate-600">{[c.district, c.state].filter(Boolean).join(", ")}</span>
                  </span>
                </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-soft">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl">What we do</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {what.map(([icon, t, d], i) => (
              <li key={t}><Reveal delay={i * 90} className="h-full"><div className="card h-full p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-soft text-moss"><Icon name={icon} className="h-5 w-5" /></span>
                <h3 className="mt-4 font-bold text-brand">{t}</h3>
                <p className="mt-1 text-sm text-slate-600">{d}</p>
              </div></Reveal></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl">How we work</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {values.map(([icon, t, d], i) => (
            <li key={t}><Reveal delay={i * 90} className="h-full"><div className="flex h-full gap-4 rounded-2xl border border-[color:var(--line)] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white"><Icon name={icon} className="h-5 w-5" /></span>
              <span>
                <span className="block font-bold text-brand">{t}</span>
                <span className="mt-1 block text-sm text-slate-600">{d}</span>
              </span>
            </div></Reveal></li>
          ))}
        </ul>
      </section>

      <Gallery title={`Life at ${s.short}`} featured />

      {s.about.videos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl">Watch</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {s.about.videos.map((v, i) => (
              <figure key={i}>
                <div className="aspect-video overflow-hidden rounded-xl bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId(v.url)}`}
                    title={v.title || "Video"}
                    loading="lazy"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
                {v.title && <figcaption className="mt-2 text-sm font-medium text-brand">{v.title}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {s.about.documents.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="text-2xl">Documents</h2>
          <ul className="mt-4 divide-y divide-[color:var(--line)] rounded-xl bg-white ring-1 ring-[color:var(--line)]">
            {s.about.documents.map((d, i) => (
              <li key={i}>
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 font-medium text-brand hover:bg-soft">
                  <Icon name="doc" className="h-5 w-5 text-moss" /> {d.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-brand py-12 text-center text-white">
        <p className="text-xl font-semibold">Have questions about your next step?</p>
        <p className="mt-1 text-white/75">Talk to a counsellor. It is free.</p>
        <Link href="/contact" className="btn btn-accent mt-5">Talk to us</Link>
      </section>
    </>
  );
}
