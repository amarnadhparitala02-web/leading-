import { DEFAULT_EXAM } from "@/lib/site";

// Shapes a stored college for public display. Partnership shows only when the
// admin has marked it as verified and permitted for public display.
// Each course carries the details the admin entered for this college (fees, seats, duration...).
export function publicCollege(c, courseById) {
  const details = c.courseDetails || {};
  return {
    id: c.id,
    name: c.name,
    state: c.state || "",
    district: c.district,
    address: c.address || "",
    website: c.website || "",
    summary: c.summary || "",
    description: c.description || "",
    type: c.type || "",
    established: c.established || "",
    affiliation: c.affiliation || "",
    accreditation: c.accreditation || "",
    highlights: c.highlights || [],
    facilities: c.facilities || [],
    feeNote: c.feeNote || "",
    feeVerifiedOn: c.feeVerifiedOn || "",
    partner: Boolean(c.partnership?.mou && c.partnership?.displayPublic),
    courses: (c.courseIds || [])
      .map((id) => courseById.get(id))
      .filter((x) => x && x.active)
      .map((x) => ({
        id: x.id,
        name: x.name,
        stream: x.stream,
        degree: x.degree,
        eligibility: details[x.id]?.eligibility || x.eligibility || "",
        duration: details[x.id]?.duration || "",
        fee: details[x.id]?.fee || "",
        feeVerifiedOn: details[x.id]?.feeVerifiedOn || "",
        seats: details[x.id]?.seats || "",
        note: details[x.id]?.note || "",
      })),
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
