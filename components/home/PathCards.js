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
  },
  {
    icon: "leaf",
    title: "Agriculture",
    line: "A sustainable future and a better world, grown from science.",
    suits: "May suit BiPC students interested in crops, soil, food and rural development.",
    route: "Admission is usually through the Agriculture stream of AP EAPCET or TS EAPCET counselling.",
    href: "/colleges?stream=agriculture",
    cta: "Explore Agriculture colleges",
  },
];

export default function PathCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <Reveal>
        <p className="eyebrow">Explore your options</p>
        <h2 className="mt-4 text-3xl md:text-5xl">Choose your course</h2>
        <p className="mt-3 text-lg text-slate-600">Your interests. Your strengths. Your future.</p>
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {paths.map((p, i) => (
          <Reveal key={p.title} delay={i * 100}>
            <div className="card flex h-full flex-col border-t-4 border-t-brand p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white"><Icon name={p.icon} className="h-6 w-6" /></span>
              <h3 className="mt-5 text-2xl font-bold text-brand">{p.title}</h3>
              <p className="mt-1 text-slate-600">{p.line}</p>
              <dl className="mt-5 space-y-3 text-sm">
                <div><dt className="font-semibold text-brand">Who it may suit</dt><dd className="text-slate-600">{p.suits}</dd></div>
                <div><dt className="font-semibold text-brand">How students usually get in</dt><dd className="text-slate-600">{p.route}</dd></div>
              </dl>
              <Link href={p.href} className="btn btn-outline mt-7 self-start">
                {p.cta} <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
