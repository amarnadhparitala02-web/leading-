import { guardStudent, publicStudent } from "@/lib/auth";
import { all } from "@/lib/db";
import { json } from "@/lib/validate";

// Everything the student panel shows. Only this student's own records are returned,
// and counselling requests expose status and counsellor name, never internal notes.
export async function GET(request) {
  const g = await guardStudent(request);
  if (g.error) return g.error;
  const id = g.student.id;

  const [searches, saved, leads, colleges] = await Promise.all([
    all("rankSearches"), all("saved"), all("leads"), all("colleges"),
  ]);
  const collegeById = new Map(colleges.filter((c) => c.active).map((c) => [c.id, c]));

  return json({
    student: publicStudent(g.student),
    searches: searches
      .filter((s) => s.studentId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((s) => ({ id: s.id, createdAt: s.createdAt, exam: s.exam || "", year: s.year, stream: s.stream, rank: s.rank, category: s.category, gender: s.gender, region: s.region, resultCount: s.resultCount })),
    saved: saved
      .filter((s) => s.studentId === id && collegeById.has(s.collegeId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((s) => {
        const c = collegeById.get(s.collegeId);
        return { collegeId: c.id, name: c.name, district: c.district };
      }),
    requests: leads
      .filter((l) => l.studentId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((l) => ({ id: l.id, createdAt: l.createdAt, status: l.status, assignedTo: l.assignedTo || "", nextActionDate: l.nextActionDate || "", message: l.message || "" })),
  });
}
