import { all } from "@/lib/db";
import { DEFAULT_EXAM } from "@/lib/site";

// Matches a rank against verified historical cutoffs only. Never invents data:
// if there are no verified records, the result list is simply empty.
export async function matchRank({ exam = DEFAULT_EXAM, stream, rank, category, gender, region }) {
  const [cutoffs, colleges, courses] = await Promise.all([all("cutoffs"), all("colleges"), all("courses")]);
  const collegeById = new Map(colleges.filter((c) => c.active).map((c) => [c.id, c]));
  const courseById = new Map(courses.filter((c) => c.active && c.stream === stream).map((c) => [c.id, c]));

  // Keep the latest year per college + course, and the highest closing rank (final round) within it.
  const latest = new Map();
  for (const c of cutoffs) {
    if (!c.verified || c.category !== category) continue;
    if ((c.exam || DEFAULT_EXAM) !== exam) continue;
    if (c.gender !== "Any" && c.gender !== gender) continue;
    if (!collegeById.has(c.collegeId) || !courseById.has(c.courseId)) continue;
    const key = `${c.collegeId}|${c.courseId}`;
    const cur = latest.get(key);
    if (!cur || c.year > cur.year || (c.year === cur.year && c.closingRank > cur.closingRank)) latest.set(key, c);
  }

  const results = [];
  for (const c of latest.values()) {
    const college = collegeById.get(c.collegeId);
    if (region && !`${college.district} ${college.state || ""} ${college.address}`.toLowerCase().includes(region.toLowerCase())) continue;
    const label = rank <= c.closingRank ? "Potential match" : rank <= c.closingRank * 1.1 ? "Borderline" : null;
    if (!label) continue;
    results.push({
      collegeId: college.id,
      college: college.name,
      district: college.district,
      state: college.state || "",
      course: courseById.get(c.courseId).name,
      closingRank: c.closingRank,
      year: c.year,
      round: c.round,
      category: c.category,
      exam: c.exam || DEFAULT_EXAM,
      source: c.source,
      demo: Boolean(c.demo),
      label,
    });
  }
  return results.sort((a, b) => a.closingRank - b.closingRank);
}
