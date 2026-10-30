"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Gallery from "@/components/Gallery";
import SaveButton from "@/components/SaveButton";

export default function CollegePage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <CollegeDetails />
    </Suspense>
  );
}

function CollegeDetails() {
  const { id } = useParams();
  const [data, setData] = useState(undefined);

  useEffect(() => {
    fetch(`/api/colleges/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, [id]);

  if (data === undefined) return <p className="p-8">Loading...</p>;
  if (data === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p>College not found.</p>
        <Link href="/colleges" className="underline">Back to colleges</Link>
      </div>
    );
  }

  const { college: c, cutoffs, photos } = data;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/colleges" className="text-sm underline">← All colleges</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold">{c.name}</h1>
        {c.partner && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Partner college</span>}
      </div>
      <p className="mt-1 text-slate-600">{c.district}{c.address ? ` · ${c.address}` : ""}</p>
      {c.description && <p className="mt-4">{c.description}</p>}
      {c.website && (
        <a href={c.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-brand underline">Official website</a>
      )}

      {photos.length > 0 && (
        <div className="-mx-4"><Gallery photos={photos} title="Photos" /></div>
      )}

      <h2 className="mt-8 text-xl font-bold">Programmes</h2>
      {c.courses.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {c.courses.map((x) => <li key={x.id} className="rounded-full bg-white/50 px-3 py-1 text-sm">{x.name}</li>)}
        </ul>
      ) : <p className="mt-2 text-sm text-slate-500">Programme list to be added.</p>}

      {c.facilities.length > 0 && (
        <>
          <h2 className="mt-8 text-xl font-bold">Facilities</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {c.facilities.map((x) => <li key={x} className="rounded-full bg-white/50 px-3 py-1 text-sm">{x}</li>)}
          </ul>
        </>
      )}

      {c.feeNote && (
        <p className="mt-6 text-sm"><b>Fees:</b> {c.feeNote}{c.feeVerifiedOn && ` (verified ${c.feeVerifiedOn})`}</p>
      )}

      <h2 className="mt-8 text-xl font-bold">Historical cutoffs</h2>
      {cutoffs.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No verified cutoff records yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto glass-card">
          <table className="w-full text-sm">
            <thead className="bg-white/50 text-left">
              <tr><th className="p-3">Course</th><th className="p-3">Year</th><th className="p-3">Round</th><th className="p-3">Category</th><th className="p-3">Closing rank</th><th className="p-3">Source</th></tr>
            </thead>
            <tbody>
              {cutoffs.map((x, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="p-3">{x.course}</td><td className="p-3">{x.year}</td><td className="p-3">{x.round}</td>
                  <td className="p-3">{x.category}{x.gender !== "Any" ? ` (${x.gender})` : ""}</td>
                  <td className="p-3">{x.closingRank.toLocaleString("en-IN")}</td>
                  <td className="p-3 text-xs">{x.source}{x.demo && <b className="ml-1 text-red-600">DEMO</b>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-500">Past cutoffs do not guarantee admission in any year.</p>

      <div className="mt-8 flex gap-3">
        <Link href="/rank-guidance" className="btn btn-brand">Check my rank</Link>
        <Link href="/contact" className="btn btn-accent">Request counselling</Link>
        <SaveButton collegeId={c.id} />
      </div>
    </div>
  );
}
