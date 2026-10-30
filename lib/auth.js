import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { all } from "@/lib/db";

const SESSION_HOURS = 12;
const STUDENT_SESSION_DAYS = 14;
const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password, stored = "") {
  const [kind, salt, hash] = stored.split("$");
  if (kind !== "scrypt" || !salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = scryptSync(password, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Staff and student sessions use different cookie names and signing scopes, so a
// student cookie can never be accepted as a staff cookie (or the other way round).
const sign = (scope, payload) => createHmac("sha256", secret()).update(`${scope}:${payload}`).digest("hex");

function makeCookie(name, scope, id, maxAgeSeconds) {
  const exp = Date.now() + maxAgeSeconds * 1000;
  const payload = `${id}.${exp}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${payload}.${sign(scope, payload)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

// Returns the id inside a valid, unexpired signed cookie, or null.
function readCookie(request, name, scope) {
  if (!secret()) return null;
  const raw = (request.headers.get("cookie") || "").split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  if (!raw) return null;
  const [id, exp, sig] = raw.slice(name.length + 1).split(".");
  if (!id || !exp || !sig || Number(exp) < Date.now()) return null;
  const expected = sign(scope, `${id}.${exp}`);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return id;
}

// When ADMIN_LOCAL_ONLY=1 (used while sharing a temporary public link), staff and admin
// access only works from this computer. A tunnel keeps its public name in the Host header, so any
// Host other than localhost is treated as outside. (Next.js adds x-forwarded-* itself, so those
// headers cannot be used as a signal.)
export function adminBlocked(request) {
  if (process.env.ADMIN_LOCAL_ONLY !== "1") return false;
  const host = (request.headers.get("host") || "").replace(/:\d+$/, "");
  return !(host === "localhost" || host === "127.0.0.1" || host === "[::1]");
}

// ---------- Staff / admin ----------
export const sessionCookie = (userId) => makeCookie("ll_session", "staff", userId, SESSION_HOURS * 3600);
export const clearCookie = "ll_session=; Path=/; HttpOnly; Max-Age=0";

// Returns the signed-in, active staff user for this request, or null.
export async function currentUser(request) {
  if (adminBlocked(request)) return null;
  const id = readCookie(request, "ll_session", "staff");
  if (!id) return null;
  // Looking the user up on every request means removing or disabling them takes effect at once.
  return (await all("users")).find((u) => u.id === id && u.active) || null;
}

// level "staff" = any signed-in user, "admin" = admins only.
// Returns { user } on success or { error: Response } to return straight away.
export async function guard(request, level = "staff") {
  const user = await currentUser(request);
  if (!user) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  if (level === "admin" && user.role !== "admin") {
    return { error: Response.json({ error: "Admins only" }, { status: 403 }) };
  }
  return { user };
}

export const publicUser = (u) => ({ id: u.id, name: u.name, username: u.username, role: u.role, active: u.active, createdAt: u.createdAt });

// ---------- Students and parents ----------
export const studentCookie = (studentId) => makeCookie("ll_student", "student", studentId, STUDENT_SESSION_DAYS * 86400);
export const clearStudentCookie = "ll_student=; Path=/; HttpOnly; Max-Age=0";

export async function currentStudent(request) {
  const id = readCookie(request, "ll_student", "student");
  if (!id) return null;
  return (await all("students")).find((s) => s.id === id) || null;
}

export async function guardStudent(request) {
  const student = await currentStudent(request);
  if (!student) return { error: Response.json({ error: "Please sign in" }, { status: 401 }) };
  return { student };
}

export const publicStudent = (s) => ({ id: s.id, name: s.name, phone: s.phone, createdAt: s.createdAt });
