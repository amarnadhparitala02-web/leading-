"use client";

import LeadForm from "@/components/LeadForm";
import { useSettings } from "@/components/SettingsProvider";
import { telHref, waHref } from "@/lib/settings";

// Contact details come from the admin's site settings. Empty fields are simply not shown.
export default function Contact() {
  const { settings: s } = useSettings();
  const rows = [
    ["Phone", s.phone && <a key="p" href={telHref(s)} className="text-moss underline">{s.phone}</a>],
    ["Email", s.email && <a key="e" href={`mailto:${s.email}`} className="text-moss underline">{s.email}</a>],
    ["Address", s.address],
    ["Working hours", s.hours],
  ].filter(([, v]) => v);

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2 md:py-16">
      <div>
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 text-3xl md:text-4xl">Talk to our team</h1>
        <p className="mt-3 text-slate-600">Visit our {s.city} office or request a counselling call.</p>
        {rows.length > 0 ? (
          <dl className="mt-6 space-y-4 text-sm">
            {rows.map(([label, value]) => (
              <div key={label}><dt className="font-semibold text-brand">{label}</dt><dd className="text-slate-700">{value}</dd></div>
            ))}
          </dl>
        ) : (
          <p className="panel-soft mt-6 p-4 text-sm text-slate-600">Use the form to reach us and a counsellor will get back to you.</p>
        )}
        {(telHref(s) || waHref(s)) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {telHref(s) && <a href={telHref(s)} className="btn btn-outline">Call us</a>}
            {waHref(s) && (
              <a href={waHref(s)} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white">Chat on WhatsApp</a>
            )}
          </div>
        )}
      </div>
      <div className="card p-6">
        <h2 className="mb-3 text-lg">Request counselling</h2>
        <LeadForm source="contact" />
      </div>
    </div>
  );
}
