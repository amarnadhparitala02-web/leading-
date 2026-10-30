"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import { STATES } from "@/lib/site";

const blank = {
  name: "", state: "", district: "", address: "", website: "", description: "", facilities: "",
  feeNote: "", feeVerifiedOn: "", active: true, mou: false, displayPublic: false, courseIds: [],
};

export default function Colleges() {
  const [colleges, setColleges] = useState(null);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const [csv, setCsv] = useState("");
  const [importMsg, setImportMsg] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const load = () => api("/api/admin/colleges").then((r) => r.ok && setColleges(r.data.colleges));
  useEffect(() => {
    load();
    api("/api/admin/courses").then((r) => r.ok && setCourses(r.data.courses));
  }, []);

  // Links from the public Colleges page open the form directly: ?tab=colleges&new=1 or &edit=<id>.
  useEffect(() => {
    if (!colleges) return;
    const q = new URLSearchParams(window.location.search);
    if (q.get("new") === "1") edit(null);
    else if (q.get("edit")) edit(colleges.find((c) => c.id === q.get("edit")) || null);
    if (q.get("new") || q.get("edit")) window.history.replaceState(null, "", "/admin?tab=colleges");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colleges === null]);

  async function importCsv() {
    const r = await api("/api/admin/colleges/import", "POST", { csv });
    setImportMsg(r.ok ? r.data : { error: r.data.error });
    if (r.ok && !r.data.errors.length) setCsv("");
    load();
  }

  function edit(c) {
    setEditId(c?.id || null);
    setError("");
    setForm(c ? {
      ...c, facilities: (c.facilities || []).join(", "),
      mou: Boolean(c.partnership?.mou), displayPublic: Boolean(c.partnership?.displayPublic),
    } : { ...blank });
  }

  async function submit(e) {
    e.preventDefault();
    const body = {
      ...form, id: editId,
      facilities: form.facilities.split(",").map((s) => s.trim()).filter(Boolean),
      partnership: { mou: form.mou, displayPublic: form.mou && form.displayPublic },
    };
    const r = await api("/api/admin/colleges", editId ? "PATCH" : "POST", body);
    if (!r.ok) return setError(r.data.error || "Could not save");
    setForm(null);
    load();
  }

  async function remove(c) {
    if (!confirm(`Permanently delete "${c.name}"?\n\nThis also deletes its cutoff records and photos. To keep the data, use Edit and untick Active instead.`)) return;
    const r = await api(`/api/admin/colleges?id=${c.id}`, "DELETE");
    if (!r.ok) alert(r.data.error || "Could not delete");
    load();
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const toggleCourse = (id) =>
    setForm({ ...form, courseIds: form.courseIds.includes(id) ? form.courseIds.filter((x) => x !== id) : [...form.courseIds, id] });

  if (form) {
    return (
      <form onSubmit={submit} className="grid max-w-2xl gap-3">
        <h2 className="text-lg font-bold">{editId ? "Edit college" : "Add college"}</h2>
        <input value={form.name} onChange={set("name")} required placeholder="College name" className="input" />
        <div className="grid grid-cols-2 gap-3">
          <select value={form.state} onChange={set("state")} className="input" aria-label="State">
            <option value="">State (choose)</option>
            {STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input value={form.district} onChange={set("district")} required placeholder="District" className="input" />
        </div>
        <input value={form.address} onChange={set("address")} placeholder="Address" className="input" />
        <input value={form.website} onChange={set("website")} placeholder="Official website (https://...)" className="input" />
        <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Description" className="input" />
        <input value={form.facilities} onChange={set("facilities")} placeholder="Facilities (comma separated)" className="input" />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.feeNote} onChange={set("feeNote")} placeholder="Verified fee note" className="input" />
          <input type="date" value={form.feeVerifiedOn} onChange={set("feeVerifiedOn")} className="input" />
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold">Courses offered</p>
          <div className="flex flex-wrap gap-2">
            {courses.map((c) => (
              <label key={c.id} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${form.courseIds.includes(c.id) ? "border-brand bg-brand text-white" : "border-slate-300"}`}>
                <input type="checkbox" className="hidden" checked={form.courseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} />
                {c.name}
              </label>
            ))}
          </div>
        </div>
        <label className="text-sm"><input type="checkbox" checked={form.active} onChange={set("active")} /> Active (visible on site)</label>
        <label className="text-sm"><input type="checkbox" checked={form.mou} onChange={set("mou")} /> Has verified MOU / partnership</label>
        <label className="text-sm"><input type="checkbox" checked={form.displayPublic} disabled={!form.mou} onChange={set("displayPublic")} /> Permission to show partnership publicly</label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button className="btn btn-accent">Save</button>
          <button type="button" onClick={() => setForm(null)} className="btn border border-brand/25 bg-white/60">Cancel</button>
        </div>
      </form>
    );
  }

  if (!colleges) return <p>Loading...</p>;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => edit(null)} className="btn btn-accent text-sm">Add college</button>
        <button onClick={() => setShowImport(!showImport)} className="btn border border-brand/25 bg-white/60 text-sm">Import list (CSV)</button>
      </div>

      {showImport && (
        <div className="mb-6 card p-4">
          <h3 className="font-bold">Import many colleges at once</h3>
          <p className="mt-1 text-xs text-slate-500">
            Columns: <code>name, district, address, website, description, courses, partner, state</code> (state is optional: Telangana or Andhra Pradesh). Put several courses in one
            cell separated by <code>;</code> (they must already exist under Courses). Use <code>partner</code> = yes for colleges
            you have an MOU with. Partners are not shown publicly until you tick public display on each college.
            Colleges already listed by the same name are skipped.
          </p>
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={6} className="input mt-2 font-mono text-xs"
            placeholder={'name,district,address,website,description,courses,partner\n"Example College",Hyderabad,"Road No 1",https://example.edu,"Short note","Computer Science & Engineering;Information Technology",yes'} />
          <button onClick={importCsv} disabled={!csv.trim()} className="btn btn-brand mt-2 text-sm disabled:opacity-50">Import</button>
          {importMsg?.error && <p className="mt-2 text-sm text-red-600">{importMsg.error}</p>}
          {importMsg?.imported !== undefined && (
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-green-700">Added {importMsg.imported} college(s).</p>
              {importMsg.skipped.length > 0 && <p className="text-slate-600">Skipped (already listed): {importMsg.skipped.join(", ")}</p>}
              {[...importMsg.errors, ...importMsg.warnings].slice(0, 12).map((e) => <p key={e} className="text-red-600">{e}</p>)}
            </div>
          )}
        </div>
      )}
      {colleges.length === 0 && <p className="card p-6 text-slate-500">No colleges yet. Add one, or load demo data from the Cutoffs tab.</p>}
      <div className="space-y-2">
        {colleges.map((c) => (
          <div key={c.id} className="flex items-center justify-between card p-3">
            <div>
              <p className="font-semibold">{c.name} {c.demo && <b className="text-xs text-red-600">DEMO</b>}</p>
              <p className="text-xs text-slate-500">
                {[c.district, c.state].filter(Boolean).join(", ")} · {c.courseIds?.length || 0} courses · {c.active ? "Active" : "Hidden"}
                {c.partnership?.mou && ` · Partner${c.partnership.displayPublic ? " (public)" : " (private)"}`}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => edit(c)} className="underline">Edit</button>
              <button onClick={() => remove(c)} className="text-red-600 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
