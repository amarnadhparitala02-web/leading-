"use client";

import { useEffect, useState } from "react";
import { api } from "@/components/admin/api";
import Dashboard from "@/components/admin/Dashboard";
import Leads from "@/components/admin/Leads";
import Colleges from "@/components/admin/Colleges";
import Courses from "@/components/admin/Courses";
import Cutoffs from "@/components/admin/Cutoffs";
import Users from "@/components/admin/Users";
import Photos from "@/components/admin/Photos";
import Students from "@/components/admin/Students";

// adminOnly tabs are hidden from staff accounts (the APIs enforce this too).
const tabs = [
  { key: "dashboard", label: "Dashboard", View: Dashboard },
  { key: "leads", label: "Leads", View: Leads },
  { key: "colleges", label: "Colleges", View: Colleges, adminOnly: true },
  { key: "courses", label: "Courses", View: Courses, adminOnly: true },
  { key: "cutoffs", label: "Cutoffs", View: Cutoffs, adminOnly: true },
  { key: "photos", label: "Photos", View: Photos, adminOnly: true },
  { key: "students", label: "Students", View: Students, adminOnly: true },
  { key: "users", label: "Staff", View: Users, adminOnly: true },
];

export default function Admin() {
  const [me, setMe] = useState(undefined);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    api("/api/admin/login").then((r) => setMe(r.ok ? r.data.user : null));
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && tabs.some((x) => x.key === t)) setTab(t);
  }, []);

  async function login(e) {
    e.preventDefault();
    const r = await api("/api/admin/login", "POST", { username, password });
    if (r.ok) { setError(""); setPassword(""); setMe(r.data.user); } else setError(r.data.error || "Could not sign in");
  }

  async function logout() {
    await api("/api/admin/login", "DELETE");
    setMe(null);
    setTab("dashboard");
  }

  if (me === undefined) return <p className="p-8">Loading...</p>;

  if (!me) {
    return (
      <form onSubmit={login} className="mx-auto max-w-sm px-4 py-16 grid gap-3">
        <h1 className="text-2xl font-bold">Admin login</h1>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoComplete="username" className="input" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="input" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-brand">Sign in</button>
      </form>
    );
  }

  const visible = tabs.filter((t) => !t.adminOnly || me.role === "admin");
  const { View } = visible.find((t) => t.key === tab) || visible[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Admin</h1>
        <p className="text-sm">
          {me.name} <span className="text-slate-500">({me.role})</span>{" "}
          <button onClick={logout} className="ml-2 underline">Log out</button>
        </p>
      </div>
      <div className="mt-4 mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {visible.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${tab === t.key ? "border-b-2 border-accent text-accent" : "text-slate-600"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <View me={me} />
    </div>
  );
}
