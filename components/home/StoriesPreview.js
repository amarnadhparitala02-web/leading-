"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icons";

const accents = ["border-[#2a45e0]", "border-[#e8362a]", "border-[#0b7a66]"];

export function StoryCard({ s, i = 0 }) {
  return (
    <article className={`card flex h-full flex-col border-t-[6px] p-6 ${accents[i % 3]}`}>
      <span className="text-6xl leading-none text-coral" aria-hidden="true" style={{ fontFamily: "var(--font-display)" }}>&ldquo;</span>
      {s.quote && <blockquote className="-mt-3 text-lg font-medium text-slate-800">{s.quote}</blockquote>}
      {!s.quote && s.unsure && <p className="-mt-3 text-lg font-medium text-slate-800">{s.unsure}</p>}
      <footer className="mt-auto pt-5">
        <p className="font-extrabold text-brand">{s.displayName}</p>
        <p className="text-xs text-slate-500">{[s.stream, s.year].filter(Boolean).join(" · ")}</p>
        {s.outcome && <p className="mt-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink">{s.outcome}</p>}
      </footer>
    </article>
  );
}

// Only real, consented stories published by an admin appear here. None are invented.
export default function StoriesPreview() {
  const [stories, setStories] = useState(null);

  useEffect(() => {
    fetch("/api/stories?limit=3").then((r) => r.json()).then((d) => setStories(d.stories)).catch(() => setStories([]));
  }, []);

  return (
    <section className="bg-[#ffe1de]">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <p className="eyebrow !bg-white">Real stories</p>
        <h2 className="mt-4 max-w-3xl text-4xl md:text-6xl">Every student has a story. <span className="hl">Every journey has a beginning.</span></h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {stories === null ? (
            [0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-3xl bg-white/60" aria-hidden="true" />)
          ) : stories.length === 0 ? (
            <div className="rounded-[1.75rem] border-2 border-ink bg-white p-7 shadow-[5px_5px_0_var(--ink)] md:col-span-3">
              <p className="text-xl font-extrabold text-brand">Student stories are coming soon.</p>
              <p className="mt-1 text-slate-700">
                We only share a student&apos;s story with their permission. Check back soon to hear from students who have
                taken this journey.
              </p>
            </div>
          ) : (
            stories.map((s, i) => <StoryCard key={s.id} s={s} i={i} />)
          )}
        </div>

        {stories?.length > 0 && (
          <Link href="/stories" className="btn btn-accent mt-8">Read more stories <Icon name="arrow" className="h-4 w-4" /></Link>
        )}
      </div>
    </section>
  );
}
