import { clearStudentCookie, currentStudent, publicStudent, studentCookie, verifyPassword } from "@/lib/auth";
import { all } from "@/lib/db";
import { canonicalPhone, json, rateLimited } from "@/lib/validate";

// Who am I? 401 when nobody is signed in.
export async function GET(request) {
  const s = await currentStudent(request);
  return s ? json({ student: publicStudent(s) }) : json({ error: "Not signed in" }, 401);
}

export async function POST(request) {
  if (rateLimited(request, 8, 60_000, "auth")) return json({ error: "Too many attempts. Try again in a minute." }, 429);
  const b = await request.json().catch(() => ({}));
  const phone = canonicalPhone(b.phone);
  const student = (await all("students")).find((s) => s.phone === phone);
  // Same message for unknown number and wrong password.
  if (!student || !verifyPassword(String(b.password ?? ""), student.passwordHash)) {
    return json({ error: "Wrong mobile number or password" }, 401);
  }
  const res = json({ student: publicStudent(student) });
  res.headers.append("Set-Cookie", studentCookie(student.id));
  return res;
}

export async function DELETE() {
  const res = json({ ok: true });
  res.headers.append("Set-Cookie", clearStudentCookie);
  return res;
}
