import Link from "next/link";
import AccountLink from "@/components/AccountLink";

const links = [
  { href: "/", label: "Home" },
  { href: "/rank-guidance", label: "Rank Guidance" },
  { href: "/colleges", label: "Colleges" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="glass sticky top-0 z-30 !rounded-none !border-x-0 !border-t-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
        <Link href="/" aria-label="Leading Light Educational Services - home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Leading Light Educational Services" className="h-10 w-auto rounded-md md:h-12" />
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3 py-1.5 transition hover:bg-white/70 hover:text-accent">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <AccountLink className="hidden rounded-full px-3 py-1.5 text-sm font-medium transition hover:bg-white/70 hover:text-accent md:inline" />
          <Link href="/rank-guidance" className="btn btn-accent !px-4 !py-2 text-sm">
            Check My Rank
          </Link>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-4 pb-2 text-sm font-medium md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap">
            {l.label}
          </Link>
        ))}
        <AccountLink className="whitespace-nowrap" />
      </nav>
    </header>
  );
}
