import { guard } from "@/lib/auth";
import { all, insert, patch, remove } from "@/lib/db";
import { CATEGORIES, EXAMS } from "@/lib/site";
import { clean, json } from "@/lib/validate";

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

// Add one cutoff record by hand. The admin can mark it verified straight away (only verified
// records feed rank guidance), otherwise it waits in the list for verification.
export async function POST(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const b = await request.json().catch(() => ({}));
  const [colleges, courses] = await Promise.all([all("colleges"), all("courses")]);

  const college = colleges.find((c) => c.id === b.collegeId);
  const course = courses.find((c) => c.id === b.courseId);
  const year = Number(b.year);
  const closingRank = Number(b.closingRank);
  const gender = ["Boys", "Girls", "Any"].includes(b.gender) ? b.gender : "Any";

  if (!college) return json({ error: "Choose a college" }, 400);
  if (!course || !(college.courseIds || []).includes(course.id)) return json({ error: "Choose one of this college's courses" }, 400);
  if (!EXAMS.includes(b.exam)) return json({ error: "Choose AP EAPCET or TS EAPCET" }, 400);
  if (!CATEGORIES.includes(b.category)) return json({ error: "Choose a category" }, 400);
  if (!Number.isInteger(year) || year < 2015 || year > 2100) return json({ error: "Enter a valid year" }, 400);
  if (!Number.isInteger(closingRank) || closingRank < 1) return json({ error: "Enter a valid closing rank" }, 400);
  if (!clean(b.source, 200)) return json({ error: "Source is required (for example: TGCHE final phase cutoff PDF)" }, 400);

  const verified = b.verified === true;
  const row = await insert("cutoffs", {
    collegeId: college.id, courseId: course.id, exam: b.exam, year, round: clean(b.round, 40) || "Final",
    category: b.category, gender, closingRank, source: clean(b.source, 200),
    verified, verifiedOn: verified ? new Date().toISOString().slice(0, 10) : "",
  });
  return json({ cutoff: row });
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
