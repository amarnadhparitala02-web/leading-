"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icons";

export function StoryCard({ s }) {
  return (
    <article className="card flex h-full flex-col p-6">
      <span className="font-serif text-5xl leading-none text-accent" aria-hidden="true" style={{ fontFamily: "var(--font-playfair)" }}>&ldquo;</span>
      {s.quote && <blockquote className="-mt-2 text-slate-700">{s.quote}</blockquote>}
      {!s.quote && s.unsure && <p className="-mt-2 text-slate-700">{s.unsure}</p>}
      <footer className="mt-auto pt-5">
        <p className="font-bold text-brand">{s.displayName}</p>
        <p className="text-xs text-slate-500">{[s.stream, s.year].filter(Boolean).join(" · ")}</p>
        {s.outcome && <p className="mt-2 inline-block rounded-full bg-soft px-3 py-1 text-xs font-semibold text-brand">{s.outcome}</p>}
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
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <p className="eyebrow">Real stories</p>
      <h2 className="mt-3 max-w-2xl text-3xl md:text-5xl">Every student has a story. Every journey has a beginning.</h2>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {stories === null ? (
          [0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-soft" aria-hidden="true" />)
        ) : stories.length === 0 ? (
          <div className="panel-soft p-6 md:col-span-3">
            <p className="font-semibold text-brand">Student stories are coming soon.</p>
            <p className="mt-1 text-sm text-slate-700">
              We only share a student&apos;s story with their permission. Check back soon to hear from students who have
              taken this journey.
            </p>
          </div>
        ) : (
          stories.map((s) => <StoryCard key={s.id} s={s} />)
        )}
      </div>

      {stories?.length > 0 && (
        <Link href="/stories" className="btn btn-accent mt-8 inline-flex items-center gap-2">Read more stories <Icon name="arrow" className="h-4 w-4" /></Link>
      )}
    </section>
  );
}
