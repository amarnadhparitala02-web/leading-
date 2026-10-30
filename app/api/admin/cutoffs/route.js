import { guard } from "@/lib/auth";
import { all, patch, remove } from "@/lib/db";
import { json } from "@/lib/validate";

export async function GET(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const [cutoffs, colleges, courses] = await Promise.all([all("cutoffs"), all("colleges"), all("courses")]);
  const college = new Map(colleges.map((c) => [c.id, c.name]));
  const course = new Map(courses.map((c) => [c.id, c.name]));
  const rows = cutoffs
    .map((c) => ({ ...c, collegeName: college.get(c.collegeId) || "?", courseName: course.get(c.courseId) || "?" }))
    .sort((a, b) => b.year - a.year || a.collegeName.localeCompare(b.collegeName));
  return json({ cutoffs: rows });
}

// Verify or un-verify a record. Only verified records feed rank guidance.
export async function PATCH(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const { id, verified } = await request.json().catch(() => ({}));
  const row = await patch("cutoffs", id, {
    verified: Boolean(verified),
    verifiedOn: verified ? new Date().toISOString().slice(0, 10) : "",
  });
  return row ? json({ cutoff: row }) : json({ error: "Not found" }, 404);
}

export async function DELETE(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const id = new URL(request.url).searchParams.get("id");
  return (await remove("cutoffs", id)) ? json({ ok: true }) : json({ error: "Not found" }, 404);
}
