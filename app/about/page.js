"use client";

import Link from "next/link";
import Gallery from "@/components/Gallery";
import Icon from "@/components/Icons";
import { useSettings } from "@/components/SettingsProvider";
import { youtubeId } from "@/lib/settings";

const what = [
  ["chart", "Rank-based guidance", "Colleges that may fit your EAPCET rank, using verified cutoffs."],
  ["chat", "One-to-one counselling", "Time for students and parents to ask every question."],
  ["building", "Web counselling support", "Help with web options and choosing the order of colleges."],
  ["doc", "Admission help", "Certificate verification and the steps through to joining."],
];

// Text, videos and documents come from Admin > Site settings > About page. Photos come from Media.
export default function About() {
  const { settings: s } = useSettings();
  const paragraphs = s.about.intro.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const intro = paragraphs.length
    ? paragraphs
    : [`${s.name} is an education consultancy based in ${s.city}. We help students and parents understand B.Tech and Agriculture options, compare colleges using verified historical cutoff data, and complete admission with confidence.`];

  return (
    <>
      <section style={{ background: "linear-gradient(160deg, #eaf2ff 0%, #ffffff 100%)" }}>
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
          <p className="eyebrow">About us</p>
          <h1 className="mt-3 text-3xl md:text-5xl">About {s.short}</h1>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-700">
            {intro.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl">What we do</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {what.map(([icon, t, d]) => (
            <li key={t} className="card p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-soft text-moss"><Icon name={icon} className="h-5 w-5" /></span>
              <h3 className="mt-4 font-bold text-brand">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <Gallery title="Life at Leading Light" />

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

      <section className="bg-soft py-12 text-center">
        <p className="text-lg font-semibold text-brand">Have questions about your next step?</p>
        <Link href="/contact" className="btn btn-accent mt-4">Talk to us</Link>
      </section>
    </>
  );
}
