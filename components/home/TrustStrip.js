import Icon from "@/components/Icons";

const steps = [
  ["chart", "1. Enter your rank", "Tell us your EAPCET rank and category."],
  ["building", "2. See your colleges", "Browse colleges and courses that may fit."],
  ["chat", "3. Talk to a counsellor", "Ask us anything, free of charge."],
];

// Three easy steps under the hero.
export default function TrustStrip() {
  return (
    <div className="bg-white">
      <ul className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
        {steps.map(([icon, title, text]) => (
          <li key={title} className="flex items-center gap-4 rounded-2xl bg-soft p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-moss shadow-sm"><Icon name={icon} className="h-6 w-6" /></span>
            <span>
              <span className="block font-bold text-brand">{title}</span>
              <span className="block text-sm text-slate-600">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
