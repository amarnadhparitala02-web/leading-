"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, EXAMS, STREAMS } from "@/lib/site";

// Quick rank check. It opens the full Rank Checker with these choices already filled in.
export default function RankPanel() {
  const router = useRouter();
  const [exam, setExam] = useState(EXAMS[1]); // AP EAPCET first, as in the plan
  const [stream, setStream] = useState("btech");
  const [category, setCategory] = useState("OC");
  const [rank, setRank] = useState("");

  function go(e) {
    e.preventDefault();
    const q = new URLSearchParams({ exam, stream, category });
    if (rank) q.set("rank", rank);
    router.push(`/rank-guidance?${q}`);
  }

  return (
    <form onSubmit={go} className="rounded-2xl bg-white p-6 text-slate-800 shadow-[0_24px_60px_rgba(3,10,30,0.35)] md:p-7" aria-labelledby="rank-title">
      <h2 id="rank-title" className="!text-brand text-xl">Check your EAPCET rank</h2>
      <p className="mt-1.5 text-sm text-slate-600">
        Explore college possibilities using your rank, category and historical cutoff information.
      </p>

      <div role="radiogroup" aria-label="Exam" className="mt-5 grid grid-cols-2 rounded-lg bg-soft p-1">
        {EXAMS.slice().reverse().map((x) => (
          <button
            key={x}
            type="button"
            role="radio"
            aria-checked={exam === x}
            onClick={() => setExam(x)}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${exam === x ? "bg-brand text-white shadow-sm" : "text-brand hover:bg-white"}`}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-brand">Stream</span>
          <select value={stream} onChange={(e) => setStream(e.target.value)} className="input">
            {Object.entries(STREAMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-brand">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-brand">Your rank</span>
          <input value={rank} onChange={(e) => setRank(e.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" placeholder="Enter your rank" className="input" />
        </label>
      </div>
      <button className="btn btn-accent mt-5 w-full">Get college suggestions</button>
      <p className="mt-3 text-xs text-slate-500">
        Suggestions are indicative. They are based on historical cutoffs and depend on current official counselling rules and data.
      </p>
    </form>
  );
}
