import Link from "next/link";
import Icon from "@/components/Icons";
import Reveal from "@/components/Reveal";

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
    <section className="bg-soft py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <p className="eyebrow">How we help</p>
          <h2 className="mt-3 text-3xl md:text-5xl">More than guidance. A support system.</h2>
        </Reveal>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(([icon, title, text], i) => (
            <li key={title}>
              <Reveal delay={i * 70}>
                <div className="card h-full p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/50 text-brand"><Icon name={icon} className="h-6 w-6" /></span>
                  <h3 className="mt-4 text-lg font-bold text-brand">{title}</h3>
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
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <Reveal>
          <p className="eyebrow">For parents</p>
          <h2 className="mt-3 text-3xl md:text-5xl">A big decision deserves clear information.</h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            We help families understand course options, college details and the admission process, so you can feel
            confident about your child&apos;s future.
          </p>
          <Link href="/contact" className="btn btn-accent mt-6">Talk to our team</Link>
        </Reveal>
        <Reveal delay={120}>
          <ul className="panel-soft space-y-4 p-7">
            {promises.map((p) => (
              <li key={p} className="flex items-start gap-3 font-medium text-brand">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss text-white"><Icon name="check" className="h-4 w-4" /></span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="on-dark bg-brand">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div>
          <p className="eyebrow">Your future deserves the right direction</p>
          <h2 className="mt-3 text-3xl md:text-4xl">Let&apos;s plan your future together.</h2>
          <p className="mt-3 max-w-xl text-white/80">Get expert guidance, explore colleges, and take the next step towards your goal.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/colleges" className="btn btn-leaf">Explore Colleges</Link>
          <Link href="/contact" className="btn btn-light">Request Counselling</Link>
        </div>
      </div>
    </section>
  );
}
