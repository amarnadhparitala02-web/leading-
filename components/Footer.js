import Link from "next/link";
import { site, telHref, waHref } from "@/lib/site";

const quick = [
  ["/", "Home"], ["/about", "About"], ["/courses", "Courses"], ["/colleges", "Colleges"],
  ["/rank-guidance", "Rank Checker"], ["/services", "Services"], ["/stories", "Student Stories"], ["/contact", "Contact"],
];

// Official council websites are listed so families can check notifications themselves.
const official = [
  ["https://tgche.ac.in", "Telangana State Council of Higher Education"],
  ["https://apsche.ap.gov.in", "Andhra Pradesh State Council of Higher Education"],
];

export default function Footer() {
  return (
    <footer className="on-dark relative mt-0 bg-[#081634] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 text-sm md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-block rounded-xl bg-white px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt={site.name} className="h-10 w-auto" />
          </div>
          <p className="mt-4 max-w-xs text-white/75">
            Helping students across Andhra Pradesh and Telangana understand their options after +2, and take the next step with confidence.
          </p>
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
            {official.map(([href, label]) => (
              <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white hover:underline">{label}</a></li>
            ))}
            <li><Link href="/account" className="text-white/80 hover:text-white hover:underline">My account</Link></li>
          </ul>
        </nav>

        <div>
          <p className="font-semibold text-accent">Contact</p>
          <ul className="mt-3 space-y-2 text-white/80">
            <li>Phone: {site.phone ? <a href={telHref()} className="underline">{site.phone}</a> : "to be added"}</li>
            {waHref() && <li><a href={waHref()} target="_blank" rel="noopener noreferrer" className="underline">Chat on WhatsApp</a></li>}
            <li>Email: {site.email || "to be added"}</li>
            <li>Address: {site.address || `${site.city} (full address to be added)`}</li>
            {site.hours && <li>Hours: {site.hours}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-white/70">
          <p>© 2026 {site.name}. All rights reserved.</p>
          <p className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms &amp; Conditions</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
