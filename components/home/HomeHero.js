"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icons";
import RankPanel from "@/components/home/RankPanel";
import { useSettings } from "@/components/SettingsProvider";

// Light, friendly hero: pale sky background, big headline, the rank checker beside it. When a real photo is
// uploaded in the admin Media tab (slot: Homepage hero) it fades in on the right behind the form.
export default function HomeHero() {
  const { settings } = useSettings();
  const [hero, setHero] = useState(null);

  useEffect(() => {
    fetch("/api/gallery").then((r) => r.json()).then((d) => setHero(d.hero)).catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #eaf2ff 0%, #f7faff 55%, #ffffff 100%)" }}>
      {hero && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hero.url} alt={hero.caption || ""} className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-25 lg:block" />
      )}
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#cfe0ff] opacity-60 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-[#ffe1e1] opacity-60 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-moss shadow-sm ring-1 ring-[color:var(--line)]">
            <span className="h-2 w-2 rounded-full bg-coral" /> {settings.hero.eyebrow}
          </p>
          <h1 className="mt-5 text-4xl leading-[1.1] md:text-6xl">
            {settings.hero.headline}{" "}
            {settings.hero.highlight && <span className="text-moss">{settings.hero.highlight}</span>}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">{settings.hero.text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/rank-guidance" className="btn btn-accent whitespace-nowrap">
              Check my rank <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link href="/colleges" className="btn btn-outline">Browse colleges</Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2 text-sm text-slate-700">
            {["Verified cutoffs", "AP and Telangana colleges", "Free counselling"].map((t) => (
              <li key={t} className="flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 shadow-sm ring-1 ring-[color:var(--line)]">
                <Icon name="check" className="h-3.5 w-3.5 text-moss" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <RankPanel />
      </div>
    </section>
  );
}
