import { guard } from "@/lib/auth";
import { all } from "@/lib/db";
import { json } from "@/lib/validate";

export async function GET(request) {
  const g = await guard(request);
  if (g.error) return g.error;
  const [leads, searches, colleges, cutoffs, students] = await Promise.all([
    all("leads"), all("rankSearches"), all("colleges"), all("cutoffs"), all("students"),
  ]);

  const count = (rows, key) => rows.reduce((m, r) => ((m[r[key] || "unknown"] = (m[r[key] || "unknown"] || 0) + 1), m), {});

  // Enquiries per day for the last 14 days.
  const byDate = {};
  for (let i = 13; i >= 0; i--) byDate[new Date(Date.now() - i * 864e5).toISOString().slice(0, 10)] = 0;
  for (const l of leads) {
    const d = l.createdAt.slice(0, 10);
    if (d in byDate) byDate[d]++;
  }

  return json({
    totals: {
      leads: leads.length,
      rankSearches: searches.length,
      students: students.length,
      colleges: colleges.filter((c) => c.active).length,
      verifiedCutoffs: cutoffs.filter((c) => c.verified).length,
      unverifiedCutoffs: cutoffs.filter((c) => !c.verified).length,
    },
    byStatus: count(leads, "status"),
    byStream: count(leads, "stream"),
    byDate,
  });
}
