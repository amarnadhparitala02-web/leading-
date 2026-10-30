"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/components/admin/api";
import Dashboard from "@/components/admin/Dashboard";
import Leads from "@/components/admin/Leads";
import Colleges from "@/components/admin/Colleges";
import Cutoffs from "@/components/admin/Cutoffs";
import Users from "@/components/admin/Users";
import Photos from "@/components/admin/Photos";
import Students from "@/components/admin/Students";
import Settings from "@/components/admin/Settings";

// Sidebar groups. adminOnly entries are hidden from staff accounts (the APIs enforce this too).
const groups = [
  { title: "Overview", items: [{ key: "dashboard", label: "Dashboard", View: Dashboard }] },
  {
    title: "Content",
    items: [
      { key: "colleges", label: "Colleges and courses", View: Colleges, adminOnly: true },
      { key: "cutoffs", label: "Cutoffs", View: Cutoffs, adminOnly: true },
      { key: "photos", label: "Media", View: Photos, adminOnly: true },
    ],
  },
  {
    title: "People",
    items: [
      { key: "leads", label: "Leads", View: Leads },
      { key: "students", label: "Students", View: Students, adminOnly: true },
      { key: "users", label: "Staff", View: Users, adminOnly: true },
    ],
  },
  { title: "Site", items: [{ key: "settings", label: "Site settings", View: Settings, adminOnly: true }] },
];
const allItems = groups.flatMap((g) => g.items);

export default function Admin() {
  const [me, setMe] = useState(undefined);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    api("/api/admin/login").then((r) => setMe(r.ok ? r.data.user : null));
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && allItems.some((x) => x.key === t)) setTab(t);
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
      <form onSubmit={login} className="card mx-auto my-16 grid max-w-sm gap-3 p-7">
        <h1 className="text-2xl">Admin login</h1>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoComplete="username" className="input" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="input" />
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button className="btn btn-accent">Sign in</button>
      </form>
    );
  }

  const visibleGroups = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.adminOnly || me.role === "admin") }))
    .filter((g) => g.items.length);
  const visible = visibleGroups.flatMap((g) => g.items);
  const active = visible.find((i) => i.key === tab) || visible[0];
  const { View } = active;

  return (
    <div className="bg-soft">
      <div className="mx-auto max-w-7xl px-4 py-6 md:flex md:gap-8 md:py-8">
        <aside className="md:w-60 md:shrink-0">
          <div className="card p-4 md:sticky md:top-20">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Signed in</p>
            <p className="font-bold text-brand">{me.name}</p>
            <p className="text-xs text-slate-500">{me.role === "admin" ? "Administrator" : "Staff"}</p>

            <nav aria-label="Admin sections" className="mt-4 flex gap-1 overflow-x-auto md:block md:space-y-4 md:overflow-visible">
              {visibleGroups.map((g) => (
                <div key={g.title} className="flex shrink-0 gap-1 md:block">
                  <p className="hidden px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 md:block">{g.title}</p>
                  <ul className="flex gap-1 md:mt-1 md:block md:space-y-0.5">
                    {g.items.map((i) => (
                      <li key={i.key}>
                        <button
                          onClick={() => setTab(i.key)}
                          aria-current={active.key === i.key ? "page" : undefined}
                          className={`w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition ${active.key === i.key ? "bg-brand text-white" : "text-slate-700 hover:bg-soft"}`}
                        >
                          {i.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="mt-4 hidden border-t border-[color:var(--line)] pt-3 text-sm md:block">
              <Link href="/" target="_blank" className="block rounded-lg px-2 py-1.5 text-moss hover:bg-soft">View website ↗</Link>
              <button onClick={logout} className="block w-full rounded-lg px-2 py-1.5 text-left text-slate-600 hover:bg-soft">Log out</button>
            </div>
          </div>
        </aside>

        <main className="mt-6 min-w-0 flex-1 md:mt-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl md:text-3xl">{active.label}</h1>
            <div className="flex gap-3 text-sm md:hidden">
              <Link href="/" target="_blank" className="text-moss underline">View website</Link>
              <button onClick={logout} className="underline">Log out</button>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[color:var(--line)] md:p-7">
            <View me={me} />
          </div>
        </main>
      </div>
    </div>
  );
}
