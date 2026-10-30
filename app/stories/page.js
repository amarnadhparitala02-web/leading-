"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function Detail({ label, text }) {
  if (!text) return null;
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-moss">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-700">{text}</dd>
    </div>
  );
}

export default function Stories() {
  const [stories, setStories] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/stories").then((r) => r.json()).then((d) => setStories(d.stories)).catch(() => setFailed(true));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
      <p className="eyebrow">Real stories</p>
      <h1 className="mt-3 max-w-3xl text-4xl md:text-5xl">Every student has a story. Every journey has a beginning.</h1>
      <p className="mt-4 max-w-2xl text-slate-700">
        Hear from students about what they were unsure about after +2, and how they made their decision. We share a
        student&apos;s story only with their permission.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2" aria-live="polite">
        {failed ? (
          <p className="panel-soft p-6 md:col-span-2">We could not load stories just now. Please try again soon.</p>
        ) : stories === null ? (
          [0, 1].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-soft" aria-hidden="true" />)
        ) : stories.length === 0 ? (
          <div className="panel-soft p-8 md:col-span-2">
            <p className="text-lg font-semibold text-brand">Student stories are coming soon.</p>
            <p className="mt-2 text-slate-700">
              We never publish made-up testimonials. Each story here is told by a real student who has given permission.
            </p>
            <Link href="/contact" className="btn btn-accent mt-5">Start your own journey</Link>
          </div>
        ) : (
          stories.map((s) => (
            <article key={s.id} className="card p-7">
              <span className="text-5xl leading-none text-accent" aria-hidden="true" style={{ fontFamily: "var(--font-playfair)" }}>&ldquo;</span>
              {s.quote && <blockquote className="-mt-2 text-lg text-brand">{s.quote}</blockquote>}
              <p className="mt-4 font-bold text-brand">{s.displayName}</p>
              <p className="text-xs text-slate-500">{[s.stream, s.year].filter(Boolean).join(" · ")}</p>
              <dl className="mt-5 space-y-3 border-t border-[color:var(--line)] pt-5">
                <Detail label="Unsure about" text={s.unsure} />
                <Detail label="Options explored" text={s.explored} />
                <Detail label="How we helped" text={s.support} />
                <Detail label="Outcome" text={s.outcome} />
              </dl>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
