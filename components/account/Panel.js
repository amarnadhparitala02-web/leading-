"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LEAD_STATUSES, STREAMS } from "@/lib/site";

const statusLabel = Object.fromEntries(LEAD_STATUSES);
const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

async function call(path, method = "GET", body) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { ok: res.ok, data: await res.json().catch(() => ({})) };
}

const TABS = [["overview", "Overview"], ["searches", "My searches"], ["saved", "Saved colleges"], ["requests", "Counselling"], ["profile", "Profile"]];

export default function Panel({ onSignedOut }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");

  const load = () => call("/api/account/dashboard").then((r) => (r.ok ? setData(r.data) : onSignedOut()));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function logout() {
    await call("/api/account/session", "DELETE");
    onSignedOut();
  }

  if (!data) return <p className="p-8">Loading...</p>;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold">Hello, {data.student.name}</h1>
          <p className="text-sm text-slate-500">Your Leading Light account</p>
        </div>
        <button onClick={logout} className="text-sm underline">Sign out</button>
      </div>

      <div className="mt-5 mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${tab === k ? "border-b-2 border-moss text-moss" : "text-slate-600"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview data={data} go={setTab} />}
      {tab === "searches" && <Searches data={data} />}
      {tab === "saved" && <Saved data={data} reload={load} />}
      {tab === "requests" && <Requests data={data} reload={load} />}
      {tab === "profile" && <Profile data={data} reload={load} onSignedOut={onSignedOut} />}
    </div>
  );
}

