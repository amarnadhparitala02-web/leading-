"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icons";
import RankPanel from "@/components/home/RankPanel";
import { useSettings } from "@/components/SettingsProvider";

// Deep navy hero with the rank checker beside the headline. When a real photo is uploaded in the
// admin Photos tab (slot: Homepage hero), it becomes the hero background under a navy overlay.
export default function HomeHero() {
  const { settings } = useSettings();
  const [hero, setHero] = useState(null);

  useEffect(() => {
    fetch("/api/gallery").then((r) => r.json()).then((d) => setHero(d.hero)).catch(() => {});
  }, []);

  return (
    <section className="on-dark relative overflow-hidden bg-brand text-white">
      {hero && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hero.url} alt={hero.caption || ""} className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: hero
            ? "linear-gradient(100deg, rgba(11,31,75,0.95) 0%, rgba(11,31,75,0.82) 50%, rgba(11,31,75,0.55) 100%)"
            : "linear-gradient(120deg, #0b1f4b 0%, #10296a 55%, #1b4db3 130%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="eyebrow">{settings.hero.eyebrow}</p>
          <h1 className="mt-5 text-4xl leading-[1.08] md:text-6xl">
            {settings.hero.headline}{" "}
            {settings.hero.highlight && <span className="text-[#9fc0ff]">{settings.hero.highlight}</span>}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{settings.hero.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#journey" className="btn btn-accent whitespace-nowrap">
              Explore Your Journey <Icon name="arrow" className="h-4 w-4" />
            </a>
            <Link href="/colleges" className="btn btn-light">Browse Colleges</Link>
          </div>
          <ul className="mt-9 grid gap-3 text-sm text-white/85 sm:grid-cols-2">
            {["Verified cutoff data", "Honest, student-first guidance", "AP and Telangana colleges", "Free counselling request"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15"><Icon name="check" className="h-3.5 w-3.5" /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <RankPanel />
      </div>
    </section>
  );
}
