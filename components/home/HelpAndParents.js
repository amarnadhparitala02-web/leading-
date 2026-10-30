import Link from "next/link";
import Icon from "@/components/Icons";
import Reveal from "@/components/Reveal";

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
        <div className="on-dark overflow-hidden rounded-2xl bg-brand p-8 md:p-12">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="eyebrow">For parents</p>
              <h2 className="mt-4 text-3xl md:text-4xl">A big decision deserves clear information.</h2>
              <p className="mt-4 leading-relaxed text-white/80">
                We help families understand course options, college details and the admission process, so you can feel
                confident about your child&apos;s future.
              </p>
              <Link href="/contact" className="btn btn-leaf mt-6">Talk to our team</Link>
            </div>
            <ul className="space-y-3">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-3 rounded-lg border border-white/15 bg-white/5 p-4 font-medium text-white">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15"><Icon name="check" className="h-3.5 w-3.5" /></span>
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
    <section className="on-dark relative overflow-hidden bg-brand">
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "24px 24px" }} aria-hidden="true" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <div>
          <p className="eyebrow">Your future deserves the right direction</p>
          <h2 className="mt-4 text-3xl md:text-5xl">Let&apos;s plan your future together.</h2>
          <p className="mt-4 max-w-xl text-lg text-white/80">Get expert guidance, explore colleges, and take the next step towards your goal.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn btn-accent">Request Counselling</Link>
          <Link href="/colleges" className="btn btn-light">Explore Colleges</Link>
        </div>
      </div>
    </section>
  );
}
