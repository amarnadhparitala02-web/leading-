"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// "Sign in" for visitors, "My account" once signed in.
export default function AccountLink({ className = "" }) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    fetch("/api/account/session").then((r) => r.json()).then((d) => setSignedIn(Boolean(d.student))).catch(() => {});
  }, []);

  return <Link href="/account" className={className}>{signedIn ? "My account" : "Sign in"}</Link>;
}
