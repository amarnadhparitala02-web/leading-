"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CollegeCard from "@/components/CollegeCard";
import Icon from "@/components/Icons";
import { STATES } from "@/lib/site";

export default function DiscoverColleges() {
  const [state, setState] = useState("");
  const [course, setCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [colleges, setColleges] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json()).then((d) => setCourses(d.courses)).catch(() => {});
  }, []);

  useEffect(() => {
    setColleges(null);
    setFailed(false);
    const q = new URLSearchParams({ state, course, limit: "3" });
    fetch(`/api/colleges?${q}`)
      .then((r) => r.json())
      .then((d) => setColleges(d.colleges))
      .catch(() => setFailed(true));
  }, [state, course]);

  const more = new URLSearchParams({ state, course }).toString();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Discover colleges</p>
          <h2 className="mt-3 text-3xl md:text-4xl">Find a college that fits</h2>
          <p className="mt-1 text-sm text-slate-600">Explore colleges across Andhra Pradesh and Telangana by course, location and cutoff.</p>
        </div>
        <Link href={`/colleges?${more}`} className="inline-flex items-center gap-1 text-sm font-semibold text-moss">
          View all colleges <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-brand">State</span>
          <select value={state} onChange={(e) => setState(e.target.value)} className="input">
            <option value="">All states</option>
            {STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-brand">Course</span>
          <select value={course} onChange={(e) => setCourse(e.target.value)} className="input">
            <option value="">All courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3" aria-live="polite">
        {failed ? (
          <p className="panel-soft p-5 text-sm text-slate-700 md:col-span-3">We could not load colleges just now. Please try again in a moment.</p>
        ) : colleges === null ? (
          [0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-white" aria-hidden="true" />)
        ) : colleges.length === 0 ? (
          <p className="panel-soft p-5 text-sm text-slate-700 md:col-span-3">
            No verified colleges match yet. We only list colleges once their details are verified. Try another filter, or ask a counsellor.
          </p>
        ) : (
          colleges.map((c) => <CollegeCard key={c.id} college={c} showCompare={false} />)
        )}
      </div>
    </div>
  );
}
