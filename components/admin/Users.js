"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

const blank = { name: "", username: "", password: "", role: "staff" };

export default function Users({ me }) {
  const [users, setUsers] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => api("/api/admin/users").then((r) => r.ok && setUsers(r.data.users));
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    const r = await api("/api/admin/users", "POST", form);
    if (!r.ok) return setError(r.data.error || "Could not add");
    setError("");
    setMsg(`Added ${r.data.user.name}. Share their username and password with them privately.`);
    setForm(blank);
    load();
  }

  async function update(u, body) {
    const r = await api("/api/admin/users", "PATCH", { id: u.id, ...body });
    setMsg(r.ok ? "" : r.data.error || "Could not update");
    load();
  }

  async function remove(u) {
    if (!confirm(`Remove ${u.name}? They will lose access immediately.`)) return;
    const r = await api(`/api/admin/users?id=${u.id}`, "DELETE");
    setMsg(r.ok ? `${u.name} removed.` : r.data.error || "Could not remove");
    load();
  }

  async function resetPassword(u) {
    const password = prompt(`New password for ${u.name} (at least 8 characters):`);
    if (!password) return;
    const r = await api("/api/admin/users", "PATCH", { id: u.id, password });
    setMsg(r.ok ? `Password changed for ${u.name}.` : r.data.error || "Could not change password");
  }

  if (!users) return <p>Loading...</p>;
  return (
    <div className="space-y-6">
      <form onSubmit={add} className="grid max-w-3xl gap-2 card p-4 md:grid-cols-2">
        <h3 className="font-bold md:col-span-2">Add a person</h3>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Full name" className="input" />
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required placeholder="Username (for login)" className="input" autoComplete="off" />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} placeholder="Password (min 8 characters)" className="input" autoComplete="new-password" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input">
          <option value="staff">Staff: leads and dashboard</option>
          <option value="admin">Admin: everything, including users</option>
        </select>
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        <button className="btn btn-accent text-sm md:col-span-2">Add person</button>
      </form>
      {msg && <p className="text-sm text-slate-700">{msg}</p>}

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 card p-3">
            <div>
              <p className={`font-semibold ${u.active ? "" : "text-slate-400 line-through"}`}>
                {u.name} {u.id === me.id && <span className="text-xs font-normal text-slate-500">(you)</span>}
              </p>
              <p className="text-xs text-slate-500">@{u.username} · {u.role === "admin" ? "Admin" : "Staff"}{!u.active && " · Disabled"}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <select value={u.role} onChange={(e) => update(u, { role: e.target.value })} className="input !w-auto !py-1">
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={() => resetPassword(u)} className="underline">Set password</button>
              <button onClick={() => update(u, { active: !u.active })} className="underline">{u.active ? "Disable" : "Enable"}</button>
              {u.id !== me.id && <button onClick={() => remove(u)} className="text-red-600 underline">Remove</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
