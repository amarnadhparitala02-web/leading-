"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STREAMS } from "@/lib/site";

export default function Colleges() {
  const [colleges, setColleges] = useState(null);
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("");
  const [stream, setStream] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Signed-in admins get add/edit shortcuts. Everyone else sees the normal page.
  useEffect(() => {
    fetch("/api/admin/login").then((r) => (r.ok ? r.json() : null)).then((d) => setIsAdmin(d?.user?.role === "admin")).catch(() => {});
  }, []);

  useEffect(() => {
    const p = new URLSearchParams({ q, district, stream });
    const t = setTimeout(() => {
      fetch(`/api/colleges?${p}`).then((r) => r.json()).then((d) => setColleges(d.colleges));
    }, 200);
    return () => clearTimeout(t);
  }, [q, district, stream]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Colleges</h1>
      <p className="mt-2 text-slate-600">Search colleges offering B.Tech and Agriculture programmes.</p>

      {isAdmin && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-brand bg-white/50 p-3 text-sm">
          <span className="font-semibold">Admin</span>
          <Link href="/admin?tab=colleges&new=1" className="btn btn-accent !py-1.5 text-sm">Add college</Link>
          <Link href="/admin?tab=colleges" className="underline">Manage all colleges and import a list</Link>
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by college name" className="input" />
        <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District (e.g. Hyderabad)" className="input" />
        <select value={stream} onChange={(e) => setStream(e.target.value)} className="input">
          <option value="">All streams</option>
          {Object.entries(STREAMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {colleges === null ? (
        <p className="mt-8 text-slate-500">Loading...</p>
      ) : colleges.length === 0 ? (
        <p className="mt-8 glass-card p-6 text-slate-600">
          No colleges to show yet. Verified college listings will appear here as they are added.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {colleges.map((c) => (
            <div key={c.id} className="relative overflow-hidden glass-card hover:shadow">
            {isAdmin && (
              <Link href={`/admin?tab=colleges&edit=${c.id}`} className="absolute right-2 top-2 z-10 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow">
                Edit
              </Link>
            )}
            <Link href={`/colleges/${c.id}`} className="block">
              {c.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.cover} alt={c.name} loading="lazy" className="h-40 w-full object-cover" />
              )}
              <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold">{c.name}</p>
                {c.partner && <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Partner</span>}
              </div>
              <p className="text-sm text-slate-600">{c.district}</p>
              <p className="mt-2 text-xs text-slate-500">{c.courses.slice(0, 4).map((x) => x.name).join(" · ")}</p>
              </div>
            </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
