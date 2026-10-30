"use client";

import Link from "next/link";
import { useSettings } from "@/components/SettingsProvider";
import { telHref, waHref } from "@/lib/settings";

const quick = [
  ["/", "Home"], ["/about", "About"], ["/colleges", "Colleges"], ["/rank-guidance", "Rank Checker"], ["/contact", "Contact"],
];

// Everything here (name, blurb, contact details, official links) comes from the admin's site settings.
export default function Footer() {
  const { settings: s } = useSettings();

  return (
    <footer className="on-dark relative bg-[#081634] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 text-sm md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-block rounded-xl bg-white px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt={s.name} className="h-10 w-auto" />
          </div>
          <p className="mt-4 max-w-xs text-white/75">{s.footerBlurb}</p>
        </div>

        <nav aria-label="Quick links">
          <p className="font-semibold text-accent">Quick links</p>
          <ul className="mt-3 space-y-2">
            {quick.map(([href, label]) => (
              <li key={href}><Link href={href} className="text-white/80 hover:text-white hover:underline">{label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Important links">
          <p className="font-semibold text-accent">Important links</p>
          <ul className="mt-3 space-y-2">
            {s.officialLinks.map((l) => (
              <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white hover:underline">{l.label}</a></li>
            ))}
            <li><Link href="/account" className="text-white/80 hover:text-white hover:underline">My account</Link></li>
          </ul>
        </nav>

        <div>
          <p className="font-semibold text-accent">Contact</p>
          <ul className="mt-3 space-y-2 text-white/80">
            {s.phone && <li>Phone: <a href={telHref(s)} className="underline">{s.phone}</a></li>}
            {waHref(s) && <li><a href={waHref(s)} target="_blank" rel="noopener noreferrer" className="underline">Chat on WhatsApp</a></li>}
            {s.email && <li>Email: <a href={`mailto:${s.email}`} className="underline">{s.email}</a></li>}
            {s.address && <li>{s.address}</li>}
            {s.hours && <li>Hours: {s.hours}</li>}
            {!s.phone && !s.email && !s.address && <li>{s.city}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-white/70">
          <p>© 2026 {s.name}. All rights reserved.</p>
          <p className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms &amp; Conditions</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
