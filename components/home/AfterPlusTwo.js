import Link from "next/link";
import Icon from "@/components/Icons";
import Reveal from "@/components/Reveal";

const questions = [
  ["compass", "Which course is right for me?"],
  ["chart", "What does my EAPCET rank really mean?"],
  ["building", "Which colleges fit my rank and budget?"],
  ["doc", "What documents and steps come next?"],
];

export default function AfterPlusTwo() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <Reveal>
          <p className="eyebrow">The moment after +2</p>
          <h2 className="mt-3 text-3xl md:text-5xl">You&apos;ve completed +2. Now what?</h2>
          <p className="mt-5 leading-relaxed text-slate-700">
            Results are out, friends are discussing colleges, and many new possibilities are opening up. It&apos;s normal
            to have questions.
          </p>
          <p className="mt-3 font-semibold text-brand">You don&apos;t have to figure everything out alone.</p>
          <Link href="/about" className="btn btn-accent mt-6">Learn more</Link>
        </Reveal>

        <Reveal delay={120}>
          <div className="panel-soft p-6 md:p-8">
            <p className="text-sm font-semibold text-moss">Questions students often ask</p>
            <ul className="mt-4 space-y-3">
              {questions.map(([icon, q]) => (
                <li key={q} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/50 text-brand"><Icon name={icon} /></span>
                  <span className="font-medium text-brand">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
