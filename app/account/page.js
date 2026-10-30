"use client";

import { useEffect, useState } from "react";
import AuthForm from "@/components/account/AuthForm";
import Panel from "@/components/account/Panel";

export default function Account() {
  const [signedIn, setSignedIn] = useState(undefined);

  const check = () => fetch("/api/account/session").then((r) => setSignedIn(r.ok)).catch(() => setSignedIn(false));
  useEffect(() => { check(); }, []);

  if (signedIn === undefined) return <p className="p-8">Loading...</p>;
  return signedIn ? <Panel onSignedOut={() => setSignedIn(false)} /> : <AuthForm onDone={() => setSignedIn(true)} />;
}
