import { currentStudent } from "@/lib/auth";
import { insert } from "@/lib/db";
import { matchRank } from "@/lib/match";
import { CATEGORIES, GENDERS, STREAMS } from "@/lib/site";
import { clean, json, normalizePhone, rateLimited, validPhone } from "@/lib/validate";

export async function POST(request) {
  if (rateLimited(request)) return json({ error: "Too many requests. Please try again in a minute." }, 429);
  const body = await request.json().catch(() => null);
  if (!body) return json({ error: "Invalid request" }, 400);

  // A signed-in student's own name and number are used, and the search is saved to their account.
  const student = await currentStudent(request);
  const name = student ? student.name : clean(body.name, 100);
  const phone = student ? student.phone : normalizePhone(body.phone);
  const stream = clean(body.stream, 20);
  const category = clean(body.category, 10);
  const gender = clean(body.gender, 10);
  const region = clean(body.region, 60);
  const year = Number(body.year);
  const rank = Number(body.rank);

  if (name.length < 2) return json({ error: "Please enter your full name" }, 400);
  if (!validPhone(phone)) return json({ error: "Enter a valid 10-digit mobile number" }, 400);
  if (!STREAMS[stream]) return json({ error: "Choose a stream" }, 400);
  if (!CATEGORIES.includes(category)) return json({ error: "Choose a category" }, 400);
  if (!GENDERS.includes(gender)) return json({ error: "Choose Boys or Girls" }, 400);
  if (!Number.isInteger(year) || year < 2015 || year > 2100) return json({ error: "Enter a valid exam year" }, 400);
  if (!Number.isInteger(rank) || rank < 1 || rank > 1_000_000) return json({ error: "Enter a valid rank" }, 400);
  if (body.privacyConsent !== true) return json({ error: "Please accept the privacy notice to continue" }, 400);

  const results = await matchRank({ stream, rank, category, gender, region });
  const followUp = body.followUpConsent === true;
  const now = new Date().toISOString();

  const search = await insert("rankSearches", {
    name, phone, year, stream, rank, category, gender, region,
    consent: { privacyAt: now, followUp },
    resultCount: results.length,
    studentId: student?.id || "",
  });

  // A student who agrees to follow-up becomes a counselling lead straight away.
  if (followUp) {
    await insert("leads", {
      name, phone, email: "", stream, year, rank, category, source: "rank-guidance",
      message: "", consent: { privacyAt: now, followUp: true },
      status: "new", assignedTo: "", nextActionDate: "", activities: [], searchId: search.id,
      studentId: student?.id || "",
    });
  }

  return json({ searchId: search.id, results, leadCreated: followUp });
}
