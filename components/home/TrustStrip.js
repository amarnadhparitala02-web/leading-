import Icon from "@/components/Icons";

const items = [
  ["shield", "Verified cutoff data", "Year and source shown"],
  ["chart", "AP and TS EAPCET", "Indicative rank guidance"],
  ["building", "B.Tech and Agriculture", "Colleges across both states"],
  ["chat", "Free counselling", "Only when you ask for it"],
];

// A quiet trust bar under the hero.
export default function TrustStrip() {
  return (
    <div className="border-b border-[color:var(--line)] bg-white">
      <ul className="mx-auto grid max-w-6xl divide-[color:var(--line)] px-4 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
        {items.map(([icon, title, text]) => (
          <li key={title} className="flex items-center gap-3 px-2 py-5 lg:px-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-soft text-moss"><Icon name={icon} className="h-5 w-5" /></span>
            <span>
              <span className="block text-sm font-semibold text-brand">{title}</span>
              <span className="block text-xs text-slate-500">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
