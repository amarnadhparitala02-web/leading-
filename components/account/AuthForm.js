"use client";

import Link from "next/link";
import { useState } from "react";

export default function AuthForm({ onDone }) {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body = Object.fromEntries(f);
    if (mode === "register") body.privacyConsent = f.get("privacyConsent") === "on";
    const res = await fetch(mode === "login" ? "/api/account/session" : "/api/account/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) onDone();
    else setError(data.error || "Something went wrong");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-extrabold">{mode === "login" ? "Sign in" : "Create your account"}</h1>
      <p className="mt-2 text-slate-600">
        Keep your rank searches, saved colleges and counselling requests in one place.
      </p>

      <form onSubmit={submit} className="card mt-6 grid gap-3 p-6">
        {mode === "register" && <input name="name" required placeholder="Full name" autoComplete="name" className="input" />}
        <input name="phone" required inputMode="tel" placeholder="Mobile number" autoComplete="tel" className="input" />
        <input name="password" type="password" required minLength={mode === "register" ? 8 : undefined}
          placeholder={mode === "register" ? "Choose a password (min 8 characters)" : "Password"}
          autoComplete={mode === "register" ? "new-password" : "current-password"} className="input" />
        {mode === "register" && (
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="privacyConsent" required className="mt-1" />
            <span>
              I understand my name and mobile number are stored to run my account and are visible only to authorised
              Leading Light staff. <Link href="/privacy" className="underline">Privacy notice</Link>
            </span>
          </label>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="btn btn-accent disabled:opacity-60">
          {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        {mode === "login" ? "New here? " : "Already have an account? "}
        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="font-semibold text-brand underline">
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Forgot your password? Contact us and a counsellor can help you.
      </p>
    </div>
  );
}
