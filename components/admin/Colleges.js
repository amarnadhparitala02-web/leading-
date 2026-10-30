"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import { COLLEGE_TYPES, STATES, STREAMS } from "@/lib/site";

const blank = {
  name: "", state: "", district: "", address: "", website: "", summary: "", description: "",
  type: "", established: "", affiliation: "", accreditation: "", highlights: "", facilities: "",
  feeNote: "", feeVerifiedOn: "", active: true, mou: false, displayPublic: false, courseIds: [], courseDetails: {},
};

function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-brand">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

// College list and a full editor. Courses are managed inside the college: add a new course by
// name, or pick an existing one, then fill in this college's duration, seats and fee for it.
export default function Colleges() {
  const [colleges, setColleges] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [csv, setCsv] = useState("");
  const [importMsg, setImportMsg] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const load = () => api("/api/admin/colleges").then((r) => r.ok && setColleges(r.data.colleges));
  const loadCatalog = () => api("/api/admin/courses").then((r) => r.ok && setCatalog(r.data.courses));
  useEffect(() => { load(); loadCatalog(); }, []);

  // Links from the public Colleges page open the editor directly: ?tab=colleges&new=1 or &edit=<id>.
  useEffect(() => {
    if (!colleges) return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("new") === "1") edit(null);
    else if (p.get("edit")) edit(colleges.find((c) => c.id === p.get("edit")) || null);
    if (p.get("new") || p.get("edit")) window.history.replaceState(null, "", "/admin?tab=colleges");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colleges === null]);

  function edit(c) {
    setEditId(c?.id || null);
    setError("");
    setForm(c ? {
      ...blank, ...c,
      highlights: (c.highlights || []).join("\n"),
      facilities: (c.facilities || []).join(", "),
      mou: Boolean(c.partnership?.mou),
      displayPublic: Boolean(c.partnership?.displayPublic),
      courseIds: c.courseIds || [],
      courseDetails: c.courseDetails || {},
    } : { ...blank });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e) {
    e.preventDefault();
    const body = {
      ...form, id: editId,
      highlights: form.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
      facilities: form.facilities.split(",").map((s) => s.trim()).filter(Boolean),
      partnership: { mou: form.mou, displayPublic: form.mou && form.displayPublic },
    };
    const r = await api("/api/admin/colleges", editId ? "PATCH" : "POST", body);
    if (!r.ok) return setError(r.data.error || "Could not save");
    // After the first save of a new college, stay in the editor so photos can be added.
    if (!editId) { setEditId(r.data.college.id); setError(""); setForm({ ...form }); load(); return; }
    setForm(null);
    load();
  }

  async function remove(c) {
    if (!confirm(`Permanently delete "${c.name}"?\n\nThis also deletes its cutoff records and photos. To keep the data, untick Active instead.`)) return;
    const r = await api(`/api/admin/colleges?id=${c.id}`, "DELETE");
    if (!r.ok) alert(r.data.error || "Could not delete");
    load();
  }

  async function importCsv() {
    const r = await api("/api/admin/colleges/import", "POST", { csv });
    setImportMsg(r.ok ? r.data : { error: r.data.error });
    if (r.ok && !r.data.errors.length) setCsv("");
    load();
    loadCatalog();
  }

  if (form) {
    return <Editor form={form} setForm={setForm} editId={editId} catalog={catalog} reloadCatalog={loadCatalog} onSave={save} onCancel={() => { setForm(null); load(); }} error={error} />;
  }

  if (!colleges) return <p>Loading...</p>;
  const shown = colleges.filter((c) => !q || `${c.name} ${c.district} ${c.state || ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => edit(null)} className="btn btn-accent text-sm">Add college</button>
        <button onClick={() => setShowImport(!showImport)} className="btn btn-brand text-sm">Import list (CSV)</button>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search colleges" className="input ml-auto max-w-xs" aria-label="Search colleges" />
      </div>

      {showImport && (
        <div className="panel-soft mb-6 p-4">
          <h3 className="font-bold text-brand">Import many colleges at once</h3>
          <p className="mt-1 text-xs text-slate-600">
            Columns: <code>name, district, address, website, description, courses, partner, state, summary, stream</code> (the last three are optional).
            Put several courses in one cell separated by <code>;</code>. New course names are created automatically (using the <code>stream</code> column, or B.Tech if it is blank).
            Partners are not shown publicly until you tick public display on each college. Colleges already listed by the same name are skipped.
          </p>
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={5} className="input mt-2 font-mono text-xs"
            placeholder={'name,district,state,courses,summary\n"Example College",Hyderabad,Telangana,"Computer Science & Engineering;Information Technology","A short summary"'} />
          <button onClick={importCsv} disabled={!csv.trim()} className="btn btn-accent mt-2 text-sm disabled:opacity-50">Import</button>
          {importMsg?.error && <p className="mt-2 text-sm text-red-600">{importMsg.error}</p>}
          {importMsg?.imported !== undefined && (
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-green-700">Added {importMsg.imported} college(s).</p>
              {importMsg.skipped.length > 0 && <p className="text-slate-600">Skipped (already listed): {importMsg.skipped.join(", ")}</p>}
              {[...importMsg.errors, ...importMsg.warnings].slice(0, 12).map((e) => <p key={e} className="text-slate-600">{e}</p>)}
            </div>
          )}
        </div>
      )}

      {colleges.length === 0 && <p className="panel-soft p-6 text-slate-600">No colleges yet. Add one, import a list, or load demo data from the Cutoffs section.</p>}
      <div className="overflow-x-auto rounded-xl border border-[color:var(--line)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-soft text-brand">
            <tr><th scope="col" className="p-3">College</th><th scope="col" className="p-3">Location</th><th scope="col" className="p-3">Courses</th><th scope="col" className="p-3">Status</th><th scope="col" className="p-3"><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id} className="border-t border-[color:var(--line)]">
                <td className="p-3 font-semibold text-brand">{c.name} {c.demo && <b className="ml-1 text-xs text-red-700">DEMO</b>}
                  {c.partnership?.mou && <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-xs font-medium">{c.partnership.displayPublic ? "Partner" : "Partner (private)"}</span>}</td>
                <td className="p-3 text-slate-600">{[c.district, c.state].filter(Boolean).join(", ")}</td>
                <td className="p-3">{c.courseIds?.length || 0}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>{c.active ? "Visible" : "Hidden"}</span></td>
                <td className="p-3 text-right"><button onClick={() => edit(c)} className="mr-3 font-medium text-moss underline">Edit</button><button onClick={() => remove(c)} className="text-red-600 underline">Delete</button></td>
              </tr>
            ))}
            {colleges.length > 0 && shown.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">No match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Editor({ form, setForm, editId, catalog, reloadCatalog, onSave, onCancel, error }) {
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const [newCourse, setNewCourse] = useState({ name: "", stream: "btech" });
  const [pick, setPick] = useState("");
  const [courseMsg, setCourseMsg] = useState("");
  const [open, setOpen] = useState(null);

  const byId = new Map(catalog.map((c) => [c.id, c]));
  const linked = form.courseIds.map((id) => byId.get(id)).filter(Boolean);
  const available = catalog.filter((c) => !form.courseIds.includes(c.id)).sort((a, b) => a.name.localeCompare(b.name));

  function link(id) {
    if (form.courseIds.includes(id)) return;
    setForm({ ...form, courseIds: [...form.courseIds, id], courseDetails: { ...form.courseDetails, [id]: form.courseDetails[id] || {} } });
    setOpen(id);
  }
  function unlink(id) {
    const { [id]: _removed, ...rest } = form.courseDetails;
    setForm({ ...form, courseIds: form.courseIds.filter((x) => x !== id), courseDetails: rest });
  }
  const setDetail = (id, k) => (e) => setForm({ ...form, courseDetails: { ...form.courseDetails, [id]: { ...(form.courseDetails[id] || {}), [k]: e.target.value } } });

  async function addNew() {
    setCourseMsg("");
    if (!newCourse.name.trim()) return setCourseMsg("Type the course name first.");
    const r = await api("/api/admin/courses", "POST", newCourse);
    if (!r.ok) return setCourseMsg(r.data.error || "Could not add the course");
    await reloadCatalog();
    link(r.data.course.id);
    setNewCourse({ ...newCourse, name: "" });
    setCourseMsg(r.data.existed ? "That course already existed, so it was linked to this college." : "Course added to this college.");
  }

  return (
    <form onSubmit={onSave} className="space-y-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">{editId ? `Edit ${form.name || "college"}` : "Add a college"}</h2>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-moss underline">← Back to all colleges</button>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-brand">1. Basic details</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="College name *" className="md:col-span-2"><input value={form.name} onChange={set("name")} required className="input" /></Field>
          <Field label="State"><select value={form.state} onChange={set("state")} className="input"><option value="">Choose</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="District / city *"><input value={form.district} onChange={set("district")} required className="input" /></Field>
          <Field label="Address" className="md:col-span-2"><input value={form.address} onChange={set("address")} className="input" /></Field>
          <Field label="Official website" hint="Must start with https://"><input value={form.website} onChange={set("website")} placeholder="https://" className="input" /></Field>
          <Field label="Type"><select value={form.type} onChange={set("type")} className="input"><option value="">Choose</option>{COLLEGE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Year established"><input value={form.established} onChange={set("established")} inputMode="numeric" className="input" /></Field>
          <Field label="Affiliation / approvals"><input value={form.affiliation} onChange={set("affiliation")} placeholder="e.g. JNTUH, AICTE approved" className="input" /></Field>
          <Field label="Accreditation" className="md:col-span-2"><input value={form.accreditation} onChange={set("accreditation")} placeholder="e.g. NAAC A, NBA accredited programmes" className="input" /></Field>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-brand">2. Summary shown on the college page</h3>
        <Field label="Short summary" hint="Two or three sentences shown at the top of the college page and on cards."><textarea value={form.summary} onChange={set("summary")} rows={3} maxLength={500} className="input" /></Field>
        <Field label="About the college" hint="Longer description. Line breaks are kept."><textarea value={form.description} onChange={set("description")} rows={6} className="input" /></Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Highlights" hint="One per line, up to 8."><textarea value={form.highlights} onChange={set("highlights")} rows={4} className="input" /></Field>
          <Field label="Facilities" hint="Separate with commas, for example: Hostel, Library, Transport."><textarea value={form.facilities} onChange={set("facilities")} rows={4} className="input" /></Field>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-brand">3. Courses offered by this college</h3>
        <p className="text-sm text-slate-600">Visitors see these inside the college page and pick one to read its details and cutoffs. Fill in only what you have confirmed.</p>

        {linked.length === 0 && <p className="panel-soft p-4 text-sm text-slate-600">No courses added yet.</p>}
        <ul className="space-y-2">
          {linked.map((c) => {
            const d = form.courseDetails[c.id] || {};
            const isOpen = open === c.id;
            return (
              <li key={c.id} className="rounded-xl border border-[color:var(--line)]">
                <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <button type="button" onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen} className="text-left">
                    <span className="font-semibold text-brand">{c.name}</span>
                    <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-xs">{STREAMS[c.stream]}</span>
                    <span className="ml-2 text-xs text-slate-500">{[d.duration, d.seats && `${d.seats} seats`, d.fee].filter(Boolean).join(" · ") || "Add details"}</span>
                  </button>
                  <span className="flex gap-3 text-sm">
                    <button type="button" onClick={() => setOpen(isOpen ? null : c.id)} className="text-moss underline">{isOpen ? "Close" : "Edit details"}</button>
                    <button type="button" onClick={() => unlink(c.id)} className="text-red-600 underline">Remove</button>
                  </span>
                </div>
                {isOpen && (
                  <div className="grid gap-3 border-t border-[color:var(--line)] bg-soft/60 p-4 md:grid-cols-2">
                    <Field label="Duration"><input value={d.duration || ""} onChange={setDetail(c.id, "duration")} placeholder="e.g. 4 years" className="input" /></Field>
                    <Field label="Seats (intake)"><input value={d.seats || ""} onChange={setDetail(c.id, "seats")} className="input" /></Field>
                    <Field label="Annual fee" hint="Only if confirmed. Type it the way you want it shown."><input value={d.fee || ""} onChange={setDetail(c.id, "fee")} placeholder="e.g. 1,20,000 per year" className="input" /></Field>
                    <Field label="Fee verified on"><input type="date" value={d.feeVerifiedOn || ""} onChange={setDetail(c.id, "feeVerifiedOn")} className="input" /></Field>
                    <Field label="Eligibility" className="md:col-span-2"><input value={d.eligibility || ""} onChange={setDetail(c.id, "eligibility")} className="input" /></Field>
                    <Field label="Note for this course" className="md:col-span-2"><textarea value={d.note || ""} onChange={setDetail(c.id, "note")} rows={2} className="input" /></Field>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="grid gap-3 rounded-xl border border-dashed border-[#9fb8e6] p-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-medium text-brand">Add a new course</p>
            <div className="flex flex-wrap gap-2">
              <input value={newCourse.name} onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })} placeholder="Course name" className="input min-w-0 flex-1" aria-label="New course name" />
              <select value={newCourse.stream} onChange={(e) => setNewCourse({ ...newCourse, stream: e.target.value })} className="input !w-auto" aria-label="Stream">
                {Object.entries(STREAMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button type="button" onClick={addNew} className="btn btn-brand !py-2 text-sm">Add</button>
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-brand">Or choose an existing course</p>
            <div className="flex gap-2">
              <select value={pick} onChange={(e) => setPick(e.target.value)} className="input" aria-label="Existing course">
                <option value="">Choose a course</option>
                {available.map((c) => <option key={c.id} value={c.id}>{c.name} ({STREAMS[c.stream]})</option>)}
              </select>
              <button type="button" disabled={!pick} onClick={() => { link(pick); setPick(""); }} className="btn btn-brand !py-2 text-sm disabled:opacity-50">Add</button>
            </div>
          </div>
          {courseMsg && <p className="text-sm text-slate-700 md:col-span-2" role="status">{courseMsg}</p>}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-brand">4. Fees note, visibility and partnership</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="General fees note" hint="Optional, shown under the courses."><input value={form.feeNote} onChange={set("feeNote")} className="input" /></Field>
          <Field label="Fees note verified on"><input type="date" value={form.feeVerifiedOn} onChange={set("feeVerifiedOn")} className="input" /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={set("active")} /> Visible on the website</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.mou} onChange={set("mou")} /> We have a verified MOU / partnership with this college</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.displayPublic} disabled={!form.mou} onChange={set("displayPublic")} /> The college has permitted us to show the partnership publicly</label>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-brand">5. Photos</h3>
        {editId ? <CollegePhotos collegeId={editId} /> : <p className="panel-soft p-4 text-sm text-slate-600">Click &ldquo;Save college&rdquo; below first. You can then add photos here.</p>}
      </section>

      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 border-t border-[color:var(--line)] bg-white/95 px-5 py-3 backdrop-blur md:-mx-7 md:px-7">
        <button className="btn btn-accent">{editId ? "Save changes" : "Save college"}</button>
        <button type="button" onClick={onCancel} className="btn btn-brand">Close</button>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </div>
    </form>
  );
}

function CollegePhotos({ collegeId }) {
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  const load = () => api("/api/admin/photos").then((r) => r.ok && setPhotos(r.data.photos.filter((p) => p.collegeId === collegeId)));
  useEffect(() => { load(); }, [collegeId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function upload() {
    const files = [...(fileRef.current?.files || [])];
    if (!files.length) return setMsg("Choose at least one photo.");
    setBusy(true);
    setMsg("");
    for (const file of files) {
      const body = new FormData();
      body.append("file", file);
      body.append("collegeId", collegeId);
      body.append("caption", "");
      const res = await fetch("/api/admin/photos", { method: "POST", body });
      if (!res.ok) setMsg(`${file.name}: ${(await res.json().catch(() => ({}))).error || "failed"}`);
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  async function remove(p) {
    if (!confirm("Delete this photo?")) return;
    await api(`/api/admin/photos?id=${p.id}`, "DELETE");
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="input max-w-sm" aria-label="Choose photos" />
        <button type="button" onClick={upload} disabled={busy} className="btn btn-brand !py-2 text-sm disabled:opacity-60">{busy ? "Uploading..." : "Upload"}</button>
        <span className="text-xs text-slate-500">JPG, PNG or WebP, up to 5 MB. The first photo is the cover. Only upload photos you have the right to use.</span>
      </div>
      {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {photos.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-lg border border-[color:var(--line)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption || "College photo"} className="h-24 w-full object-cover" />
            <button type="button" onClick={() => remove(p)} className="w-full p-1.5 text-xs text-red-600 underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
