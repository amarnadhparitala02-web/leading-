import { guard } from "@/lib/auth";
import { get, patch } from "@/lib/db";
import { LEAD_STATUSES } from "@/lib/site";
import { clean, json } from "@/lib/validate";

// Updates only the fields that were sent, on this one lead. Other leads, including ones that arrive
// from the website at the same moment, are never touched.
export async function PATCH(request, { params }) {
  const g = await guard(request);
  if (g.error) return g.error;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const lead = await get("leads", id);
  if (!lead) return json({ error: "Not found" }, 404);

  const fields = {};
  if (body.status !== undefined) {
    if (!LEAD_STATUSES.some(([k]) => k === body.status)) return json({ error: "Bad status" }, 400);
    fields.status = body.status;
  }
  if (body.assignedTo !== undefined) fields.assignedTo = clean(body.assignedTo, 80);
  if (body.nextActionDate !== undefined) fields.nextActionDate = clean(body.nextActionDate, 10);
  if (body.activity?.note) {
    fields.activities = [
      ...(lead.activities || []),
      { at: new Date().toISOString(), by: g.user.name, note: clean(body.activity.note, 1000), outcome: clean(body.activity.outcome, 80) },
    ];
  }
  const updated = await patch("leads", id, fields);
  return json({ lead: updated });
}
