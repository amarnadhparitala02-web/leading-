import Link from "next/link";
import Icon from "@/components/Icons";
import { services } from "@/components/home/HelpAndParents";

export const metadata = { title: "Services | Leading Light Educational Services" };

const detail = {
  "Personalised counselling": "We listen first: your stream, interests, strengths and your family's priorities. Then we explain the options in plain language.",
  "Rank analysis": "We look at your AP EAPCET or TS EAPCET rank alongside category and historical cutoffs, and tell you honestly what is indicative and what is not.",
  "College suggestions": "A shortlist built from verified college details: location, courses and branches, and fees where they are verified and dated.",
  "Application and document support": "Checklists for certificates and forms, so nothing is missed at verification or admission.",
  "Admission guidance": "Support through counselling milestones, option entry and admission confirmation.",
  "Follow-up and support": "We check in after counselling, so you always know the next step.",
};

export default function Services() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
      <p className="eyebrow">Services</p>
      <h1 className="mt-3 max-w-3xl text-4xl md:text-5xl">Guidance that puts the student first</h1>
      <p className="mt-4 max-w-2xl text-slate-700">
        We should never make you feel pushed into a college. We help you feel informed, understood and supported.
      </p>

      <ul className="mt-10 grid gap-5 md:grid-cols-2">
        {services.map(([icon, title, text]) => (
          <li key={title} className="card flex gap-5 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/50 text-brand"><Icon name={icon} /></span>
            <div>
              <h2 className="text-xl">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
              <p className="mt-2 text-sm text-slate-700">{detail[title]}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="panel-soft mt-12 flex flex-wrap items-center justify-between gap-4 p-7">
        <p className="max-w-xl text-lg font-semibold text-brand">Ready to talk? Tell us a little about yourself and a counsellor will get in touch.</p>
        <Link href="/contact" className="btn btn-accent">Request Counselling</Link>
      </div>
    </div>
  );
}
