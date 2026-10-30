import { guard } from "@/lib/auth";
import { all, insertMany } from "@/lib/db";
import { parseCsv } from "@/lib/csv";
import { CATEGORIES, DEFAULT_EXAM, EXAMS } from "@/lib/site";
import { clean, json } from "@/lib/validate";

const REQUIRED = ["college", "course", "year", "round", "category", "gender", "closingrank", "source"];

// CSV columns: college, course, year, round, category, gender, closingRank, source, exam (optional)
// exam is "TS EAPCET" or "AP EAPCET" and defaults to TS EAPCET when the column is missing or blank.
// College and course names must already exist. Imported rows start unverified.
export async function POST(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const { csv } = await request.json().catch(() => ({}));
  if (!csv || typeof csv !== "string") return json({ error: "No CSV provided" }, 400);

  const [header, ...lines] = parseCsv(csv);
  const cols = (header || []).map((h) => h.trim().toLowerCase());
  const missing = REQUIRED.filter((r) => !cols.includes(r));
  if (missing.length) return json({ error: `Missing columns: ${missing.join(", ")}` }, 400);

  const [colleges, courses] = await Promise.all([all("colleges"), all("courses")]);
  const collegeId = new Map(colleges.map((c) => [c.name.toLowerCase(), c.id]));
  const courseId = new Map(courses.map((c) => [c.name.toLowerCase(), c.id]));

  const good = [];
  const errors = [];
  lines.forEach((cells, i) => {
    const r = Object.fromEntries(cols.map((c, j) => [c, clean(cells[j], 200)]));
    const line = i + 2;
    const year = Number(r.year);
    const closingRank = Number(r.closingrank);
    const gender = ["boys", "girls", "any"].find((g) => g === r.gender.toLowerCase());
    const category = CATEGORIES.find((c) => c.toLowerCase() === r.category.toLowerCase());
    const exam = r.exam ? EXAMS.find((e) => e.toLowerCase().replace(/\s+/g, "") === r.exam.toLowerCase().replace(/\s+/g, "")) : DEFAULT_EXAM;
    const cId = collegeId.get(r.college.toLowerCase());
    const crId = courseId.get(r.course.toLowerCase());

    if (!cId) return errors.push(`Line ${line}: college "${r.college}" not found`);
    if (!crId) return errors.push(`Line ${line}: course "${r.course}" not found`);
    if (!exam) return errors.push(`Line ${line}: exam must be TS EAPCET or AP EAPCET`);
    if (!Number.isInteger(year) || year < 2015) return errors.push(`Line ${line}: bad year`);
    if (!Number.isInteger(closingRank) || closingRank < 1) return errors.push(`Line ${line}: bad closingRank`);
    if (!category) return errors.push(`Line ${line}: bad category "${r.category}"`);
    if (!gender) return errors.push(`Line ${line}: gender must be Boys, Girls or Any`);
    if (!r.source) return errors.push(`Line ${line}: source is required`);

    good.push({
      collegeId: cId, courseId: crId, exam, year, round: r.round, category,
      gender: gender[0].toUpperCase() + gender.slice(1), closingRank, source: r.source,
      verified: false, verifiedOn: "",
    });
  });

  if (good.length) await insertMany("cutoffs", good);
  return json({ imported: good.length, errors });
}
