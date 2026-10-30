"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

export default function Students() {
  const [students, setStudents] = useState(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => api("/api/admin/students").then((r) => r.ok && setStudents(r.data.students));
  useEffect(() => { load(); }, []);

  async function resetPassword(s) {
    const password = prompt(`New password for ${s.name} (at least 8 characters).\nTell the student privately.`);
    if (!password) return;
    const r = await api("/api/admin/students", "PATCH", { id: s.id, password });
    setMsg(r.ok ? `Password changed for ${s.name}.` : r.data.error || "Could not change password");
  }

  async function remove(s) {
    if (!confirm(`Delete ${s.name}'s account?\n\nThis also deletes their searches, saved colleges and counselling requests. It cannot be undone.`)) return;
    const r = await api(`/api/admin/students?id=${s.id}`, "DELETE");
    setMsg(r.ok ? `${s.name}'s account was deleted.` : r.data.error || "Could not delete");
    load();
  }

  if (!students) return <p>Loading...</p>;
  const shown = students.filter((s) => !q || `${s.name} ${s.phone}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or mobile number" className="input max-w-sm" />
      {msg && <p className="text-sm text-slate-700">{msg}</p>}
      {shown.length === 0 && <p className="glass-card p-6 text-slate-500">{students.length ? "No match." : "No student accounts yet."}</p>}
      <div className="space-y-2">
        {shown.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 glass-card p-3">
            <div>
              <p className="font-semibold">{s.name} · <a href={`tel:${s.phone}`} className="text-brand underline">{s.phone}</a></p>
              <p className="text-xs text-slate-500">
                Joined {new Date(s.createdAt).toLocaleDateString("en-IN")} · {s.searches} searches · {s.saved} saved · {s.requests} requests
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => resetPassword(s)} className="underline">Set password</button>
              <button onClick={() => remove(s)} className="text-red-600 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
