"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icons";
import { getCompare, MAX_COMPARE, setCompare } from "@/lib/compare";

const rank = (n) => n.toLocaleString("en-IN");

// One college, shown only with verified information. Photos are optional; without one a
// calm illustrated panel is shown. Actions: View College, Compare, Request Counselling.
export default function CollegeCard({ college: c, showCompare = true }) {
  const [picked, setPicked] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const sync = () => {
      const ids = getCompare();
      setPicked(ids.includes(c.id));
      setFull(ids.length >= MAX_COMPARE);
    };
    sync();
    window.addEventListener("ll-compare", sync);
    return () => window.removeEventListener("ll-compare", sync);
  }, [c.id]);

  function toggle() {
    const ids = getCompare();
    setCompare(ids.includes(c.id) ? ids.filter((x) => x !== c.id) : [...ids, c.id]);
  }

  const place = [c.district, c.state].filter(Boolean).join(", ");

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      {c.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.cover} alt={`${c.name} campus`} loading="lazy" className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#e8eefb] to-[#d3dff5] text-brand/60" aria-hidden="true">
          <Icon name="building" className="h-14 w-14" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-snug text-brand">{c.name}</h3>
          {c.partner && <span className="shrink-0 rounded-md bg-accent px-2.5 py-0.5 text-xs font-semibold text-brand">Partner</span>}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
          <Icon name="pin" className="h-4 w-4" />{place}
        </p>

        {c.courses.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Courses offered">
            {c.courses.slice(0, 3).map((x) => (
              <li key={x.id} className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-medium text-brand">{x.name}</li>
            ))}
            {c.courses.length > 3 && <li className="rounded-full bg-soft px-2.5 py-0.5 text-xs text-slate-600">+{c.courses.length - 3} more</li>}
          </ul>
        )}

        {c.cutoffs?.length > 0 && (
          <div className="mt-3 rounded-xl bg-soft/70 p-3 text-xs text-slate-700">
            <p className="font-semibold text-brand">Latest verified cutoff (open category)</p>
            {c.cutoffs.map((x, i) => (
              <p key={i} className="mt-1">
                {x.course}: closing rank {rank(x.closingRank)} · {x.exam} {x.year}
                {x.demo && <b className="ml-1 text-red-700">DEMO</b>}
                <span className="block text-slate-500">Source: {x.source}</span>
              </p>
            ))}
          </div>
        )}

        {c.feeNote && (
          <p className="mt-3 text-xs text-slate-700">
            <b>Fees:</b> {c.feeNote}{c.feeVerifiedOn && ` (verified ${c.feeVerifiedOn})`}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <Link href={`/colleges/${c.id}`} className="btn btn-accent !px-4 !py-2 text-sm">View College</Link>
          {showCompare && (
            <button
              type="button"
              onClick={toggle}
              disabled={!picked && full}
              aria-pressed={picked}
              className={`btn !px-4 !py-2 text-sm disabled:opacity-50 ${picked ? "btn-leaf" : "btn-outline"}`}
            >
              {picked ? "Added to compare" : "Compare"}
            </button>
          )}
          <Link href="/contact" className="px-1 py-2 text-sm font-semibold text-moss underline underline-offset-2">Request counselling</Link>
        </div>
      </div>
    </article>
  );
}
