import { adminBlocked, clearCookie, currentUser, hashPassword, publicUser, sessionCookie, verifyPassword } from "@/lib/auth";
import { all, insert } from "@/lib/db";
import { clean, json, rateLimited } from "@/lib/validate";

// Who am I? Used by the admin screen to decide whether to show the login form.
export async function GET(request) {
  const user = await currentUser(request);
  return user ? json({ user: publicUser(user) }) : json({ error: "Unauthorized" }, 401);
}

export async function POST(request) {
  if (adminBlocked(request)) return json({ error: "Admin sign-in is only available on the office computer right now." }, 403);
  if (rateLimited(request, 8, 60_000, "auth")) return json({ error: "Too many attempts. Try again in a minute." }, 429);
  const body = await request.json().catch(() => ({}));
  const username = clean(body.username, 60).toLowerCase();
  const password = String(body.password ?? "");

  let users = await all("users");

  // First run: ADMIN_USERNAME (default "admin") and ADMIN_PASSWORD from .env.local create the first admin.
  const firstAdmin = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  if (users.length === 0 && process.env.ADMIN_PASSWORD && username === firstAdmin && password === process.env.ADMIN_PASSWORD) {
    await insert("users", {
      name: "Administrator", username: firstAdmin, role: "admin", active: true, passwordHash: hashPassword(password),
    });
    users = await all("users");
  }

  const user = users.find((u) => u.username === username && u.active);
  // Same message for unknown user and wrong password.
  if (!user || !verifyPassword(password, user.passwordHash)) return json({ error: "Wrong username or password" }, 401);

  const res = json({ user: publicUser(user) });
  res.headers.append("Set-Cookie", sessionCookie(user.id));
  return res;
}

export async function DELETE() {
  const res = json({ ok: true });
  res.headers.append("Set-Cookie", clearCookie);
  return res;
}
