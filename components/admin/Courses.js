"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import { STREAMS } from "@/lib/site";

export default function Courses() {
  const [courses, setCourses] = useState(null);
  const [form, setForm] = useState({ name: "", stream: "btech", degree: "", eligibility: "" });
  const [error, setError] = useState("");

  const load = () => api("/api/admin/courses").then((r) => r.ok && setCourses(r.data.courses));
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    const r = await api("/api/admin/courses", "POST", form);
    if (!r.ok) return setError(r.data.error || "Could not save");
    setError("");
    setForm({ ...form, name: "", degree: "", eligibility: "" });
    load();
  }

  async function toggle(c) {
    await api("/api/admin/courses", "PATCH", { id: c.id, active: !c.active });
    load();
  }

  async function remove(c) {
    if (!confirm(`Permanently delete "${c.name}"?\n\nThis also removes it from every college and deletes its cutoff records. To keep the data, use Hide instead.`)) return;
    const r = await api(`/api/admin/courses?id=${c.id}`, "DELETE");
    if (!r.ok) alert(r.data.error || "Could not delete");
    load();
  }

  if (!courses) return <p>Loading...</p>;
  return (
    <div className="space-y-6">
      <form onSubmit={add} className="grid max-w-2xl gap-2 md:grid-cols-2">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Course name" className="input" />
        <select value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} className="input">
          {Object.entries(STREAMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="Degree (e.g. B.Tech)" className="input" />
        <input value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} placeholder="Eligibility summary" className="input" />
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        <button className="btn btn-accent text-sm md:col-span-2">Add course</button>
      </form>

      <div className="space-y-2">
        {courses.map((c) => (
          <div key={c.id} className="flex items-center justify-between glass-card p-3">
            <p className={c.active ? "" : "text-slate-400 line-through"}>{c.name} <span className="text-xs text-slate-500">· {STREAMS[c.stream]}</span></p>
            <div className="flex gap-3 text-sm">
              <button onClick={() => toggle(c)} className="underline">{c.active ? "Hide" : "Show"}</button>
              <button onClick={() => remove(c)} className="text-red-600 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
