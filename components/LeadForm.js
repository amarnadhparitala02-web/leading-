"use client";

import Link from "next/link";
import { useState } from "react";
import { STREAMS } from "@/lib/site";

export default function LeadForm({ source = "website", compact = false }) {
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setState("sending");
    setError("");
    const f = new FormData(e.currentTarget);
    const data = Object.fromEntries(f);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, followUpConsent: f.get("followUpConsent") === "on", source }),
    });
    if (res.ok) setState("done");
    else {
      setError((await res.json().catch(() => ({}))).error || "Something went wrong");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-green-800">
        <p className="font-semibold">Thank you! Your request is registered.</p>
        <p className="text-sm mt-1">A counsellor will contact you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <input name="name" required placeholder="Student name" className="input" />
      <input name="phone" required inputMode="tel" placeholder="Mobile number" className="input" />
      {!compact && <input name="email" type="email" placeholder="Email (optional)" className="input" />}
      <select name="stream" className="input" defaultValue="">
        <option value="">Interested in (optional)</option>
        {Object.entries(STREAMS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      {!compact && <textarea name="message" rows={3} placeholder="Anything we should know?" className="input" />}
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" name="followUpConsent" required className="mt-0.5" />
        <span>
          I agree that Leading Light counsellors may contact me about admission guidance. See the{" "}
          <Link href="/privacy" className="underline">privacy notice</Link>.
        </span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={state === "sending"} className="btn btn-accent disabled:opacity-60">
        {state === "sending" ? "Sending..." : "Request Counselling"}
      </button>
    </form>
  );
}
