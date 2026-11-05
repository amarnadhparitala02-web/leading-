"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import { EXAMS, CATEGORIES } from "@/lib/site";
import { summarizeRanks } from "@/lib/cutoffs";

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
  const [datasets, setDatasets] = useState([]);
  const [up, setUp] = useState({ exam: "TS EAPCET", year: "", round: "", source: "", verified: true });
  const [file, setFile] = useState(null);
  const [upMsg, setUpMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [yearFilter, setYearFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(100);

  const loadDatasets = () => api("/api/admin/cutoffs/upload").then((r) => r.ok && setDatasets(r.data.datasets));
  const load = () => {
    loadDatasets();
    return api("/api/admin/cutoffs").then((r) => r.ok && setRows(r.data.cutoffs));
  };
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

  async function upload(mode) {
    if (!file) return setUpMsg({ error: "Choose a PDF or CSV file first" });
    setBusy(true);
    setUpMsg(null);
    const f = new FormData();
    f.set("file", file);
    f.set("mode", mode);
    f.set("exam", up.exam);
    f.set("year", up.year);
    f.set("round", up.round);
    f.set("source", up.source);
    f.set("verified", up.verified ? "1" : "0");
    const r = await api("/api/admin/cutoffs/upload", "POST", f);
    setBusy(false);
    if (!r.ok) return setUpMsg({ error: r.data.error || "Upload failed" });
    if (mode === "preview") return setUpMsg({ preview: r.data.preview });
    setUpMsg({ saved: r.data.saved });
    setFile(null);
    load();
    api("/api/admin/colleges").then((x) => x.ok && setColleges(x.data.colleges));
    api("/api/admin/courses").then((x) => x.ok && setCourses(x.data.courses));
  }

  async function removeYear(d) {
    if (!confirm(`Delete ALL ${d.exam} ${d.year} ${d.round} cutoff data (${d.records} records)? This cannot be undone.`)) return;
    const q = new URLSearchParams({ exam: d.exam, year: d.year, round: d.round });
    await api(`/api/admin/cutoffs/upload?${q}`, "DELETE");
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
  const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => b - a);
  const q = search.trim().toLowerCase();
  const matching = rows.filter(
    (r) =>
      (filter === "all" || (filter === "verified" ? r.verified : !r.verified)) &&
      (yearFilter === "all" || String(r.year) === yearFilter) &&
      (!q || `${r.collegeName} ${r.courseName}`.toLowerCase().includes(q)),
  );
  const shown = matching.slice(0, limit);
  const setU = (k) => (e) => setUp({ ...up, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const pv = upMsg?.preview;
  const sv = upMsg?.saved;

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-[color:var(--line)] p-5">
        <h2 className="text-lg font-bold text-brand">Year-wise cutoff data</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload each year&apos;s official last-rank statement. Rank suggestions use the newest year by default, and students can pick an earlier year.
          Uploading again for the same exam, year and round replaces that data. Other years are never touched.
        </p>

        {datasets.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No cutoff data uploaded yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-[color:var(--line)]">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-soft text-brand"><tr><th className="p-2.5">Exam</th><th className="p-2.5">Year</th><th className="p-2.5">Round</th><th className="p-2.5">Colleges</th><th className="p-2.5">Records</th><th className="p-2.5">Verified</th><th className="p-2.5"></th></tr></thead>
              <tbody>
                {datasets.map((d) => (
                  <tr key={`${d.exam}${d.year}${d.round}`} className="border-t border-[color:var(--line)]">
                    <td className="p-2.5">{d.exam}</td><td className="p-2.5 font-semibold">{d.year}</td><td className="p-2.5">{d.round}</td>
                    <td className="p-2.5">{d.colleges}</td><td className="p-2.5">{d.records}</td>
                    <td className="p-2.5">{d.verified === d.records ? "All" : `${d.verified} of ${d.records}`}</td>
                    <td className="p-2.5 text-right"><button onClick={() => removeYear(d)} className="text-red-600 underline">Delete year</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Field label="Exam *"><select value={up.exam} onChange={setU("exam")} className="input">{EXAMS.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Year"><input value={up.year} onChange={setU("year")} inputMode="numeric" placeholder="from PDF, e.g. 2025" className="input" /></Field>
          <Field label="Round / phase"><input value={up.round} onChange={setU("round")} placeholder="from PDF, e.g. Second Phase" className="input" /></Field>
          <Field label="Source"><input value={up.source} onChange={setU("source")} placeholder="from PDF" className="input" /></Field>
        </div>
        <div className="mt-3">
          <Field label="File (TGCHE last rank PDF, or CSV) *">
            <input type="file" accept=".pdf,.csv,application/pdf,text/csv" onChange={(e) => { setFile(e.target.files?.[0] || null); setUpMsg(null); }} className="input" />
          </Field>
          <p className="mt-1 text-xs text-slate-500">
            CSV columns: <code>college, course</code> then ranks such as <code>OC_BOYS, OC_GIRLS, BC_A_BOYS, ..., SC_I_BOYS, ST_GIRLS, EWS_BOYS</code> (use <code>SC_BOYS</code> for AP). Optional: <code>instCode, branchCode, state, district</code>.
          </p>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={up.verified} onChange={setU("verified")} /> This is an official published statement (mark verified so it is used in rank suggestions)</label>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={() => upload("preview")} disabled={busy || !file} className="btn btn-outline text-sm disabled:opacity-50">{busy ? "Working..." : "Preview"}</button>
          {pv && <button onClick={() => upload("commit")} disabled={busy} className="btn btn-accent text-sm disabled:opacity-50">Save {pv.year} data</button>}
        </div>
        {upMsg?.error && <p className="mt-3 text-sm text-red-600" role="alert">{upMsg.error}</p>}
        {pv && (
          <div className="panel-soft mt-3 p-4 text-sm" role="status">
            <p className="font-semibold text-brand">{pv.exam} {pv.year} · {pv.round}: {pv.records} branch records for {pv.colleges} colleges ({pv.rankValues.toLocaleString("en-IN")} ranks)</p>
            <p className="mt-1">{pv.newColleges} new colleges and {pv.newCourses} new courses will be added{pv.replacing ? `; ${pv.replacing} existing records for this year will be replaced` : ""}. New colleges stay off the public college list and are used for rank results only.</p>
            {pv.newCourseNames.length > 0 && <p className="mt-1 text-xs text-slate-600">New courses: {pv.newCourseNames.join(", ")}</p>}
            {pv.warnings.map((w) => <p key={w} className="text-xs text-amber-700">{w}</p>)}
            <p className="mt-2 text-xs text-slate-500">Nothing is saved until you press Save.</p>
          </div>
        )}
        {sv && <p className="mt-3 text-sm text-green-700" role="status">Saved {sv.records} records for {sv.exam} {sv.year} ({sv.round}).</p>}
      </section>

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
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setLimit(100); }} className="input !w-auto" aria-label="Filter records">
            <option value="all">All ({rows.length})</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setLimit(100); }} className="input !w-auto" aria-label="Filter by year">
            <option value="all">All years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setLimit(100); }} placeholder="Search college or course" className="input !w-auto min-w-[220px]" aria-label="Search records" />
        </div>
        <p className="mb-2 text-xs text-slate-500">Showing {shown.length} of {matching.length}</p>
        {matching.length === 0 && <p className="panel-soft p-6 text-slate-500">No cutoff records.</p>}
        <div className="space-y-2">
          {shown.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--line)] p-3 text-sm">
              <div>
                <p className="font-semibold text-brand">{c.collegeName} · {c.courseName} {c.demo && <b className="text-xs text-red-700">DEMO</b>}</p>
                <p className="text-xs text-slate-500">
                  {c.exam || "TS EAPCET"} · {c.year} · {c.round} ·{" "}
                  {c.ranks ? summarizeRanks(c.ranks) : `${c.category} · ${c.gender} · closing ${c.closingRank.toLocaleString("en-IN")}`} · {c.source}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => verify(c)} className={`underline ${c.verified ? "text-green-700" : "text-amber-700"}`}>{c.verified ? `Verified ${c.verifiedOn}` : "Verify"}</button>
                <button onClick={() => del(c)} className="text-red-600 underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
        {matching.length > shown.length && <button onClick={() => setLimit(limit + 200)} className="mt-3 text-sm font-semibold text-moss underline">Show more</button>}
      </div>
    </div>
  );
}
