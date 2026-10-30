"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icons";

export function StoryCard({ s }) {
  return (
    <article className="card flex h-full flex-col border-l-4 border-l-moss p-6">
      <span className="text-5xl font-bold leading-none text-[#c3d3f0]" aria-hidden="true">&ldquo;</span>
      {s.quote && <blockquote className="-mt-2 text-base font-medium leading-relaxed text-slate-800">{s.quote}</blockquote>}
      {!s.quote && s.unsure && <p className="-mt-2 text-base font-medium leading-relaxed text-slate-800">{s.unsure}</p>}
      <footer className="mt-auto pt-5">
        <p className="font-bold text-brand">{s.displayName}</p>
        <p className="text-xs text-slate-500">{[s.stream, s.year].filter(Boolean).join(" · ")}</p>
        {s.outcome && <p className="mt-2 inline-block rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-brand">{s.outcome}</p>}
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
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <p className="eyebrow">Real stories</p>
      <h2 className="mt-4 max-w-3xl text-3xl md:text-5xl">Every student has a story. Every journey has a beginning.</h2>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {stories === null ? (
          [0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-soft" aria-hidden="true" />)
        ) : stories.length === 0 ? (
          <div className="panel-soft p-7 md:col-span-3">
            <p className="text-lg font-bold text-brand">Student stories are coming soon.</p>
            <p className="mt-1 text-slate-600">
              We only share a student&apos;s story with their permission. Check back soon to hear from students who have
              taken this journey.
            </p>
          </div>
        ) : (
          stories.map((s) => <StoryCard key={s.id} s={s} />)
        )}
      </div>

      {stories?.length > 0 && (
        <Link href="/stories" className="btn btn-outline mt-8">Read more stories <Icon name="arrow" className="h-4 w-4" /></Link>
      )}
    </section>
  );
}
