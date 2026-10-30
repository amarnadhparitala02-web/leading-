"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSettings } from "@/components/SettingsProvider";
import { CATEGORIES, EXAMS, GENDERS, STREAMS } from "@/lib/site";
import { waHref } from "@/lib/settings";

const thisYear = 2026;
const WA_MSG = "Hi, I checked my rank on your website and need guidance.";

function Field({ label, children, hint }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-brand">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export default function RankChecker() {
  const { settings } = useSettings();
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const [out, setOut] = useState(null);
  const [requested, setRequested] = useState(false);
  const [student, setStudent] = useState(null);
  const [exam, setExam] = useState(EXAMS[0]);
  const [pre, setPre] = useState({ stream: "btech", rank: "", category: "OC" });

  // The homepage's quick check passes ?exam=&stream=&category=&rank= so the form opens pre-filled.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (EXAMS.includes(q.get("exam"))) setExam(q.get("exam"));
    setPre({
      stream: STREAMS[q.get("stream")] ? q.get("stream") : "btech",
      category: CATEGORIES.includes(q.get("category")) ? q.get("category") : "OC",
      rank: (q.get("rank") || "").replace(/\D/g, "").slice(0, 7),
    });
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
    try {
      const res = await fetch("/api/rank-guidance/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(f),
          exam,
          privacyConsent: f.get("privacyConsent") === "on",
          followUpConsent: f.get("followUpConsent") === "on",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setOut({ ...data, exam });
      setRequested(data.leadCreated);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "We could not reach the server. Please check your connection and try again." : err.message);
    } finally {
      setState("idle");
    }
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
      <div className="mx-auto max-w-5xl px-4 py-14 md:py-16">
        <p className="eyebrow">{out.exam}</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Your possible colleges</h1>
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <b>Indicative only.</b> These are potential matches based on historical cutoffs. Cutoffs change every year and
          depend on current official counselling rules and data. They do not guarantee admission.
        </p>

        {out.results.length === 0 ? (
          <div className="panel-soft mt-6 p-7">
            <p className="font-semibold text-brand">We do not have verified cutoff records matching these details yet.</p>
            <p className="mt-1 text-slate-700">A counsellor can still guide you personally. Tap Request counselling below.</p>
          </div>
        ) : (
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Colleges with historical cutoffs near your rank</caption>
              <thead className="bg-soft text-brand">
                <tr><th scope="col" className="p-3">College</th><th scope="col" className="p-3">Course</th><th scope="col" className="p-3">Closing rank</th><th scope="col" className="p-3">Cutoff data</th><th scope="col" className="p-3">Result</th></tr>
              </thead>
              <tbody>
                {out.results.map((r, i) => (
                  <tr key={i} className="border-t border-[color:var(--line)]">
                    <td className="p-3">
                      <Link href={`/colleges/${r.collegeId}`} className="font-semibold text-brand underline-offset-2 hover:underline">{r.college}</Link>
                      <span className="block text-xs text-slate-500">{[r.district, r.state].filter(Boolean).join(", ")}</span>
                    </td>
                    <td className="p-3">{r.course}</td>
                    <td className="p-3">{r.closingRank.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-xs">
                      {r.exam} {r.year} · {r.round} · {r.category}
                      <span className="block text-slate-500">Source: {r.source}</span>
                      {r.demo && <b className="text-red-700">DEMO DATA</b>}
                    </td>
                    <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.label === "Potential match" ? "bg-accent/60 text-brand" : "bg-amber-100 text-amber-900"}`}>{r.label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {requested ? (
            <p className="rounded-xl bg-accent/40 px-4 py-2 font-medium text-brand" role="status">Counselling requested. We will contact you shortly.</p>
          ) : (
            <button onClick={requestCounselling} className="btn btn-accent">Request counselling</button>
          )}
          {waHref(settings, WA_MSG) && (
            <a href={waHref(settings, WA_MSG)} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white">Chat on WhatsApp</a>
          )}
          <Link href="/colleges" className="btn btn-outline">Browse all colleges</Link>
          <button onClick={() => { setOut(null); setRequested(false); }} className="btn btn-brand">New search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:py-16">
      <p className="eyebrow">Rank checker</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Your rank is one part of your story</h1>
      <p className="mt-3 text-slate-700">
        Explore college possibilities using your rank, category, course and historical cutoff information. Suggestions are
        indicative and depend on current official counselling rules and data.
      </p>

      <form onSubmit={onSubmit} className="card mt-8 grid gap-4 p-6 md:p-7" aria-describedby="rank-note">
        <fieldset>
          <legend className="mb-1 text-sm font-medium text-brand">Entrance exam</legend>
          <div role="radiogroup" aria-label="Entrance exam" className="inline-flex rounded-full bg-soft p-1">
            {EXAMS.slice().reverse().map((x) => (
              <button key={x} type="button" role="radio" aria-checked={exam === x} onClick={() => setExam(x)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${exam === x ? "bg-brand text-white" : "text-brand hover:bg-white"}`}>
                {x}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Exam year">
            <select name="year" className="input" defaultValue={thisYear}>{[thisYear, thisYear - 1, thisYear - 2].map((y) => <option key={y}>{y}</option>)}</select>
          </Field>
          <Field label="Stream">
            <select name="stream" className="input" defaultValue={pre.stream} key={`s-${pre.stream}`}>{Object.entries(STREAMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </Field>
          <Field label="Your rank">
            <input name="rank" required inputMode="numeric" pattern="[0-9]*" placeholder="e.g. 12500" className="input" defaultValue={pre.rank} key={`r-${pre.rank}`} />
          </Field>
          <Field label="Category">
            <select name="category" className="input" defaultValue={pre.category} key={`c-${pre.category}`}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Boys or girls">
            <select name="gender" className="input" defaultValue="Boys">{GENDERS.map((g) => <option key={g}>{g}</option>)}</select>
          </Field>
          <Field label="Preferred district (optional)">
            <input name="region" placeholder="e.g. Hyderabad" className="input" />
          </Field>
        </div>

        <hr className="border-[color:var(--line)]" />

        {student ? (
          <p className="panel-soft p-3 text-sm">
            Signed in as <b>{student.name}</b> ({student.phone}). This search will be saved to <Link href="/account" className="font-semibold underline">your account</Link>.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><input name="name" required autoComplete="name" className="input" /></Field>
              <Field label="Mobile number"><input name="phone" required inputMode="tel" autoComplete="tel" className="input" /></Field>
            </div>
            <p className="text-xs text-slate-500">Want to keep your searches and saved colleges? <Link href="/account" className="underline">Sign in or create an account</Link>.</p>
          </>
        )}

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="privacyConsent" required className="mt-1" />
          <span>
            I understand my name, mobile number and rank details are stored to run this search and are accessible only to
            authorised Leading Light staff. <Link href="/privacy" className="underline">Privacy notice</Link>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="followUpConsent" className="mt-1" />
          <span>(Optional) I agree that a counsellor may call me about admission guidance.</span>
        </label>

        <p id="rank-note" className="sr-only">Results are indicative and not a guarantee of admission.</p>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={state === "sending"} className="btn btn-accent disabled:opacity-60">
          {state === "sending" ? "Checking..." : "Get college suggestions"}
        </button>
      </form>
    </div>
  );
}
