"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Save / Saved toggle. Visitors who are not signed in are sent to the account page.
export default function SaveButton({ collegeId }) {
  const [state, setState] = useState({ ready: false, signedIn: false, saved: false });

  useEffect(() => {
    fetch("/api/account/saved")
      .then((r) => r.json())
      .then((d) => ({ signedIn: Boolean(d.signedIn), saved: (d.ids || []).includes(collegeId) }))
      .catch(() => ({ signedIn: false, saved: false }))
      .then((s) => setState({ ready: true, ...s }));
  }, [collegeId]);

  async function toggle() {
    const saved = !state.saved;
    setState({ ...state, saved });
    const res = await fetch(saved ? "/api/account/saved" : `/api/account/saved?collegeId=${collegeId}`, {
      method: saved ? "POST" : "DELETE",
      headers: saved ? { "Content-Type": "application/json" } : undefined,
      body: saved ? JSON.stringify({ collegeId }) : undefined,
    });
    if (!res.ok) setState((s) => ({ ...s, saved: !saved }));
  }

  if (!state.ready) return null;
  if (!state.signedIn) {
    return <Link href="/account" className="btn btn-brand text-sm">Sign in to save</Link>;
  }
  return (
    <button onClick={toggle} className={`btn text-sm ${state.saved ? "btn-brand" : "btn-outline"}`}>
      {state.saved ? "Saved ✓" : "Save college"}
    </button>
  );
}
