import { guardStudent } from "@/lib/auth";
import { all } from "@/lib/db";
import { matchRank } from "@/lib/match";
import { json } from "@/lib/validate";

// Re-runs one of the student's own past searches against the current verified data.
export async function GET(request, { params }) {
  const g = await guardStudent(request);
  if (g.error) return g.error;
  const { id } = await params;
  const s = (await all("rankSearches")).find((x) => x.id === id && x.studentId === g.student.id);
  if (!s) return json({ error: "Not found" }, 404);
  const results = await matchRank({ stream: s.stream, rank: s.rank, category: s.category, gender: s.gender, region: s.region });
  return json({ results });
}
