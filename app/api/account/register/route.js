import { hashPassword, publicStudent, studentCookie } from "@/lib/auth";
import { all, insert } from "@/lib/db";
import { canonicalPhone, clean, json, normalizePhone, rateLimited, validPhone } from "@/lib/validate";

export async function POST(request) {
  if (rateLimited(request, 8, 60_000, "auth")) return json({ error: "Too many attempts. Try again in a minute." }, 429);
  const b = await request.json().catch(() => ({}));
  const name = clean(b.name, 100);
  const raw = normalizePhone(b.phone);
  const password = String(b.password ?? "");

  if (name.length < 2) return json({ error: "Please enter your name" }, 400);
  if (!validPhone(raw)) return json({ error: "Enter a valid 10-digit mobile number" }, 400);
  if (password.length < 8) return json({ error: "Password must be at least 8 characters" }, 400);
  if (b.privacyConsent !== true) return json({ error: "Please accept the privacy notice to create an account" }, 400);

  const phone = canonicalPhone(raw);
  if ((await all("students")).some((s) => s.phone === phone)) {
    return json({ error: "An account with this mobile number already exists. Please sign in." }, 400);
  }

  const student = await insert("students", {
    name, phone, passwordHash: hashPassword(password), consent: { privacyAt: new Date().toISOString() },
  });
  const res = json({ student: publicStudent(student) });
  res.headers.append("Set-Cookie", studentCookie(student.id));
  return res;
}
