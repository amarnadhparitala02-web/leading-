export const clean = (v, max = 200) => String(v ?? "").trim().slice(0, max);

export const normalizePhone = (v) => clean(v, 20).replace(/[\s-]/g, "");
export const validPhone = (p) => /^(\+91)?[6-9]\d{9}$/.test(p);
// One form per number (10 digits) so +91 98765 43210 and 9876543210 are the same account.
export const canonicalPhone = (p) => normalizePhone(p).replace(/^\+91/, "");

const hits = new Map();

// Small in-memory limiter per IP. Resets on restart; use a shared store in production.
// Each bucket ("general" forms, "auth" logins) keeps its own count.
export function rateLimited(request, limit = 10, windowMs = 60_000, bucket = "general") {
  const ip = `${bucket}:${(request.headers.get("x-forwarded-for") || "local").split(",")[0].trim()}`;
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}

export const json = (data, status = 200) => Response.json(data, { status });
