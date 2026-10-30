"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import { LEAD_STATUSES, STREAMS } from "@/lib/site";

export default function Leads({ me }) {
  const [leads, setLeads] = useState(null);
  const [staff, setStaff] = useState([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    api("/api/admin/leads").then((r) => r.ok && setLeads(r.data.leads));
    api("/api/admin/users").then((r) => r.ok && setStaff(r.data.users));
  }, []);

  async function update(id, body) {
    const r = await api(`/api/admin/leads/${id}`, "PATCH", body);
    if (r.ok) setLeads((ls) => ls.map((l) => (l.id === id ? r.data.lead : l)));
  }

  async function addNote(id) {
    if (!note.trim()) return;
    await update(id, { activity: { note } });
    setNote("");
  }

  if (!leads) return <p>Loading...</p>;
  const shown = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input max-w-56">
          <option value="all">All statuses ({leads.length})</option>
          {LEAD_STATUSES.map(([k, label]) => <option key={k} value={k}>{label} ({leads.filter((l) => l.status === k).length})</option>)}
        </select>
        {me.role === "admin" && <a href="/api/admin/leads/export" className="btn btn-brand text-sm">Export CSV</a>}
      </div>

      {shown.length === 0 && <p className="glass-card p-6 text-center text-slate-500">No leads yet.</p>}
      <div className="space-y-3">
        {shown.map((l) => (
          <div key={l.id} className="glass-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{l.name} · <a href={`tel:${l.phone}`} className="text-brand underline">{l.phone}</a></p>
                <p className="text-xs text-slate-500">
                  {new Date(l.createdAt).toLocaleString("en-IN")} · {l.source}
                  {l.stream && ` · ${STREAMS[l.stream]}`}
                  {l.rank && ` · rank ${l.rank} (${l.category}, ${l.year})`}
                </p>
                {l.message && <p className="mt-1 text-sm">{l.message}</p>}
              </div>
              <select value={l.status} onChange={(e) => update(l.id, { status: e.target.value })} className="input max-w-52">
                {LEAD_STATUSES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <select value={l.assignedTo || ""} onChange={(e) => update(l.id, { assignedTo: e.target.value })} className="input">
                <option value="">Unassigned</option>
                {staff.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                {l.assignedTo && !staff.some((s) => s.name === l.assignedTo) && <option value={l.assignedTo}>{l.assignedTo}</option>}
              </select>
              <input type="date" defaultValue={l.nextActionDate}
                onChange={(e) => update(l.id, { nextActionDate: e.target.value })} className="input" />
              <button onClick={() => setOpen(open === l.id ? null : l.id)} className="btn border border-brand/25 bg-white/60 text-sm">
                Activity ({(l.activities || []).length})
              </button>
            </div>

            {open === l.id && (
              <div className="mt-3 space-y-2 glass-card p-3 text-sm">
                {(l.activities || []).map((a, i) => (
                  <p key={i}><span className="text-xs text-slate-500">{new Date(a.at).toLocaleString("en-IN")}{a.by && ` · ${a.by}`}</span><br />{a.note}</p>
                ))}
                <div className="flex gap-2">
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Log a call or outcome" className="input" />
                  <button onClick={() => addNote(l.id)} className="btn btn-accent text-sm">Add</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
