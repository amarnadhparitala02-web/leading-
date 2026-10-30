import Link from "next/link";
import Icon from "@/components/Icons";
import Reveal from "@/components/Reveal";

const questions = [
  ["compass", "Which course is right for me?", "bg-[#e4e9ff] text-moss"],
  ["chart", "What does my EAPCET rank really mean?", "bg-[#ffe1de] text-[#c8190f]"],
  ["building", "Which colleges fit my rank and budget?", "bg-[#d6f5ec] text-[#0b7a66]"],
  ["doc", "What documents and steps come next?", "bg-[#ece4ff] text-[#6d3fe0]"],
];

export default function AfterPlusTwo() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <Reveal>
          <p className="eyebrow">The moment after +2</p>
          <h2 className="mt-4 text-4xl md:text-6xl">
            You&apos;ve completed +2. <span className="hl-coral">Now what?</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-700">
            Results are out, friends are discussing colleges, and many new possibilities are opening up. It&apos;s normal
            to have questions.
          </p>
          <p className="mt-3 text-lg font-bold text-brand">You don&apos;t have to figure everything out alone.</p>
          <Link href="/about" className="btn btn-accent mt-7">Learn more</Link>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative rotate-1 rounded-[2rem] border-4 border-ink bg-[#fff3c9] p-6 shadow-[8px_8px_0_var(--ink)] md:p-8">
            <span className="sticker absolute -top-4 left-6 -rotate-3 text-xs">Questions students ask</span>
            <ul className="mt-3 space-y-3">
              {questions.map(([icon, q, tint]) => (
                <li key={q} className="flex items-center gap-4 rounded-2xl border-2 border-ink bg-white p-4 shadow-[3px_3px_0_var(--ink)] transition hover:-translate-y-0.5">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tint}`}><Icon name={icon} className="h-6 w-6" /></span>
                  <span className="font-bold text-brand">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
