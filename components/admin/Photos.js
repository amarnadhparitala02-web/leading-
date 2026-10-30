"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "./api";

export default function Photos() {
  const [photos, setPhotos] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [collegeId, setCollegeId] = useState("");
  const [caption, setCaption] = useState("");
  const [slot, setSlot] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState("all");
  const fileRef = useRef(null);

  const load = () => api("/api/admin/photos").then((r) => r.ok && setPhotos(r.data.photos));
  useEffect(() => {
    load();
    api("/api/admin/colleges").then((r) => r.ok && setColleges(r.data.colleges));
  }, []);

  async function upload(e) {
    e.preventDefault();
    const files = [...(fileRef.current?.files || [])];
    if (!files.length) return setMsg({ error: "Choose at least one photo" });
    setBusy(true);
    setMsg(null);
    let done = 0;
    const errors = [];
    // One request per photo so a single bad file does not block the rest.
    for (const file of files) {
      const body = new FormData();
      body.append("file", file);
      body.append("collegeId", collegeId);
      body.append("caption", caption);
      body.append("slot", collegeId ? "" : slot);
      const res = await fetch("/api/admin/photos", { method: "POST", body });
      if (res.ok) done++;
      else errors.push(`${file.name}: ${(await res.json().catch(() => ({}))).error || "failed"}`);
    }
    setBusy(false);
    setMsg({ note: done ? `Uploaded ${done} photo(s).` : "", errors });
    if (fileRef.current) fileRef.current.value = "";
    setCaption("");
    load();
  }

  async function remove(p) {
    if (!confirm("Delete this photo? It disappears from the website immediately.")) return;
    await api(`/api/admin/photos?id=${p.id}`, "DELETE");
    load();
  }

  if (!photos) return <p>Loading...</p>;
  const shown = photos.filter((p) => filter === "all" || (filter === "general" ? !p.collegeId : p.collegeId === filter));

  return (
    <div className="space-y-6">
      <form onSubmit={upload} className="grid max-w-2xl gap-2 card p-4">
        <h3 className="font-bold">Upload photos</h3>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="input" />
        <select value={collegeId} onChange={(e) => setCollegeId(e.target.value)} className="input">
          <option value="">General (shows in the site gallery)</option>
          {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {!collegeId && (
          <select value={slot} onChange={(e) => setSlot(e.target.value)} className="input" aria-label="Where to show this photo">
            <option value="">Gallery photo</option>
            <option value="hero">Homepage hero image (replaces the current one)</option>
          </select>
        )}
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption / alt text (describe the photo)" className="input" maxLength={150} />
        <p className="text-xs text-slate-500">JPG, PNG or WebP, up to 5 MB each. Only upload photos you have the right to use.</p>
        <button disabled={busy} className="btn btn-accent text-sm disabled:opacity-60">{busy ? "Uploading..." : "Upload"}</button>
        {msg?.note && <p className="text-sm text-green-700">{msg.note}</p>}
        {msg?.error && <p className="text-sm text-red-600">{msg.error}</p>}
        {msg?.errors?.map((x) => <p key={x} className="text-sm text-red-600">{x}</p>)}
      </form>

      <div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input mb-3 max-w-72">
          <option value="all">All photos ({photos.length})</option>
          <option value="general">General</option>
          {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {shown.length === 0 && <p className="card p-6 text-slate-500">No photos yet.</p>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {shown.map((p) => (
            <div key={p.id} className="overflow-hidden card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption || "Uploaded photo"} className="h-32 w-full object-cover" />
              <div className="p-2 text-xs">
                <p className="truncate font-semibold">{p.collegeName}</p>
                {p.caption && <p className="truncate text-slate-500">{p.caption}</p>}
                <button onClick={() => remove(p)} className="mt-1 text-red-600 underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
