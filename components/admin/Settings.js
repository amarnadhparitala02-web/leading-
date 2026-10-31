"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import { SECTION_LABELS } from "@/lib/settings";

function Field({ label, hint, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-brand">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

// Everything the public site shows that is not a college, cutoff or photo lives here.
export default function Settings() {
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/admin/settings").then((r) => r.ok && setS(r.data.settings));
  }, []);

  if (!s) return <p>Loading...</p>;

  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const setHero = (k) => (e) => setS({ ...s, hero: { ...s.hero, [k]: e.target.value } });
  const setLink = (i, k, v) => setS({ ...s, officialLinks: s.officialLinks.map((l, j) => (j === i ? { ...l, [k]: v } : l)) });

  const setAbout = (k, v) => setS({ ...s, about: { ...s.about, [k]: v } });
  const setAboutRow = (k, i, f, v) => setAbout(k, s.about[k].map((r, j) => (j === i ? { ...r, [f]: v } : r)));
  const removeAboutRow = (k, i) => setAbout(k, s.about[k].filter((_, j) => j !== i));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const r = await api("/api/admin/settings", "PUT", s);
    setSaving(false);
    if (r.ok) { setS(r.data.settings); setMsg({ ok: "Saved. The website now shows these details." }); }
    else setMsg({ error: r.data.error || "Could not save" });
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-8">
      <section className="space-y-3">
        <h2 className="text-xl">Business details</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Business name"><input value={s.name} onChange={set("name")} className="input" /></Field>
          <Field label="Short name"><input value={s.short} onChange={set("short")} className="input" /></Field>
          <Field label="City"><input value={s.city} onChange={set("city")} className="input" /></Field>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Contact details</h2>
        <p className="text-sm text-slate-600">Shown in the footer and on the Contact page. The call and WhatsApp buttons appear once a number is set. Leave a field empty to hide it.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Phone number"><input value={s.phone} onChange={set("phone")} inputMode="tel" placeholder="e.g. 98XXXXXXXX" className="input" /></Field>
          <Field label="WhatsApp number" hint="Leave empty to use the phone number."><input value={s.whatsapp} onChange={set("whatsapp")} inputMode="tel" className="input" /></Field>
          <Field label="Email"><input value={s.email} onChange={set("email")} type="email" className="input" /></Field>
          <Field label="Working hours"><input value={s.hours} onChange={set("hours")} placeholder="e.g. Mon-Sat, 9am to 6pm" className="input" /></Field>
        </div>
        <Field label="Address"><textarea value={s.address} onChange={set("address")} rows={2} className="input" /></Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Homepage hero text</h2>
        <Field label="Small line above the headline"><input value={s.hero.eyebrow} onChange={setHero("eyebrow")} className="input" /></Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Headline"><input value={s.hero.headline} onChange={setHero("headline")} className="input" /></Field>
          <Field label="Highlighted ending" hint="Shown in a lighter colour after the headline."><input value={s.hero.highlight} onChange={setHero("highlight")} className="input" /></Field>
        </div>
        <Field label="Supporting text"><textarea value={s.hero.text} onChange={setHero("text")} rows={3} className="input" /></Field>
        <p className="text-xs text-slate-500">To change the hero picture, upload a photo in Media and choose &ldquo;Homepage hero image&rdquo;.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">About page</h2>
        <Field label="Students joined" hint="Shown on the About page, for example 2000+."><input value={s.about.students} onChange={(e) => setAbout("students", e.target.value)} className="input" /></Field>
        <Field label="Years of experience" hint="Shown as a large number on the About page, for example 15."><input value={s.about.years} onChange={(e) => setAbout("years", e.target.value)} className="input" /></Field>
        <Field label="About text" hint="Leave a blank line between paragraphs. If empty, the standard text is shown."><textarea value={s.about.intro} onChange={(e) => setAbout("intro", e.target.value)} rows={7} className="input" /></Field>
        <div>
          <p className="mb-1 text-sm font-medium text-brand">Videos (YouTube links)</p>
          <div className="space-y-2">
            {s.about.videos.map((v, i) => (
              <div key={i} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input value={v.title} onChange={(e) => setAboutRow("videos", i, "title", e.target.value)} placeholder="Video title" className="input" aria-label="Video title" />
                <input value={v.url} onChange={(e) => setAboutRow("videos", i, "url", e.target.value)} placeholder="https://youtu.be/..." className="input" aria-label="YouTube link" />
                <button type="button" onClick={() => removeAboutRow("videos", i)} className="px-2 text-sm text-red-600 underline">Remove</button>
              </div>
            ))}
          </div>
          {s.about.videos.length < 12 && <button type="button" onClick={() => setAbout("videos", [...s.about.videos, { title: "", url: "" }])} className="btn btn-brand mt-2 !py-1.5 text-sm">Add video</button>}
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-brand">Documents (links to PDFs or brochures)</p>
          <div className="space-y-2">
            {s.about.documents.map((d, i) => (
              <div key={i} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input value={d.label} onChange={(e) => setAboutRow("documents", i, "label", e.target.value)} placeholder="Document name" className="input" aria-label="Document name" />
                <input value={d.url} onChange={(e) => setAboutRow("documents", i, "url", e.target.value)} placeholder="https://..." className="input" aria-label="Document link" />
                <button type="button" onClick={() => removeAboutRow("documents", i)} className="px-2 text-sm text-red-600 underline">Remove</button>
              </div>
            ))}
          </div>
          {s.about.documents.length < 12 && <button type="button" onClick={() => setAbout("documents", [...s.about.documents, { label: "", url: "" }])} className="btn btn-brand mt-2 !py-1.5 text-sm">Add document</button>}
        </div>
        <p className="text-xs text-slate-500">Photos on the About page come from Media (Gallery).</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Footer</h2>
        <Field label="Short description under the logo"><textarea value={s.footerBlurb} onChange={set("footerBlurb")} rows={2} className="input" /></Field>
        <div>
          <p className="mb-1 text-sm font-medium text-brand">Important links</p>
          <div className="space-y-2">
            {s.officialLinks.map((l, i) => (
              <div key={i} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input value={l.label} onChange={(e) => setLink(i, "label", e.target.value)} placeholder="Link text" className="input" aria-label="Link text" />
                <input value={l.url} onChange={(e) => setLink(i, "url", e.target.value)} placeholder="https://..." className="input" aria-label="Link address" />
                <button type="button" onClick={() => setS({ ...s, officialLinks: s.officialLinks.filter((_, j) => j !== i) })} className="px-2 text-sm text-red-600 underline">Remove</button>
              </div>
            ))}
          </div>
          {s.officialLinks.length < 8 && (
            <button type="button" onClick={() => setS({ ...s, officialLinks: [...s.officialLinks, { label: "", url: "" }] })} className="btn btn-brand mt-2 !py-1.5 text-sm">Add link</button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Homepage sections</h2>
        <p className="text-sm text-slate-600">Tick the sections you want visitors to see. The hero and the closing call to action always show.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(SECTION_LABELS).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 rounded-lg border border-[color:var(--line)] p-3 text-sm">
              <input type="checkbox" checked={s.sections[k] !== false} onChange={(e) => setS({ ...s, sections: { ...s.sections, [k]: e.target.checked } })} />
              {label}
            </label>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 border-t border-[color:var(--line)] bg-white/95 px-5 py-3 backdrop-blur md:-mx-7 md:px-7">
        <button disabled={saving} className="btn btn-accent disabled:opacity-60">{saving ? "Saving..." : "Save settings"}</button>
        {msg?.ok && <p className="text-sm text-green-700" role="status">{msg.ok}</p>}
        {msg?.error && <p className="text-sm text-red-600" role="alert">{msg.error}</p>}
      </div>
    </form>
  );
}
