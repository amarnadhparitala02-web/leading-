"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";
import Tilt from "@/components/Tilt";

export default function FeaturedColleges() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch("/api/colleges?partner=1")
      .then((r) => r.json())
      .then((d) => setList(d.colleges.slice(0, 6)))
      .catch(() => {});
  }, []);

  // Only verified, publicly permitted partners are listed. Hide the section when there are none.
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Our network</p>
        <h2 className="mt-1 text-3xl font-extrabold">Partner colleges</h2>
      </Reveal>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" style={{ perspective: "1200px" }}>
        {list.map((c, i) => (
          <Reveal key={c.id} delay={i * 80}>
            <Tilt className="h-full">
              <Link href={`/colleges/${c.id}`} className="glass-card block h-full p-5">
                <p className="font-bold">{c.name}</p>
                <p className="text-sm text-slate-600">{c.district}</p>
              </Link>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
