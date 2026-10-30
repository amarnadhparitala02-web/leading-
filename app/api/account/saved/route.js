import { guardStudent } from "@/lib/auth";
import { all, insert, save } from "@/lib/db";
import { clean, json } from "@/lib/validate";

// Ids of the colleges this student has saved (used to show the Save button state).
export async function GET(request) {
  const g = await guardStudent(request);
  if (g.error) return g.error;
  const ids = (await all("saved")).filter((s) => s.studentId === g.student.id).map((s) => s.collegeId);
  return json({ ids });
}

export async function POST(request) {
  const g = await guardStudent(request);
  if (g.error) return g.error;
  const collegeId = clean((await request.json().catch(() => ({}))).collegeId, 60);
  if (!(await all("colleges")).some((c) => c.id === collegeId && c.active)) return json({ error: "College not found" }, 404);

  const rows = await all("saved");
  if (rows.some((s) => s.studentId === g.student.id && s.collegeId === collegeId)) return json({ ok: true });
  // Keep each student's shortlist to a sensible size.
  if (rows.filter((s) => s.studentId === g.student.id).length >= 50) return json({ error: "You can save up to 50 colleges" }, 400);
  await insert("saved", { studentId: g.student.id, collegeId });
  return json({ ok: true });
}

export async function DELETE(request) {
  const g = await guardStudent(request);
  if (g.error) return g.error;
  const collegeId = new URL(request.url).searchParams.get("collegeId");
  const rows = await all("saved");
  await save("saved", rows.filter((s) => !(s.studentId === g.student.id && s.collegeId === collegeId)));
  return json({ ok: true });
}
