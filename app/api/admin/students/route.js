import { guard, hashPassword, publicStudent } from "@/lib/auth";
import { all, patch, remove, removeWhere } from "@/lib/db";
import { json } from "@/lib/validate";

export async function GET(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const [students, searches, saved, leads] = await Promise.all([all("students"), all("rankSearches"), all("saved"), all("leads")]);
  const count = (rows, id) => rows.filter((r) => r.studentId === id).length;
  const list = students
    .map((s) => ({ ...publicStudent(s), searches: count(searches, s.id), saved: count(saved, s.id), requests: count(leads, s.id) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json({ students: list });
}

// Set a new password for a student who has forgotten theirs. Tell them the new password privately.
export async function PATCH(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const b = await request.json().catch(() => ({}));
  if (String(b.password ?? "").length < 8) return json({ error: "Password must be at least 8 characters" }, 400);
  const student = await patch("students", b.id, { passwordHash: hashPassword(String(b.password)) });
  return student ? json({ student: publicStudent(student) }) : json({ error: "Not found" }, 404);
}

// Deletes the account and everything tied to it (searches, saved colleges, counselling requests).
export async function DELETE(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const id = new URL(request.url).searchParams.get("id");
  const students = await all("students");
  if (!students.some((s) => s.id === id)) return json({ error: "Not found" }, 404);
  for (const table of ["rankSearches", "saved", "leads"]) {
    await removeWhere(table, (r) => r.studentId === id);
  }
  await remove("students", id);
  return json({ ok: true });
}
