"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import { CATEGORIES, EXAMS } from "@/lib/site";

const SAMPLE = "college,course,year,round,category,gender,closingRank,source,exam\n";
const blank = { collegeId: "", courseId: "", exam: "TS EAPCET", year: "2025", round: "Final", category: "OC", gender: "Any", closingRank: "", source: "", verified: false };

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-brand">{label}</span>
      {children}
    </label>
  );
}

export default function Cutoffs() {
  const [rows, setRows] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(blank);
  const [formMsg, setFormMsg] = useState(null);
  const [csv, setCsv] = useState("");
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showCsv, setShowCsv] = useState(false);

  const load = () => api("/api/admin/cutoffs").then((r) => r.ok && setRows(r.data.cutoffs));
  useEffect(() => {
    load();
    api("/api/admin/colleges").then((r) => r.ok && setColleges(r.data.colleges));
    api("/api/admin/courses").then((r) => r.ok && setCourses(r.data.courses));
  }, []);

  const college = colleges.find((c) => c.id === form.collegeId);
  const collegeCourses = (college?.courseIds || []).map((id) => courses.find((c) => c.id === id)).filter(Boolean);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value, ...(k === "collegeId" ? { courseId: "" } : {}) });

  async function add(e) {
    e.preventDefault();
    setFormMsg(null);
    const r = await api("/api/admin/cutoffs", "POST", form);
    if (!r.ok) return setFormMsg({ error: r.data.error || "Could not add" });
    setFormMsg({ ok: form.verified ? "Added and verified. It now feeds rank suggestions." : "Added. Verify it below before it is used." });
    setForm({ ...form, closingRank: "" });
    load();
  }

  async function importCsv() {
    const r = await api("/api/admin/cutoffs/import", "POST", { csv });
    setMsg(r.ok ? r.data : { error: r.data.error });
    if (r.ok && !r.data.errors.length) setCsv("");
    load();
  }

  async function verify(c) {
    await api("/api/admin/cutoffs", "PATCH", { id: c.id, verified: !c.verified });
    load();
  }

  async function del(c) {
    if (!confirm("Delete this cutoff record?")) return;
    await api(`/api/admin/cutoffs?id=${c.id}`, "DELETE");
    load();
  }

  async function demo(action) {
    const r = await api("/api/admin/demo", "POST", { action });
    setMsg(r.ok ? { note: action === "load" ? "Demo data loaded." : "Demo data removed." } : { error: r.data.error });
    load();
    api("/api/admin/colleges").then((x) => x.ok && setColleges(x.data.colleges));
  }

  if (!rows) return <p>Loading...</p>;
  const shown = rows.filter((r) => filter === "all" || (filter === "verified" ? r.verified : !r.verified));

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="rounded-xl border border-[color:var(--line)] p-5">
        <h2 className="text-lg font-bold text-brand">Add a cutoff</h2>
        <p className="mt-1 text-sm text-slate-600">Pick the college first; its courses appear next. Add the course to the college under Colleges and courses if it is missing.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Field label="College *"><select value={form.collegeId} onChange={set("collegeId")} required className="input"><option value="">Choose</option>{colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Course *"><select value={form.courseId} onChange={set("courseId")} required disabled={!college} className="input"><option value="">{college ? "Choose" : "Choose a college first"}</option>{collegeCourses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Exam *"><select value={form.exam} onChange={set("exam")} className="input">{EXAMS.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Year *"><input value={form.year} onChange={set("year")} inputMode="numeric" required className="input" /></Field>
          <Field label="Round"><input value={form.round} onChange={set("round")} className="input" /></Field>
          <Field label="Category *"><select value={form.category} onChange={set("category")} className="input">{CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Boys / girls"><select value={form.gender} onChange={set("gender")} className="input"><option>Any</option><option>Boys</option><option>Girls</option></select></Field>
          <Field label="Closing rank *"><input value={form.closingRank} onChange={set("closingRank")} inputMode="numeric" required className="input" /></Field>
          <Field label="Source *"><input value={form.source} onChange={set("source")} required placeholder="e.g. TGCHE final phase cutoff PDF" className="input" /></Field>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.verified} onChange={set("verified")} /> I have checked this against the official source (marks it verified so it is used in rank suggestions)</label>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="btn btn-accent text-sm">Add cutoff</button>
          {formMsg?.ok && <p className="text-sm text-green-700" role="status">{formMsg.ok}</p>}
          {formMsg?.error && <p className="text-sm text-red-600" role="alert">{formMsg.error}</p>}
        </div>
      </form>

      <div>
        <button onClick={() => setShowCsv(!showCsv)} className="text-sm font-semibold text-moss underline">{showCsv ? "Hide" : "Import many from CSV"}</button>
        {showCsv && (
          <div className="panel-soft mt-3 p-4">
            <p className="text-xs text-slate-600">
              Columns: <code>college, course, year, round, category, gender, closingRank, source</code> and optionally <code>exam</code> (TS EAPCET or AP EAPCET; blank means TS EAPCET).
              College and course names must already exist. Imported rows stay unverified until you verify them.
            </p>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={5} placeholder={SAMPLE} className="input mt-2 font-mono text-xs" />
            <button onClick={importCsv} disabled={!csv.trim()} className="btn btn-accent mt-2 text-sm disabled:opacity-50">Import</button>
            {msg?.imported !== undefined && (
              <div className="mt-2 text-sm">
                <p className="text-green-700">Imported {msg.imported} record(s).</p>
                {msg.errors.slice(0, 10).map((e) => <p key={e} className="text-red-600">{e}</p>)}
                {msg.errors.length > 10 && <p className="text-red-600">...and {msg.errors.length - 10} more.</p>}
              </div>
            )}
          </div>
        )}
        {msg?.error && <p className="mt-2 text-sm text-red-600">{msg.error}</p>}
        {msg?.note && <p className="mt-2 text-sm text-green-700">{msg.note}</p>}
        <div className="mt-3 flex gap-3 text-xs text-slate-500">
          <span>Testing only:</span>
          <button onClick={() => demo("load")} className="underline">Load demo data</button>
          <button onClick={() => demo("remove")} className="underline">Remove demo data</button>
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-brand">All cutoff records</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input !w-auto" aria-label="Filter records">
            <option value="all">All ({rows.length})</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
        {shown.length === 0 && <p className="panel-soft p-6 text-slate-500">No cutoff records.</p>}
        <div className="space-y-2">
          {shown.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--line)] p-3 text-sm">
              <div>
                <p className="font-semibold text-brand">{c.collegeName} · {c.courseName} {c.demo && <b className="text-xs text-red-700">DEMO</b>}</p>
                <p className="text-xs text-slate-500">{c.exam || "TS EAPCET"} · {c.year} · {c.round} · {c.category} · {c.gender} · closing {c.closingRank.toLocaleString("en-IN")} · {c.source}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => verify(c)} className={`underline ${c.verified ? "text-green-700" : "text-amber-700"}`}>{c.verified ? `Verified ${c.verifiedOn}` : "Verify"}</button>
                <button onClick={() => del(c)} className="text-red-600 underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
