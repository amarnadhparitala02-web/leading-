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
    <form onSubmit={go} className="on-dark rounded-[1.75rem] bg-brand p-6 text-white shadow-xl md:p-8" aria-labelledby="rank-title">
      <h2 id="rank-title" className="text-2xl">Check your EAPCET rank</h2>
      <p className="mt-2 text-sm text-white/80">
        Your rank is one part of your story. Explore college possibilities using your rank, category, course and
        historical cutoff information.
      </p>

      <div role="radiogroup" aria-label="Exam" className="mt-5 inline-flex rounded-full bg-white/10 p-1">
        {EXAMS.slice().reverse().map((x) => (
          <button
            key={x}
            type="button"
            role="radio"
            aria-checked={exam === x}
            onClick={() => setExam(x)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${exam === x ? "bg-accent text-brand" : "text-white/85 hover:bg-white/10"}`}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-white/80">Stream</span>
          <select value={stream} onChange={(e) => setStream(e.target.value)} className="input">
            {Object.entries(STREAMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-white/80">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-white/80">Your rank</span>
          <input value={rank} onChange={(e) => setRank(e.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" placeholder="Enter your rank" className="input" />
        </label>
      </div>
      <button className="btn btn-leaf mt-5 w-full">Get college suggestions</button>
      <p className="mt-3 text-xs text-white/70">
        Suggestions are indicative. They are based on historical cutoffs and depend on current official counselling rules and data.
      </p>
    </form>
  );
}
