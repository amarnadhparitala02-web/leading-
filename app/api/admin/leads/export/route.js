import { guard } from "@/lib/auth";
import { all } from "@/lib/db";
import { toCsv } from "@/lib/csv";
import { LEAD_STATUSES } from "@/lib/site";

export async function GET(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const labels = Object.fromEntries(LEAD_STATUSES);
  const leads = await all("leads");
  const csv = toCsv(
    ["Created", "Name", "Mobile", "Email", "Stream", "Exam year", "Rank", "Category", "Source", "Status", "Assigned to", "Next action", "Follow-up consent"],
    leads.map((l) => [
      l.createdAt, l.name, l.phone, l.email, l.stream, l.year ?? "", l.rank ?? "", l.category, l.source,
      labels[l.status] || l.status, l.assignedTo, l.nextActionDate, l.consent?.followUp ? "Yes" : "No",
    ])
  );
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads.csv"',
    },
  });
}
