"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STREAMS } from "@/lib/site";

export default function Courses() {
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json()).then((d) => setCourses(d.courses));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Courses</h1>
      <p className="mt-2 text-slate-600">Programmes we currently guide students for.</p>

      {courses === null ? <p className="mt-8 text-slate-500">Loading...</p> : Object.entries(STREAMS).map(([key, label]) => (
        <section key={key} className="mt-8">
          <h2 className="text-xl font-bold">{label}</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {courses.filter((c) => c.stream === key).map((c) => (
              <div key={c.id} className="card p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-slate-500">{c.degree}</p>
                {c.eligibility && <p className="mt-2 text-sm text-slate-600">{c.eligibility}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
      <Link href="/rank-guidance" className="btn btn-accent mt-8">Check my rank</Link>
    </div>
  );
}
