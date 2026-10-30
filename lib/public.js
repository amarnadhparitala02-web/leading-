import { DEFAULT_EXAM } from "@/lib/site";

// Shapes a stored college for public display. Partnership shows only when the
// admin has marked it as verified and permitted for public display.
export function publicCollege(c, courseById) {
  return {
    id: c.id,
    name: c.name,
    state: c.state || "",
    district: c.district,
    address: c.address || "",
    website: c.website || "",
    description: c.description || "",
    facilities: c.facilities || [],
    feeNote: c.feeNote || "",
    feeVerifiedOn: c.feeVerifiedOn || "",
    partner: Boolean(c.partnership?.mou && c.partnership?.displayPublic),
    courses: (c.courseIds || [])
      .map((id) => courseById.get(id))
      .filter((x) => x && x.active)
      .map((x) => ({ id: x.id, name: x.name, stream: x.stream, degree: x.degree })),
  };
}

// The most recent verified closing ranks for a college, for cards and comparison.
// Shows the open (OC) category when available, one line per course, newest first.
export function latestCutoffs(collegeId, cutoffs, courseById, limit = 2) {
  const best = new Map();
  for (const c of cutoffs) {
    if (c.collegeId !== collegeId || !c.verified || c.category !== "OC") continue;
    const key = `${c.courseId}|${c.exam || DEFAULT_EXAM}`;
    const cur = best.get(key);
    if (!cur || c.year > cur.year || (c.year === cur.year && c.closingRank > cur.closingRank)) best.set(key, c);
  }
  return [...best.values()]
    .filter((c) => courseById.get(c.courseId))
    .sort((a, b) => b.year - a.year)
    .slice(0, limit)
    .map((c) => ({
      course: courseById.get(c.courseId).name,
      closingRank: c.closingRank,
      year: c.year,
      round: c.round,
      exam: c.exam || DEFAULT_EXAM,
      category: c.category,
      source: c.source,
      demo: Boolean(c.demo),
    }));
}
