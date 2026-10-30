"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

const blank = {
  displayName: "", stream: "", year: "", unsure: "", explored: "", support: "", outcome: "", quote: "",
  consentConfirmed: false, consentNote: "", published: false,
};

// Student stories follow the plan's template. Nothing is shown publicly unless the story is
// published AND the admin has confirmed the student's permission and noted how it was given.
export default function Stories() {
  const [stories, setStories] = useState(null);
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const load = () => api("/api/admin/stories").then((r) => r.ok && setStories(r.data.stories));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  function edit(s) {
    setEditId(s?.id || null);
    setError("");
    setForm(s ? { ...blank, ...s } : { ...blank });
  }

  async function submit(e) {
    e.preventDefault();
    const r = await api("/api/admin/stories", editId ? "PATCH" : "POST", { ...form, id: editId });
    if (!r.ok) return setError(r.data.error || "Could not save");
    setForm(null);
    load();
  }

  async function togglePublish(s) {
    const r = await api("/api/admin/stories", "PATCH", { ...s, published: !s.published });
    if (!r.ok) alert(r.data.error || "Could not update");
    load();
  }

  async function remove(s) {
    if (!confirm(`Delete the story from ${s.displayName}?`)) return;
    await api(`/api/admin/stories?id=${s.id}`, "DELETE");
    load();
  }

  if (form) {
    return (
      <form onSubmit={submit} className="grid max-w-2xl gap-3">
        <h2 className="text-xl">{editId ? "Edit story" : "Add a student story"}</h2>
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          Only add real stories. Get the student&apos;s permission before publishing their name, photo, rank or admission
          details. Never write a testimonial for a student.
        </p>
        <input value={form.displayName} onChange={set("displayName")} required placeholder="Name the student has approved for display" className="input" />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.stream} onChange={set("stream")} placeholder="Intermediate stream (e.g. MPC), if they agree" className="input" />
          <input value={form.year} onChange={set("year")} placeholder="Year (e.g. 2025)" className="input" />
        </div>
        <textarea value={form.unsure} onChange={set("unsure")} rows={2} placeholder="What were they unsure about after +2?" className="input" />
        <textarea value={form.explored} onChange={set("explored")} rows={2} placeholder="Course and college options they explored" className="input" />
        <textarea value={form.support} onChange={set("support")} rows={2} placeholder="How Leading Light supported the decision" className="input" />
        <input value={form.outcome} onChange={set("outcome")} placeholder="Verified admission outcome, if any (e.g. Joined B.Tech CSE)" className="input" />
        <textarea value={form.quote} onChange={set("quote")} rows={2} placeholder="A short quote, in the student's own words" className="input" />

        <fieldset className="rounded-xl border border-[color:var(--line)] p-4">
          <legend className="px-1 text-sm font-semibold text-brand">Permission</legend>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={form.consentConfirmed} onChange={set("consentConfirmed")} className="mt-1" />
            <span>The student (or their parent, if under 18) has given permission to publish this story.</span>
          </label>
          <input value={form.consentNote} onChange={set("consentNote")} placeholder="How and when permission was given (e.g. written consent, 12 Oct)" className="input mt-2" />
        </fieldset>
        <label className="text-sm"><input type="checkbox" checked={form.published} onChange={set("published")} /> Publish on the website</label>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex gap-2">
          <button className="btn btn-accent">Save</button>
          <button type="button" onClick={() => setForm(null)} className="btn btn-brand">Cancel</button>
        </div>
      </form>
    );
  }

  if (!stories) return <p>Loading...</p>;
  return (
    <div>
      <button onClick={() => edit(null)} className="btn btn-accent mb-4 text-sm">Add story</button>
      {stories.length === 0 && <p className="panel-soft p-6 text-slate-600">No stories yet. The website shows a &ldquo;coming soon&rdquo; message until you publish one.</p>}
      <div className="space-y-2">
        {stories.map((s) => (
          <div key={s.id} className="card flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <p className="font-semibold">{s.displayName} <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${s.published ? "bg-accent/60 text-brand" : "bg-slate-100 text-slate-600"}`}>{s.published ? "Published" : "Draft"}</span></p>
              <p className="text-xs text-slate-500">{[s.stream, s.year].filter(Boolean).join(" · ")}{s.consentNote && ` · Permission: ${s.consentNote}`}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => edit(s)} className="underline">Edit</button>
              <button onClick={() => togglePublish(s)} className="underline">{s.published ? "Unpublish" : "Publish"}</button>
              <button onClick={() => remove(s)} className="text-red-600 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
