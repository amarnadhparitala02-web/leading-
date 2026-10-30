import LeadForm from "@/components/LeadForm";
import { site, telHref, waHref } from "@/lib/site";

export const metadata = { title: "Contact | Leading Light Educational Services" };

export default function Contact() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 grid gap-10 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-extrabold">Contact us</h1>
        <p className="mt-2 text-slate-600">Visit our {site.city} office or request a counselling call.</p>
        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="font-semibold">Phone</dt>
            <dd>{site.phone ? <a href={telHref()} className="text-brand underline">{site.phone}</a> : "To be added"}</dd>
          </div>
          <div><dt className="font-semibold">Email</dt><dd>{site.email || "To be added"}</dd></div>
          <div><dt className="font-semibold">Address</dt><dd>{site.address || "To be added"}</dd></div>
          <div><dt className="font-semibold">Working hours</dt><dd>{site.hours || "To be added"}</dd></div>
        </dl>
        {(telHref() || waHref()) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {telHref() && <a href={telHref()} className="btn btn-brand">Call us</a>}
            {waHref() && (
              <a href={waHref()} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white">
                Chat on WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-slate-200 p-6">
        <h2 className="mb-3 text-lg font-bold">Request counselling</h2>
        <LeadForm source="contact" />
      </div>
    </div>
  );
}
