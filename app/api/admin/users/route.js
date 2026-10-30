import { guard, hashPassword, publicUser } from "@/lib/auth";
import { all, insert, patch, remove } from "@/lib/db";
import { clean, json } from "@/lib/validate";

const ROLES = ["admin", "staff"];
const MIN_PASSWORD = 8;

// Staff get names only (to assign leads); admins get the full list.
export async function GET(request) {
  const g = await guard(request);
  if (g.error) return g.error;
  const users = (await all("users")).filter((u) => u.active);
  const list = g.user.role === "admin"
    ? (await all("users")).map(publicUser)
    : users.map((u) => ({ id: u.id, name: u.name }));
  return json({ users: list, me: publicUser(g.user) });
}

export async function POST(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const b = await request.json().catch(() => ({}));
  const name = clean(b.name, 80);
  const username = clean(b.username, 60).toLowerCase();
  const password = String(b.password ?? "");

  if (name.length < 2) return json({ error: "Enter the person's name" }, 400);
  if (!/^[a-z0-9._@-]{3,60}$/.test(username)) return json({ error: "Username: 3-60 letters, numbers, and . _ @ - only" }, 400);
  if (password.length < MIN_PASSWORD) return json({ error: `Password must be at least ${MIN_PASSWORD} characters` }, 400);
  if (!ROLES.includes(b.role)) return json({ error: "Choose a role" }, 400);
  if ((await all("users")).some((u) => u.username === username)) return json({ error: "That username is taken" }, 400);

  const user = await insert("users", { name, username, role: b.role, active: true, passwordHash: hashPassword(password) });
  return json({ user: publicUser(user) });
}

// Change role, disable/enable, or set a new password.
export async function PATCH(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const b = await request.json().catch(() => ({}));
  const users = await all("users");
  const target = users.find((u) => u.id === b.id);
  if (!target) return json({ error: "Not found" }, 404);

  const fields = {};
  if (b.role !== undefined) {
    if (!ROLES.includes(b.role)) return json({ error: "Bad role" }, 400);
    fields.role = b.role;
  }
  if (b.active !== undefined) fields.active = Boolean(b.active);
  if (b.password !== undefined) {
    if (String(b.password).length < MIN_PASSWORD) return json({ error: `Password must be at least ${MIN_PASSWORD} characters` }, 400);
    fields.passwordHash = hashPassword(String(b.password));
  }

  // Never leave the site without an active admin.
  const loses = (fields.role && fields.role !== "admin") || fields.active === false;
  const otherAdmins = users.filter((u) => u.id !== target.id && u.role === "admin" && u.active);
  if (target.role === "admin" && loses && otherAdmins.length === 0) {
    return json({ error: "There must be at least one active admin" }, 400);
  }
  return json({ user: publicUser(await patch("users", target.id, fields)) });
}

export async function DELETE(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const id = new URL(request.url).searchParams.get("id");
  const users = await all("users");
  const target = users.find((u) => u.id === id);
  if (!target) return json({ error: "Not found" }, 404);
  if (target.id === g.user.id) return json({ error: "You cannot remove your own account" }, 400);
  if (target.role === "admin" && !users.some((u) => u.id !== id && u.role === "admin" && u.active)) {
    return json({ error: "There must be at least one active admin" }, 400);
  }
  await remove("users", id);
  return json({ ok: true });
}
