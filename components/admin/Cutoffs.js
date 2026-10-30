"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

const SAMPLE = "college,course,year,round,category,gender,closingRank,source\n";

export default function Cutoffs() {
  const [rows, setRows] = useState(null);
  const [csv, setCsv] = useState("");
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = () => api("/api/admin/cutoffs").then((r) => r.ok && setRows(r.data.cutoffs));
  useEffect(() => { load(); }, []);

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
  }

  if (!rows) return <p>Loading...</p>;
  const shown = rows.filter((r) => filter === "all" || (filter === "verified" ? r.verified : !r.verified));

  return (
    <div className="space-y-6">
      <div className="glass-card p-4">
        <h3 className="font-bold">Import cutoffs (CSV)</h3>
        <p className="mt-1 text-xs text-slate-500">
          Columns: <code>college, course, year, round, category, gender, closingRank, source</code>. College and course names
          must already exist. Gender is Boys, Girls or Any. Imported rows stay unverified until you verify them.
        </p>
        <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={5} placeholder={SAMPLE} className="input mt-2 font-mono text-xs" />
        <button onClick={importCsv} disabled={!csv.trim()} className="btn btn-brand mt-2 text-sm disabled:opacity-50">Import</button>
        {msg?.error && <p className="mt-2 text-sm text-red-600">{msg.error}</p>}
        {msg?.note && <p className="mt-2 text-sm text-green-700">{msg.note}</p>}
        {msg?.imported !== undefined && (
          <div className="mt-2 text-sm">
            <p className="text-green-700">Imported {msg.imported} record(s).</p>
            {msg.errors.slice(0, 10).map((e) => <p key={e} className="text-red-600">{e}</p>)}
            {msg.errors.length > 10 && <p className="text-red-600">...and {msg.errors.length - 10} more.</p>}
          </div>
        )}
        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3 text-xs">
          <span className="self-center text-slate-500">Testing only:</span>
          <button onClick={() => demo("load")} className="underline">Load demo data</button>
          <button onClick={() => demo("remove")} className="underline">Remove demo data</button>
        </div>
      </div>

      <div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input mb-3 max-w-52">
          <option value="all">All records ({rows.length})</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
        {shown.length === 0 && <p className="glass-card p-6 text-slate-500">No cutoff records.</p>}
        <div className="space-y-2">
          {shown.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 glass-card p-3 text-sm">
              <div>
                <p className="font-semibold">{c.collegeName} · {c.courseName} {c.demo && <b className="text-xs text-red-600">DEMO</b>}</p>
                <p className="text-xs text-slate-500">{c.year} · {c.round} · {c.category} · {c.gender} · closing {c.closingRank.toLocaleString("en-IN")} · {c.source}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => verify(c)} className={`text-sm underline ${c.verified ? "text-green-700" : "text-amber-700"}`}>
                  {c.verified ? `Verified ${c.verifiedOn}` : "Verify"}
                </button>
                <button onClick={() => del(c)} className="text-sm text-red-600 underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
