import { all } from "@/lib/db";
import { photoUrl } from "@/lib/photos";
import { DEFAULT_EXAM } from "@/lib/site";
import { publicCollege } from "@/lib/public";

export async function GET(request, { params }) {
  const { id } = await params;
  const [colleges, courses, cutoffs, photos] = await Promise.all([all("colleges"), all("courses"), all("cutoffs"), all("photos")]);
  const college = colleges.find((c) => c.id === id && c.active);
  if (!college) return Response.json({ error: "Not found" }, { status: 404 });

  const courseById = new Map(courses.map((c) => [c.id, c]));
  const history = cutoffs
    .filter((c) => c.collegeId === id && c.verified)
    .map((c) => ({
      course: courseById.get(c.courseId)?.name || "",
      year: c.year,
      round: c.round,
      category: c.category,
      gender: c.gender,
      exam: c.exam || DEFAULT_EXAM,
      closingRank: c.closingRank,
      source: c.source,
      demo: Boolean(c.demo),
    }))
    .sort((a, b) => b.year - a.year || a.course.localeCompare(b.course));

  const gallery = photos
    .filter((p) => p.collegeId === id)
    .map((p) => ({ id: p.id, url: photoUrl(p.file), caption: p.caption }));

  return Response.json({ college: publicCollege(college, courseById), cutoffs: history, photos: gallery });
}
