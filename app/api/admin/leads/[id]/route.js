import { guard } from "@/lib/auth";
import { all, save } from "@/lib/db";
import { LEAD_STATUSES } from "@/lib/site";
import { clean, json } from "@/lib/validate";

export async function PATCH(request, { params }) {
  const g = await guard(request);
  if (g.error) return g.error;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const leads = await all("leads");
  const lead = leads.find((l) => l.id === id);
  if (!lead) return json({ error: "Not found" }, 404);

  if (body.status !== undefined) {
    if (!LEAD_STATUSES.some(([k]) => k === body.status)) return json({ error: "Bad status" }, 400);
    lead.status = body.status;
  }
  if (body.assignedTo !== undefined) lead.assignedTo = clean(body.assignedTo, 80);
  if (body.nextActionDate !== undefined) lead.nextActionDate = clean(body.nextActionDate, 10);
  if (body.activity?.note) {
    lead.activities = [
      ...(lead.activities || []),
      { at: new Date().toISOString(), by: g.user.name, note: clean(body.activity.note, 1000), outcome: clean(body.activity.outcome, 80) },
    ];
  }
  await save("leads", leads);
  return json({ lead });
}
