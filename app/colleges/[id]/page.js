"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Gallery from "@/components/Gallery";
import Icon from "@/components/Icons";
import SaveButton from "@/components/SaveButton";
import { getCompare, MAX_COMPARE, setCompare } from "@/lib/compare";

export default function CollegePage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <CollegeDetails />
    </Suspense>
  );
}

function CompareToggle({ id }) {
  const [picked, setPicked] = useState(false);
  useEffect(() => {
    const sync = () => setPicked(getCompare().includes(id));
    sync();
    window.addEventListener("ll-compare", sync);
    return () => window.removeEventListener("ll-compare", sync);
  }, [id]);

  function toggle() {
    const ids = getCompare();
    if (ids.includes(id)) setCompare(ids.filter((x) => x !== id));
    else if (ids.length < MAX_COMPARE) setCompare([...ids, id]);
  }
  return (
    <button type="button" onClick={toggle} aria-pressed={picked} className={`btn text-sm ${picked ? "btn-leaf" : "btn-outline"}`}>
      {picked ? "Added to compare" : "Compare"}
    </button>
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

  if (data === undefined) return <p className="p-8" role="status">Loading...</p>;
  if (data === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-lg font-semibold text-brand">We could not find that college.</p>
        <Link href="/colleges" className="btn btn-accent mt-4">Back to colleges</Link>
      </div>
    );
  }

  const { college: c, cutoffs, photos } = data;
  const place = [c.district, c.state].filter(Boolean).join(", ");
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-14">
      <Link href="/colleges" className="text-sm font-semibold text-moss underline">← All colleges</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl md:text-5xl">{c.name}</h1>
        {c.partner && <span className="rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold text-brand">Partner college</span>}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-slate-600"><Icon name="pin" className="h-4 w-4" />{place}{c.address ? ` · ${c.address}` : ""}</p>
      {c.description && <p className="mt-4 leading-relaxed text-slate-700">{c.description}</p>}
      {c.website && (
        <a href={c.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-moss underline">Official website</a>
      )}

      {photos.length > 0 && <div className="-mx-4"><Gallery photos={photos} title="Photos" /></div>}

      <h2 className="mt-10 text-2xl">Programmes</h2>
      {c.courses.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">{c.courses.map((x) => <li key={x.id} className="rounded-full bg-soft px-3 py-1 text-sm font-medium text-brand">{x.name}</li>)}</ul>
      ) : <p className="mt-2 text-sm text-slate-500">Programme list to be added.</p>}

      {c.facilities.length > 0 && (
        <>
          <h2 className="mt-10 text-2xl">Facilities</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{c.facilities.map((x) => <li key={x} className="rounded-full bg-soft px-3 py-1 text-sm text-brand">{x}</li>)}</ul>
        </>
      )}

      {c.feeNote && (
        <p className="panel-soft mt-8 p-4 text-sm"><b>Fees:</b> {c.feeNote}{c.feeVerifiedOn && ` (verified ${c.feeVerifiedOn})`}</p>
      )}

      <h2 className="mt-10 text-2xl">Historical cutoffs</h2>
      {cutoffs.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No verified cutoff records yet.</p>
      ) : (
        <div className="card mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-soft text-brand">
              <tr><th scope="col" className="p-3">Course</th><th scope="col" className="p-3">Exam</th><th scope="col" className="p-3">Year</th><th scope="col" className="p-3">Round</th><th scope="col" className="p-3">Category</th><th scope="col" className="p-3">Closing rank</th><th scope="col" className="p-3">Source</th></tr>
            </thead>
            <tbody>
              {cutoffs.map((x, i) => (
                <tr key={i} className="border-t border-[color:var(--line)]">
                  <td className="p-3">{x.course}</td><td className="p-3">{x.exam}</td><td className="p-3">{x.year}</td><td className="p-3">{x.round}</td>
                  <td className="p-3">{x.category}{x.gender !== "Any" ? ` (${x.gender})` : ""}</td>
                  <td className="p-3">{x.closingRank.toLocaleString("en-IN")}</td>
                  <td className="p-3 text-xs">{x.source}{x.demo && <b className="ml-1 text-red-700">DEMO</b>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-500">Past cutoffs are indicative and do not guarantee admission in any year.</p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href="/rank-guidance" className="btn btn-brand">Check my rank</Link>
        <Link href="/contact" className="btn btn-accent">Request counselling</Link>
        <CompareToggle id={c.id} />
        <SaveButton collegeId={c.id} />
      </div>
    </div>
  );
}
