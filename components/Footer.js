import Link from "next/link";
import { site, telHref, waHref } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-gradient-to-br from-[#0d4f9a] to-[#082f66] text-white">
      <div className="blob -left-20 top-0 h-56 w-56 bg-[#4a93e0]" aria-hidden="true" />
      <div className="blob -right-16 bottom-0 h-56 w-56 bg-[#e0281d]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm md:grid-cols-3">
        <div>
          <div className="inline-block rounded-xl bg-white/90 px-3 py-2 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt={site.name} className="h-10 w-auto" />
          </div>
          <p className="mt-3 text-slate-100/90">
            Admission guidance for B.Tech and Agriculture students, from {site.city}.
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Explore</p>
          <Link href="/rank-guidance" className="block text-slate-100/85 hover:underline">Rank Guidance</Link>
          <Link href="/colleges" className="block text-slate-100/85 hover:underline">Colleges</Link>
          <Link href="/courses" className="block text-slate-100/85 hover:underline">Courses</Link>
          <Link href="/account" className="block text-slate-100/85 hover:underline">My account</Link>
          <Link href="/privacy" className="block text-slate-100/85 hover:underline">Privacy notice</Link>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Contact</p>
          <p className="text-slate-100/85">
            Phone:{" "}
            {site.phone ? <a href={telHref()} className="underline">{site.phone}</a> : "to be added"}
          </p>
          {waHref() && (
            <p><a href={waHref()} target="_blank" rel="noopener noreferrer" className="underline">Chat on WhatsApp</a></p>
          )}
          <p className="text-slate-100/85">Email: {site.email || "to be added"}</p>
          <p className="text-slate-100/85">Address: {site.address || `${site.city} (full address to be added)`}</p>
        </div>
      </div>
      <div className="relative border-t border-white/15 py-4 text-center text-xs text-slate-200">
        © 2026 {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
