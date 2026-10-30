"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import { LEAD_STATUSES, STREAMS } from "@/lib/site";

export default function Dashboard() {
  const [d, setD] = useState(null);

  useEffect(() => {
    api("/api/admin/dashboard").then((r) => r.ok && setD(r.data));
  }, []);

  if (!d) return <p>Loading...</p>;
  const t = d.totals;
  const tiles = [
    ["Leads", t.leads], ["Rank searches", t.rankSearches], ["Student accounts", t.students], ["Active colleges", t.colleges],
    ["Verified cutoffs", t.verifiedCutoffs], ["Awaiting verification", t.unverifiedCutoffs],
  ];
  const max = Math.max(1, ...Object.values(d.byDate));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {tiles.map(([label, n]) => (
          <div key={label} className="glass-card p-4">
            <p className="text-2xl font-bold">{n}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-bold mb-2">Leads by status</h3>
          {LEAD_STATUSES.map(([k, label]) => (
            <p key={k} className="flex justify-between border-b border-slate-100 py-1 text-sm"><span>{label}</span><b>{d.byStatus[k] || 0}</b></p>
          ))}
          <h3 className="font-bold mt-6 mb-2">Leads by stream</h3>
          {Object.entries(d.byStream).map(([k, n]) => (
            <p key={k} className="flex justify-between border-b border-slate-100 py-1 text-sm"><span>{STREAMS[k] || "Not specified"}</span><b>{n}</b></p>
          ))}
        </div>
        <div>
          <h3 className="font-bold mb-2">Enquiries, last 14 days</h3>
          <div className="flex h-40 items-end gap-1">
            {Object.entries(d.byDate).map(([day, n]) => (
              <div key={day} className="flex-1 flex flex-col items-center justify-end" title={`${day}: ${n}`}>
                <span className="text-[10px]">{n || ""}</span>
                <div className="w-full rounded-t bg-brand" style={{ height: `${(n / max) * 100}%`, minHeight: n ? 4 : 1 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