function Overview({ data, go }) {
  const latest = data.requests[0];
  const tiles = [
    ["My searches", data.searches.length, "searches"],
    ["Saved colleges", data.saved.length, "saved"],
    ["Counselling requests", data.requests.length, "requests"],
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        {tiles.map(([label, n, to]) => (
          <button key={label} onClick={() => go(to)} className="card p-5 text-left hover:shadow">
            <p className="text-3xl font-bold">{n}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </button>
        ))}
      </div>
      {latest && (
        <p className="card p-4 text-sm">
          Your latest counselling request ({fmt(latest.createdAt)}) is <b>{statusLabel[latest.status] || latest.status}</b>
          {latest.assignedTo && <> with <b>{latest.assignedTo}</b></>}.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Link href="/rank-guidance" className="btn btn-accent">New rank search</Link>
        <Link href="/colleges" className="btn btn-brand">Browse colleges</Link>
      </div>
    </div>
  );
}

function Searches({ data }) {
  const [open, setOpen] = useState(null);
  const [results, setResults] = useState(null);

  async function view(s) {
    if (open === s.id) return setOpen(null);
    setOpen(s.id);
    setResults(null);
    const r = await call(`/api/account/searches/${s.id}`);
    setResults(r.ok ? r.data.results : []);
  }

  if (!data.searches.length) return <Empty text="You have not run a rank search while signed in yet." cta={["/rank-guidance", "Check my rank"]} />;
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Results are re-checked against our latest verified data each time you open them. They are not a guarantee of admission.</p>
      {data.searches.map((s) => (
        <div key={s.id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">Rank {s.rank.toLocaleString("en-IN")} · {s.exam ? `${s.exam} · ` : ""}{STREAMS[s.stream]} · {s.category} · {s.gender}</p>
              <p className="text-xs text-slate-500">{fmt(s.createdAt)} · exam year {s.year}{s.region && ` · ${s.region}`}</p>
            </div>
            <button onClick={() => view(s)} className="text-sm underline">{open === s.id ? "Hide results" : "View results"}</button>
          </div>
          {open === s.id && (
            <div className="mt-3 text-sm">
              {results === null ? "Loading..." : results.length === 0 ? (
                <p className="text-slate-600">No verified matches for these details yet.</p>
              ) : (
                <ul className="space-y-2">
                  {results.map((r, i) => (
                    <li key={i} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-2">
                      <span>
                        <Link href={`/colleges/${r.collegeId}`} className="font-medium underline">{r.college}</Link>
                        <span className="text-slate-500"> · {r.course}</span>
                      </span>
                      <span className="text-xs">closing {r.closingRank.toLocaleString("en-IN")} ({r.year}, {r.round}) · <b>{r.label}</b>{r.demo && <b className="ml-1 text-red-600">DEMO</b>}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Saved({ data, reload }) {
  async function remove(id) {
    await call(`/api/account/saved?collegeId=${id}`, "DELETE");
    reload();
  }
  if (!data.saved.length) return <Empty text="You have not saved any colleges yet. Open a college and tap Save." cta={["/colleges", "Browse colleges"]} />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.saved.map((c) => (
        <div key={c.collegeId} className="flex items-center justify-between card p-4">
          <div>
            <Link href={`/colleges/${c.collegeId}`} className="font-semibold underline">{c.name}</Link>
            <p className="text-xs text-slate-500">{c.district}</p>
          </div>
          <button onClick={() => remove(c.collegeId)} className="text-sm text-red-600 underline">Remove</button>
        </div>
      ))}
    </div>
  );
}

function Requests({ data, reload }) {
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState({ busy: false, error: "", done: false });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: "", done: false });
    const r = await call("/api/leads", "POST", { message, followUpConsent: consent, source: "account" });
    if (r.ok) { setMessage(""); setConsent(false); reload(); }
    setState({ busy: false, error: r.ok ? "" : r.data.error || "Could not send", done: r.ok });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid max-w-xl gap-2 card p-4">
        <h3 className="font-bold">Request counselling</h3>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={1000} placeholder="What would you like help with? (optional)" className="input" />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
          <span>I agree that a Leading Light counsellor may call me on my registered mobile number.</span>
        </label>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.done && <p className="text-sm text-green-700">Request sent. A counsellor will contact you shortly.</p>}
        <button disabled={state.busy || !consent} className="btn btn-accent text-sm disabled:opacity-50">Send request</button>
      </form>

      {data.requests.length === 0 ? <p className="text-sm text-slate-500">No requests yet.</p> : (
        <div className="space-y-2">
          {data.requests.map((r) => (
            <div key={r.id} className="card p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">Requested {fmt(r.createdAt)}</p>
                <span className="rounded-full bg-white/50 px-3 py-0.5 text-xs font-semibold">{statusLabel[r.status] || r.status}</span>
              </div>
              {r.message && <p className="mt-1 text-slate-600">&ldquo;{r.message}&rdquo;</p>}
              <p className="mt-1 text-xs text-slate-500">
                {r.assignedTo ? `Counsellor: ${r.assignedTo}` : "A counsellor will be assigned soon"}
                {r.nextActionDate && ` · Next step: ${fmt(r.nextActionDate)}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Profile({ data, reload, onSignedOut }) {
  const [name, setName] = useState(data.student.name);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [del, setDel] = useState("");
  const [msg, setMsg] = useState({});

  async function saveName(e) {
    e.preventDefault();
    const r = await call("/api/account/profile", "PATCH", { name });
    setMsg({ name: r.ok ? "Saved." : r.data.error });
    if (r.ok) reload();
  }

  async function changePw(e) {
    e.preventDefault();
    const r = await call("/api/account/profile", "PATCH", pw);
    setMsg({ pw: r.ok ? "Password changed." : r.data.error });
    if (r.ok) setPw({ currentPassword: "", newPassword: "" });
  }

  async function deleteAccount(e) {
    e.preventDefault();
    if (!confirm("Delete your account and all your searches, saved colleges and counselling requests? This cannot be undone.")) return;
    const r = await call("/api/account/profile", "DELETE", { password: del });
    if (r.ok) onSignedOut();
    else setMsg({ del: r.data.error });
  }

  return (
    <div className="max-w-xl space-y-8">
      <form onSubmit={saveName} className="grid gap-2">
        <h3 className="font-bold">Your details</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
        <input value={data.student.phone} disabled className="input bg-slate-100" aria-label="Mobile number" />
        <p className="text-xs text-slate-500">To change your mobile number, please contact us.</p>
        {msg.name && <p className="text-sm">{msg.name}</p>}
        <button className="btn btn-brand text-sm">Save</button>
      </form>

      <form onSubmit={changePw} className="grid gap-2">
        <h3 className="font-bold">Change password</h3>
        <input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} placeholder="Current password" autoComplete="current-password" className="input" />
        <input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder="New password (min 8 characters)" autoComplete="new-password" className="input" />
        {msg.pw && <p className="text-sm">{msg.pw}</p>}
        <button className="btn btn-brand text-sm">Change password</button>
      </form>

      <form onSubmit={deleteAccount} className="grid gap-2 rounded-xl border border-red-200 p-4">
        <h3 className="font-bold text-red-700">Delete my account</h3>
        <p className="text-xs text-slate-600">Removes your account, searches, saved colleges and counselling requests.</p>
        <input type="password" value={del} onChange={(e) => setDel(e.target.value)} placeholder="Enter your password to confirm" className="input" />
        {msg.del && <p className="text-sm text-red-600">{msg.del}</p>}
        <button disabled={!del} className="btn bg-red-600 text-sm text-white disabled:opacity-50">Delete account</button>
      </form>
    </div>
  );
}

function Empty({ text, cta }) {
  return (
    <div className="card p-6 text-sm text-slate-600">
      <p>{text}</p>
      <Link href={cta[0]} className="btn btn-accent mt-3 text-sm">{cta[1]}</Link>
    </div>
  );
}
