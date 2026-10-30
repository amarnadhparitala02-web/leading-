"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CollegeCard from "@/components/CollegeCard";
import { getCompare } from "@/lib/compare";
import { STATES, STREAMS } from "@/lib/site";

export default function Colleges() {
  const [colleges, setColleges] = useState(null);
  const [courses, setCourses] = useState([]);
  const [failed, setFailed] = useState(false);
  const [f, setF] = useState({ q: "", state: "", district: "", stream: "", course: "" });
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [picked, setPicked] = useState(0);

  // Open with filters from the link (the homepage passes ?state=, ?course= and ?stream=).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setF((x) => ({ ...x, q: q.get("q") || "", state: q.get("state") || "", district: q.get("district") || "", stream: q.get("stream") || "", course: q.get("course") || "" }));
    setReady(true);
    fetch("/api/courses").then((r) => r.json()).then((d) => setCourses(d.courses)).catch(() => {});
    fetch("/api/admin/login").then((r) => (r.ok ? r.json() : null)).then((d) => setIsAdmin(d?.user?.role === "admin")).catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready) return;
    setFailed(false);
    const t = setTimeout(() => {
      setColleges(null);
      fetch(`/api/colleges?${new URLSearchParams(f)}`)
        .then((r) => r.json())
        .then((d) => setColleges(d.colleges))
        .catch(() => setFailed(true));
    }, 200);
    return () => clearTimeout(t);
  }, [f, ready]);

  useEffect(() => {
    const sync = () => setPicked(getCompare().length);
    sync();
    window.addEventListener("ll-compare", sync);
    return () => window.removeEventListener("ll-compare", sync);
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const visibleCourses = courses.filter((c) => !f.stream || c.stream === f.stream);
  const filtered = Object.values(f).some(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 pb-28 md:py-16">
      <p className="eyebrow">Discover colleges</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Find a college that fits</h1>
      <p className="mt-3 max-w-2xl text-slate-700">
        Search colleges across Andhra Pradesh and Telangana. We show only verified details, with the year and source of any cutoff.
      </p>

      {isAdmin && (
        <div className="panel-soft mt-5 flex flex-wrap items-center gap-3 border border-dashed border-moss p-3 text-sm">
          <span className="font-semibold">Admin</span>
          <Link href="/admin?tab=colleges&new=1" className="btn btn-accent !py-1.5 text-sm">Add college</Link>
          <Link href="/admin?tab=colleges" className="underline">Manage all colleges and import a list</Link>
        </div>
      )}

      <form role="search" aria-label="Filter colleges" onSubmit={(e) => e.preventDefault()} className="card mt-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm lg:col-span-2">
          <span className="mb-1 block font-medium text-brand">College name</span>
          <input value={f.q} onChange={set("q")} placeholder="Search by name" className="input" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-brand">State</span>
          <select value={f.state} onChange={set("state")} className="input"><option value="">All states</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-brand">Stream</span>
          <select value={f.stream} onChange={(e) => setF({ ...f, stream: e.target.value, course: "" })} className="input">
            <option value="">All streams</option>{Object.entries(STREAMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-brand">Course / branch</span>
          <select value={f.course} onChange={set("course")} className="input"><option value="">All courses</option>{visibleCourses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </label>
        <label className="text-sm sm:col-span-2 lg:col-span-2">
          <span className="mb-1 block font-medium text-brand">District</span>
          <input value={f.district} onChange={set("district")} placeholder="e.g. Hyderabad" className="input" />
        </label>
        {filtered && (
          <div className="flex items-end">
            <button type="button" onClick={() => setF({ q: "", state: "", district: "", stream: "", course: "" })} className="text-sm font-semibold text-moss underline">Clear filters</button>
          </div>
        )}
      </form>

      <div className="mt-8" aria-live="polite">
        {failed ? (
          <p className="panel-soft p-6">We could not load colleges just now. Please check your connection and try again.</p>
        ) : colleges === null ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-soft" aria-hidden="true" />)}</div>
        ) : colleges.length === 0 ? (
          <div className="panel-soft p-8">
            <p className="font-semibold text-brand">{filtered ? "No colleges match these filters." : "No colleges to show yet."}</p>
            <p className="mt-1 text-slate-700">
              {filtered ? "Try removing a filter. " : "Verified college listings will appear here as they are added. "}
              A counsellor can also suggest options for you.
            </p>
            <Link href="/contact" className="btn btn-accent mt-4">Request counselling</Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600">{colleges.length} {colleges.length === 1 ? "college" : "colleges"}</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {colleges.map((c) => (
                <div key={c.id} className="relative">
                  {isAdmin && (
                    <Link href={`/admin?tab=colleges&edit=${c.id}`} className="absolute right-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow">Edit</Link>
                  )}
                  <CollegeCard college={c} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {picked > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--line)] bg-white/95 p-3 shadow-[0_-8px_30px_rgba(18,61,50,0.12)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-1">
            <p className="text-sm font-semibold text-brand">{picked} of 3 selected to compare</p>
            <Link href="/colleges/compare" className="btn btn-accent !py-2 text-sm">Compare now</Link>
          </div>
        </div>
      )}
    </div>
  );
}
