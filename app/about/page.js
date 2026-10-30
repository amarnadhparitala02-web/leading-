import Gallery from "@/components/Gallery";
import { site } from "@/lib/site";

export const metadata = { title: "About | Leading Light Educational Services" };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">About {site.short}</h1>
      <p className="mt-4 text-slate-700">
        {site.name} is an education consultancy based in {site.city}. We help students and parents understand
        B.Tech and Agriculture options, compare colleges using verified historical cutoff data, and complete admission
        with confidence. We have college references and direct MOUs with partner colleges.
      </p>
      <h2 className="mt-8 text-xl font-bold">Our services</h2>
      <ul className="mt-3 list-disc pl-5 space-y-1 text-slate-700">
        <li>Rank-based college guidance</li>
        <li>One-to-one counselling for students and parents</li>
        <li>Web counselling and web options support</li>
        <li>Help with certificate verification and admission</li>
      </ul>
      <p className="mt-8 card p-4 text-sm text-slate-600">
        Founder story, team, experience and genuine student testimonials will be added here.
      </p>
      <div className="-mx-4"><Gallery /></div>
    </div>
  );
}
