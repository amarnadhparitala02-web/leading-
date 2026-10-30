"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORIES, GENDERS, STREAMS, waHref } from "@/lib/site";

export default function RankGuidance() {
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const [out, setOut] = useState(null);
  const [requested, setRequested] = useState(false);
  const [student, setStudent] = useState(null);
  const [pre, setPre] = useState({ stream: "btech", rank: "" });

  // The home page's quick rank check passes ?stream=...&rank=... so the form opens pre-filled.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const stream = q.get("stream");
    setPre({ stream: STREAMS[stream] ? stream : "btech", rank: (q.get("rank") || "").replace(/\D/g, "").slice(0, 7) });
  }, []);

  // Signed-in students do not retype their name and number; the search is saved to their account.
  useEffect(() => {
    fetch("/api/account/session").then((r) => (r.ok ? r.json() : null)).then((d) => setStudent(d?.student || null)).catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setState("sending");
    setError("");
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/rank-guidance/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...Object.fromEntries(f),
        privacyConsent: f.get("privacyConsent") === "on",
        followUpConsent: f.get("followUpConsent") === "on",
      }),
    });
    const data = await res.json().catch(() => ({}));
    setState("idle");
    if (!res.ok) return setError(data.error || "Something went wrong");
    setOut(data);
    setRequested(data.leadCreated);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function requestCounselling() {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchId: out.searchId, followUpConsent: true, source: "rank-guidance" }),
    });
    if (res.ok) setRequested(true);
  }

  if (out) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-extrabold">Your potential colleges</h1>
        <p className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
          These are potential matches based on historical cutoffs. Past cutoffs change every year and do not guarantee admission.
        </p>

        {out.results.length === 0 ? (
          <p className="mt-6 glass-card p-6">
            We do not have verified cutoff records matching these details yet. Our counsellors can still guide you personally.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto glass-card">
            <table className="w-full text-sm">
              <thead className="bg-white/50 text-left">
                <tr><th className="p-3">College</th><th className="p-3">Course</th><th className="p-3">Closing rank</th><th className="p-3">Data</th><th className="p-3">Result</th></tr>
              </thead>
              <tbody>
                {out.results.map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="p-3">
                      <Link href={`/colleges/${r.collegeId}`} className="font-medium underline">{r.college}</Link>
                      <span className="block text-xs text-slate-500">{r.district}</span>
                    </td>
                    <td className="p-3">{r.course}</td>
                    <td className="p-3">{r.closingRank.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-xs">{r.year} · {r.round} · {r.category}<span className="block text-slate-500">{r.source}</span>{r.demo && <b className="text-red-600">DEMO DATA</b>}</td>
                    <td className="p-3 font-semibold">{r.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {requested ? (
            <p className="rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-green-800">
              Counselling requested. We will contact you shortly.
            </p>
          ) : (
            <button onClick={requestCounselling} className="btn btn-accent">Request counselling</button>
          )}
          {waHref("Hi, I checked my rank on your website and need guidance.") && (
            <a href={waHref("Hi, I checked my rank on your website and need guidance.")} target="_blank" rel="noopener noreferrer"
              className="btn bg-[#25D366] text-white">Chat on WhatsApp</a>
          )}
          <button onClick={() => { setOut(null); setRequested(false); }} className="btn border border-brand/25 bg-white/60">New search</button>
        </div>
      </div>
    );
  }

  const thisYear = 2026;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Rank Guidance</h1>
      <p className="mt-2 text-slate-600">Enter your Telangana EAPCET details to see potential colleges from historical cutoffs.</p>

      <form onSubmit={onSubmit} className="glass-card mt-6 grid gap-3 p-6">
        <div className="grid grid-cols-2 gap-3">
          <select name="year" className="input" defaultValue={thisYear}>
            {[thisYear, thisYear - 1, thisYear - 2].map((y) => <option key={y}>{y}</option>)}
          </select>
          <select name="stream" className="input" defaultValue={pre.stream} key={`s-${pre.stream}`}>
            {Object.entries(STREAMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <input name="rank" required inputMode="numeric" placeholder="Your EAPCET rank" className="input" defaultValue={pre.rank} key={`r-${pre.rank}`} />
        <div className="grid grid-cols-2 gap-3">
          <select name="category" className="input" defaultValue="OC">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select name="gender" className="input" defaultValue="Boys">
            {GENDERS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <input name="region" placeholder="Preferred district (optional)" className="input" />

        <hr className="my-2" />
        {student ? (
          <p className="glass-card p-3 text-sm">
            Signed in as <b>{student.name}</b> ({student.phone}). This search will be saved to{" "}
            <Link href="/account" className="underline">your account</Link>.
          </p>
        ) : (
          <>
            <input name="name" required placeholder="Full name" className="input" />
            <input name="phone" required inputMode="tel" placeholder="Mobile number" className="input" />
            <p className="text-xs text-slate-500">
              Want to keep your searches and saved colleges? <Link href="/account" className="underline">Sign in or create an account</Link>.
            </p>
          </>
        )}

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="privacyConsent" required className="mt-1" />
          <span>
            I understand my name, mobile number and rank details are stored to run this search and are
            accessible only to authorised Leading Light staff. <Link href="/privacy" className="underline">Privacy notice</Link>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="followUpConsent" className="mt-1" />
          <span>(Optional) I agree that a counsellor may call me about admission guidance.</span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={state === "sending"} className="btn btn-accent disabled:opacity-60">
          {state === "sending" ? "Searching..." : "Show Potential Colleges"}
        </button>
      </form>
    </div>
  );
}
