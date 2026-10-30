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
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <Reveal>
          <p className="eyebrow">The moment after +2</p>
          <h2 className="mt-4 text-3xl md:text-5xl">You&apos;ve completed +2. Now what?</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Results are out, friends are discussing colleges, and many new possibilities are opening up. It&apos;s normal
            to have questions.
          </p>
          <p className="mt-3 text-lg font-semibold text-brand">You don&apos;t have to figure everything out alone.</p>
          <Link href="/about" className="btn btn-outline mt-7">Learn more about us</Link>
        </Reveal>

        <Reveal delay={100}>
          <div className="panel-soft p-6 md:p-8">
            <p className="text-sm font-semibold text-moss">Questions students often ask</p>
            <ul className="mt-4 divide-y divide-[color:var(--line)] rounded-xl bg-white shadow-sm ring-1 ring-[color:var(--line)]">
              {questions.map(([icon, q]) => (
                <li key={q} className="flex items-center gap-4 px-4 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-soft text-moss"><Icon name={icon} className="h-5 w-5" /></span>
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
