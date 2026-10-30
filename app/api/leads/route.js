import { currentStudent } from "@/lib/auth";
import { all, insert } from "@/lib/db";
import { STREAMS } from "@/lib/site";
import { clean, json, normalizePhone, rateLimited, validPhone } from "@/lib/validate";

export async function POST(request) {
  if (rateLimited(request)) return json({ error: "Too many requests. Please try again in a minute." }, 429);
  const body = await request.json().catch(() => null);
  if (!body) return json({ error: "Invalid request" }, 400);

  let { name, phone, stream, rank, year, category } = body;
  const searchId = clean(body.searchId, 60);

  // "Request counselling" from a rank search reuses the details already given.
  if (searchId) {
    const s = (await all("rankSearches")).find((x) => x.id === searchId);
    if (!s) return json({ error: "Search not found" }, 404);
    ({ name, phone, stream, rank, year, category } = s);
  }

  // A signed-in student's own name and number are used, and the request shows in their panel.
  const student = await currentStudent(request);
  if (student) ({ name, phone } = student);
  name = clean(name, 100);
  phone = normalizePhone(phone);
  if (name.length < 2) return json({ error: "Please enter your name" }, 400);
  if (!validPhone(phone)) return json({ error: "Enter a valid 10-digit mobile number" }, 400);
  if (body.followUpConsent !== true) {
    return json({ error: "Please agree to be contacted by our counsellors" }, 400);
  }

  const now = new Date().toISOString();
  await insert("leads", {
    name,
    phone,
    email: clean(body.email, 120),
    stream: STREAMS[stream] ? stream : "",
    year: Number(year) || null,
    rank: Number(rank) || null,
    category: clean(category, 10),
    message: clean(body.message, 1000),
    source: clean(body.source, 40) || "website",
    consent: { privacyAt: now, followUp: true },
    status: "new",
    assignedTo: "",
    nextActionDate: "",
    activities: [],
    searchId,
    studentId: student?.id || "",
  });
  return json({ ok: true });
}
