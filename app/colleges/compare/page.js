"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCompare, setCompare } from "@/lib/compare";

const rank = (n) => n.toLocaleString("en-IN");

export default function Compare() {
  const [ids, setIds] = useState(null);
  const [colleges, setColleges] = useState(null);
  const [failed, setFailed] = useState(false);

  // Start from the colleges ticked on the list, or from ?ids= when a link is shared.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("ids");
    setIds(fromUrl ? fromUrl.split(",").filter(Boolean).slice(0, 3) : getCompare());
  }, []);

  useEffect(() => {
    if (ids === null) return;
    if (ids.length === 0) return setColleges([]);
    setColleges(null);
    fetch(`/api/colleges/compare?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => setColleges(d.colleges))
      .catch(() => setFailed(true));
  }, [ids]);

  function remove(id) {
    const next = (ids || []).filter((x) => x !== id);
    setIds(next);
    setCompare(next);
  }

  const rows = [
    ["Location", (c) => [c.district, c.state].filter(Boolean).join(", ") || "Not added yet"],
    ["Courses and branches", (c) => c.courses.length ? c.courses.map((x) => x.name).join(", ") : "Not added yet"],
    ["Fees", (c) => c.feeNote ? `${c.feeNote}${c.feeVerifiedOn ? ` (verified ${c.feeVerifiedOn})` : ""}` : "Not verified yet"],
    ["Facilities", (c) => c.facilities.length ? c.facilities.join(", ") : "Not confirmed yet"],
    ["Historical cutoffs", (c) => c.cutoffs.length ? c.cutoffs.map((x, i) => (
      <span key={i} className="mb-1 block">
        {x.course}: closing rank {rank(x.closingRank)}
        <span className="block text-xs text-slate-500">{x.exam} {x.year}, {x.round}, open category · Source: {x.source}{x.demo && " · DEMO"}</span>
      </span>
    )) : "No verified cutoffs yet"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
      <Link href="/colleges" className="text-sm font-semibold text-moss underline">← Back to colleges</Link>
      <h1 className="mt-3 text-4xl md:text-5xl">Compare colleges</h1>
      <p className="mt-3 max-w-2xl text-slate-700">Side by side, using verified details only. Past cutoffs do not guarantee admission.</p>

      <div className="mt-8" aria-live="polite">
        {failed ? (
          <p className="panel-soft p-6">We could not load the comparison. Please try again.</p>
        ) : colleges === null ? (
          <div className="h-56 animate-pulse rounded-2xl bg-soft" aria-hidden="true" />
        ) : colleges.length === 0 ? (
          <div className="panel-soft p-8">
            <p className="font-semibold text-brand">No colleges selected yet.</p>
            <p className="mt-1 text-slate-700">Tap Compare on up to three colleges, then come back here.</p>
            <Link href="/colleges" className="btn btn-accent mt-4">Browse colleges</Link>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--line)]">
                  <th scope="col" className="w-40 p-4"><span className="sr-only">Detail</span></th>
                  {colleges.map((c) => (
                    <th key={c.id} scope="col" className="p-4 align-top">
                      <Link href={`/colleges/${c.id}`} className="text-base font-bold text-brand underline-offset-2 hover:underline">{c.name}</Link>
                      <button onClick={() => remove(c.id)} className="mt-1 block text-xs font-normal text-slate-500 underline">Remove</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, get]) => (
                  <tr key={label} className="border-b border-[color:var(--line)] last:border-0">
                    <th scope="row" className="p-4 align-top font-semibold text-brand">{label}</th>
                    {colleges.map((c) => <td key={c.id} className="p-4 align-top text-slate-700">{get(c)}</td>)}
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="p-4"><span className="sr-only">Actions</span></th>
                  {colleges.map((c) => (
                    <td key={c.id} className="p-4"><Link href="/contact" className="btn btn-accent !px-4 !py-2 text-sm">Request counselling</Link></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
