"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AccountLink from "@/components/AccountLink";
import { useSettings } from "@/components/SettingsProvider";

// Simple navigation. Courses are shown inside each college, so there is no separate Courses page.
const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/colleges", label: "Colleges" },
  { href: "/rank-guidance", label: "Rank Checker" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const path = usePathname();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const current = (href) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));

  return (
    <header className="site-header sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
        <Link href="/" aria-label={`${settings.name}, home`} onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt={settings.name} className="h-10 w-auto rounded-md md:h-11" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link" aria-current={current(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <AccountLink className="nav-link hidden whitespace-nowrap text-sm md:inline" />
          <Link href="/rank-guidance" className="btn btn-accent whitespace-nowrap !px-4 !py-2 text-sm">Check Your Rank</Link>
          <button
            type="button"
            className="rounded-lg p-2 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Main" className="border-t border-[color:var(--line)] bg-white px-4 pb-4 pt-2 md:hidden">
          <ul className="grid grid-cols-2 gap-1 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={current(l.href) ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 font-medium ${current(l.href) ? "bg-soft text-brand" : "hover:bg-soft"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li><AccountLink className="block rounded-lg px-3 py-2.5 font-medium hover:bg-soft" /></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
