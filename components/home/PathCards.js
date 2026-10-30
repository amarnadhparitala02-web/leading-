import Link from "next/link";
import Icon from "@/components/Icons";
import Reveal from "@/components/Reveal";

// Descriptions are general guidance. Exact eligibility and seats follow each year's official notification.
const paths = [
  {
    icon: "cap",
    title: "B.Tech",
    line: "Engineering, technology and innovation, to build a better tomorrow.",
    suits: "May suit MPC students who enjoy maths, physics and solving problems.",
    route: "Admission is usually through AP EAPCET or TS EAPCET counselling, by rank, branch and college choice.",
    href: "/colleges?stream=btech",
    cta: "Explore B.Tech colleges",
    bg: "bg-gradient-to-br from-[#1d2a8c] to-[#2a45e0]",
    btn: "btn-leaf",
  },
  {
    icon: "leaf",
    title: "Agriculture",
    line: "A sustainable future and a better world, grown from science.",
    suits: "May suit BiPC students interested in crops, soil, food and rural development.",
    route: "Admission is usually through the Agriculture stream of AP EAPCET or TS EAPCET counselling.",
    href: "/colleges?stream=agriculture",
    cta: "Explore Agriculture colleges",
    bg: "bg-gradient-to-br from-[#065f4e] to-[#0b7a66]",
    btn: "btn-leaf",
  },
];

export default function PathCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <Reveal>
        <p className="eyebrow">Explore your options</p>
        <h2 className="mt-4 text-4xl md:text-6xl">Choose your <span className="hl">course</span></h2>
        <p className="mt-3 text-lg text-slate-700">Your interests. Your strengths. Your future.</p>
      </Reveal>
      <div className="mt-10 grid gap-7 md:grid-cols-2">
        {paths.map((p, i) => (
          <Reveal key={p.title} delay={i * 120}>
            <div className={`on-dark flex h-full flex-col rounded-[2rem] border-4 border-ink p-8 text-white shadow-[8px_8px_0_var(--ink)] transition hover:-translate-y-1 ${p.bg}`}>
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink bg-accent text-ink shadow-[3px_3px_0_var(--ink)]"><Icon name={p.icon} className="h-8 w-8" /></span>
              <h3 className="mt-6 text-4xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{p.title}</h3>
              <p className="mt-2 text-lg text-white/90">{p.line}</p>
              <dl className="mt-5 space-y-3 text-sm">
                <div><dt className="font-extrabold text-accent">Who it may suit</dt><dd className="text-white/90">{p.suits}</dd></div>
                <div><dt className="font-extrabold text-accent">How students usually get in</dt><dd className="text-white/90">{p.route}</dd></div>
              </dl>
              <Link href={p.href} className={`btn ${p.btn} mt-7 self-start`}>
                {p.cta} <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
