import { clearStudentCookie, guardStudent, hashPassword, publicStudent, verifyPassword } from "@/lib/auth";
import { all, patch, save } from "@/lib/db";
import { clean, json, rateLimited } from "@/lib/validate";

// Change name and/or password. Changing the password needs the current one.
export async function PATCH(request) {
  const g = await guardStudent(request);
  if (g.error) return g.error;
  const b = await request.json().catch(() => ({}));
  const fields = {};

  if (b.name !== undefined) {
    const name = clean(b.name, 100);
    if (name.length < 2) return json({ error: "Please enter your name" }, 400);
    fields.name = name;
  }
  if (b.newPassword) {
    if (rateLimited(request, 8, 60_000, "auth")) return json({ error: "Too many attempts. Try again in a minute." }, 429);
    if (!verifyPassword(String(b.currentPassword ?? ""), g.student.passwordHash)) return json({ error: "Current password is wrong" }, 400);
    if (String(b.newPassword).length < 8) return json({ error: "New password must be at least 8 characters" }, 400);
    fields.passwordHash = hashPassword(String(b.newPassword));
  }
  return json({ student: publicStudent(await patch("students", g.student.id, fields)) });
}

// Deletes the account and everything tied to it: searches, saved colleges and counselling requests.
export async function DELETE(request) {
  const g = await guardStudent(request);
  if (g.error) return g.error;
  if (rateLimited(request, 8, 60_000, "auth")) return json({ error: "Too many attempts. Try again in a minute." }, 429);
  const b = await request.json().catch(() => ({}));
  if (!verifyPassword(String(b.password ?? ""), g.student.passwordHash)) return json({ error: "Password is wrong" }, 400);

  const id = g.student.id;
  for (const table of ["rankSearches", "saved", "leads"]) {
    await save(table, (await all(table)).filter((r) => r.studentId !== id));
  }
  await save("students", (await all("students")).filter((s) => s.id !== id));

  const res = json({ ok: true });
  res.headers.append("Set-Cookie", clearStudentCookie);
  return res;
}
