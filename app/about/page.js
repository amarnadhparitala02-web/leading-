"use client";

import Gallery from "@/components/Gallery";
import { useSettings } from "@/components/SettingsProvider";

export default function About() {
  const { settings: s } = useSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <p className="eyebrow">About us</p>
      <h1 className="mt-3 text-3xl md:text-4xl">About {s.short}</h1>
      <p className="mt-5 leading-relaxed text-slate-700">
        {s.name} is an education consultancy based in {s.city}. We help students and parents understand B.Tech and
        Agriculture options, compare colleges using verified historical cutoff data, and complete admission with
        confidence. We have college references and direct MOUs with partner colleges.
      </p>
      <h2 className="mt-8 text-xl">What we do</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
        <li>Rank-based college guidance</li>
        <li>One-to-one counselling for students and parents</li>
        <li>Web counselling and web options support</li>
        <li>Help with certificate verification and admission</li>
      </ul>
      <div className="-mx-4"><Gallery /></div>
    </div>
  );
}
