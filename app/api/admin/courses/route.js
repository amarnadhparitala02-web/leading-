import { guard } from "@/lib/auth";
import { all, insert, patch, save } from "@/lib/db";
import { STREAMS } from "@/lib/site";
import { clean, json } from "@/lib/validate";

export async function GET(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  return json({ courses: await all("courses") });
}

export async function POST(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const b = await request.json().catch(() => ({}));
  const name = clean(b.name, 120);
  if (!name || !STREAMS[b.stream]) return json({ error: "Name and stream are required" }, 400);
  // Persist the seeded list first so later reads return seed + new course.
  await save("courses", await all("courses"));
  const course = await insert("courses", {
    name, stream: b.stream, degree: clean(b.degree, 40), eligibility: clean(b.eligibility, 300), active: true,
  });
  return json({ course });
}

// Permanently removes a course, its cutoff records, and its link from every college.
export async function DELETE(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const id = new URL(request.url).searchParams.get("id");
  const courses = await all("courses");
  if (!courses.some((c) => c.id === id)) return json({ error: "Not found" }, 404);

  await save("cutoffs", (await all("cutoffs")).filter((c) => c.courseId !== id));
  const colleges = await all("colleges");
  for (const c of colleges) c.courseIds = (c.courseIds || []).filter((x) => x !== id);
  await save("colleges", colleges);
  await save("courses", courses.filter((c) => c.id !== id));
  return json({ ok: true });
}

export async function PATCH(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const b = await request.json().catch(() => ({}));
  await save("courses", await all("courses"));
  const course = await patch("courses", b.id, { active: Boolean(b.active) });
  return course ? json({ course }) : json({ error: "Not found" }, 404);
}
