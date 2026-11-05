// Cutoff records come in two shapes, and everything that reads cutoffs goes through expand():
//
//  * Year-wise upload (compact): ONE record per college + course + exam + year + round, holding every
//    category and gender: { ..., ranks: { "OC": { Boys: 30248, Girls: 30248 }, "BC-A": {...} } }.
//    A full statement is about a thousand records instead of twenty thousand, so pages stay fast.
//  * Hand-entered (single): { category, gender, closingRank } for one category.
//
// expand() turns both into single-category rows: { category, gender, closingRank, ... }.
import { DEFAULT_EXAM } from "./site.js";

export function expand(cutoffs) {
  const out = [];
  for (const c of cutoffs) {
    if (!c.ranks) {
      out.push(c);
      continue;
    }
    const { ranks, ...base } = c;
    for (const [category, byGender] of Object.entries(ranks)) {
      for (const [gender, closingRank] of Object.entries(byGender || {})) {
        if (Number.isInteger(closingRank) && closingRank > 0) {
          out.push({ ...base, id: `${c.id}:${category}:${gender}`, recordId: c.id, category, gender, closingRank });
        }
      }
    }
  }
  return out;
}

// Years that have verified data for an exam, newest first.
export function yearsFor(cutoffs, exam) {
  const years = new Set();
  for (const c of cutoffs) if (c.verified && (c.exam || DEFAULT_EXAM) === exam) years.add(c.year);
  return [...years].sort((a, b) => b - a);
}

// A short text summary of a compact record, for the admin list.
export function summarizeRanks(ranks) {
  return Object.entries(ranks || {})
    .map(([cat, g]) => `${cat} ${[g.Boys != null && `B ${g.Boys}`, g.Girls != null && `G ${g.Girls}`].filter(Boolean).join(" / ")}`)
    .join(" · ");
}
