import Link from "next/link";
import Icon from "@/components/Icons";
import Reveal from "@/components/Reveal";

// Icon tint cycles through the palette so each service has its own colour.
const tints = ["bg-[#e4e9ff] text-moss", "bg-[#ffe1de] text-[#c8190f]", "bg-[#d6f5ec] text-[#0b7a66]", "bg-[#ece4ff] text-[#6d3fe0]", "bg-[#fff0bd] text-[#8a5a00]", "bg-[#ffe1de] text-[#c8190f]"];

export const services = [
  ["users", "Personalised counselling", "One-to-one guidance based on your stream, interests and goals."],
  ["chart", "Rank analysis", "Understand what your EAPCET rank can mean, using historical cutoffs."],
  ["building", "College suggestions", "Options that fit your rank, course and location, with verified details."],
  ["doc", "Application and document support", "Clear checklists and help preparing for each step."],
  ["shield", "Admission guidance", "Support through counselling milestones and admission confirmation."],
  ["heart", "Follow-up and support", "We stay in touch, so you are never left guessing what comes next."],
];

export function HowWeHelp() {
  return (
    <section className="bg-[#fff3c9] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <p className="eyebrow !bg-white">How we help</p>
          <h2 className="mt-4 max-w-3xl text-4xl md:text-6xl">More than guidance. <span className="hl-coral">A support system.</span></h2>
        </Reveal>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(([icon, title, text], i) => (
            <li key={title}>
              <Reveal delay={i * 70}>
                <div className="card h-full p-6">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tints[i]}`}><Icon name={icon} className="h-7 w-7" /></span>
                  <h3 className="mt-4 text-lg font-extrabold text-brand">{title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const promises = [
  "Verified college and cutoff data",
  "A transparent counselling process",
  "Realistic expectations, never false promises",
  "Recommendations that put your child first",
];

export function ForParents() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <Reveal>
        <div className="on-dark relative overflow-hidden rounded-[2.2rem] border-4 border-ink bg-gradient-to-br from-[#6d3fe0] to-[#2a45e0] p-8 shadow-[10px_10px_0_var(--ink)] md:p-12">
          <div className="blob -right-10 -top-10 h-56 w-56 bg-[#ff8f86]" aria-hidden="true" />
          <div className="relative grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="eyebrow">For parents</p>
              <h2 className="mt-4 text-4xl md:text-5xl">A big decision deserves clear information.</h2>
              <p className="mt-4 leading-relaxed text-white/90">
                We help families understand course options, college details and the admission process, so you can feel
                confident about your child&apos;s future.
              </p>
              <Link href="/contact" className="btn btn-leaf mt-6">Talk to our team</Link>
            </div>
            <ul className="space-y-3">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-3 rounded-2xl bg-white p-4 font-bold text-brand shadow-[4px_4px_0_var(--ink)]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint text-white"><Icon name="check" className="h-4 w-4" /></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="on-dark relative overflow-hidden bg-gradient-to-br from-[#1d2a8c] via-[#2a45e0] to-[#7c3aed]">
      <div className="blob -left-10 top-0 h-60 w-60 bg-[#ffc83d]" aria-hidden="true" />
      <div className="blob bottom-0 right-10 h-60 w-60 bg-[#f2483b]" style={{ animationDelay: "-5s" }} aria-hidden="true" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <div>
          <p className="eyebrow">Your future deserves the right direction</p>
          <h2 className="mt-4 text-4xl md:text-6xl">Let&apos;s plan your future <span className="text-accent">together.</span></h2>
          <p className="mt-4 max-w-xl text-lg text-white/85">Get expert guidance, explore colleges, and take the next step towards your goal.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/colleges" className="btn btn-leaf text-lg">Explore Colleges</Link>
          <Link href="/contact" className="btn btn-light text-lg">Request Counselling</Link>
        </div>
      </div>
    </section>
  );
}
