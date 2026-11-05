import { all } from "@/lib/db";
import { expand, yearsFor } from "@/lib/cutoffs";
import { DEFAULT_EXAM } from "@/lib/site";

const BORDERLINE = 1.1; // a rank up to 10% above last year's closing rank is shown as "Borderline"
const MAX_RESULTS = 400;

// Matches a rank against verified historical cutoffs only. Never invents data:
// if there are no verified records, the result list is simply empty.
//
// How a result is chosen, so the same rank always gives the same, explainable answer:
//  * only verified records for the chosen exam, category and gender (records marked "Any" count for both);
//  * cutoffYear picks the data year ("latest" or a specific year). For each college + course the record
//    from that year is used; with "latest" it is the newest year that college + course has data for;
//  * if a year has several rounds, the final one is used (it has the highest closing rank);
//  * a closing rank is the LAST rank admitted, so rank <= closing rank is a potential match;
//  * every result also carries the other years' closing ranks (history) so a student can see the trend.
export async function matchRank({ exam = DEFAULT_EXAM, stream, rank, category, gender, region, cutoffYear = "latest" }) {
  const [cutoffs, colleges, courses] = await Promise.all([all("cutoffs"), all("colleges"), all("courses")]);
  const collegeById = new Map(colleges.filter((c) => c.active).map((c) => [c.id, c]));
  const courseById = new Map(courses.filter((c) => c.active && c.stream === stream).map((c) => [c.id, c]));
  const years = yearsFor(cutoffs, exam);
  const wanted = cutoffYear === "latest" ? null : Number(cutoffYear);

  // college + course -> year -> best (final-round) record
  const byPair = new Map();
  for (const c of expand(cutoffs)) {
    if (!c.verified || c.category !== category) continue;
    if ((c.exam || DEFAULT_EXAM) !== exam) continue;
    if (c.gender !== "Any" && c.gender !== gender) continue;
    if (!collegeById.has(c.collegeId) || !courseById.has(c.courseId)) continue;
    const key = `${c.collegeId}|${c.courseId}`;
    const perYear = byPair.get(key) || new Map();
    const cur = perYear.get(c.year);
    if (!cur || c.closingRank > cur.closingRank) perYear.set(c.year, c);
    byPair.set(key, perYear);
  }

  const results = [];
  for (const perYear of byPair.values()) {
    const c = wanted ? perYear.get(wanted) : perYear.get(Math.max(...perYear.keys()));
    if (!c) continue;
    const college = collegeById.get(c.collegeId);
    if (region && !`${college.district} ${college.state || ""} ${college.address}`.toLowerCase().includes(region.toLowerCase())) continue;
    const label = rank <= c.closingRank ? "Potential match" : rank <= c.closingRank * BORDERLINE ? "Borderline" : null;
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
      history: [...perYear.values()].sort((a, b) => b.year - a.year).map((h) => ({ year: h.year, closingRank: h.closingRank })),
    });
  }
  // Closest to the student's rank first: the most competitive college they can still reach, then easier ones.
  results.sort((a, b) => (a.label === b.label ? a.closingRank - b.closingRank : a.label === "Potential match" ? -1 : 1));
  return { results: results.slice(0, MAX_RESULTS), total: results.length, years, usedYear: wanted || years[0] || null };
}
