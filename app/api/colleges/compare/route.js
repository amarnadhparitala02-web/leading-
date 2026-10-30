import { all } from "@/lib/db";
import { photoUrl } from "@/lib/photos";
import { latestCutoffs, publicCollege } from "@/lib/public";

// ?ids=a,b,c compares up to 3 active colleges. Unknown or hidden ids are ignored.
export async function GET(request) {
  const ids = (new URL(request.url).searchParams.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
  const [colleges, courses, photos, cutoffs] = await Promise.all([all("colleges"), all("courses"), all("photos"), all("cutoffs")]);
  const courseById = new Map(courses.map((c) => [c.id, c]));

  const list = ids
    .map((id) => colleges.find((c) => c.id === id && c.active))
    .filter(Boolean)
    .map((c) => {
      const photo = photos.find((p) => p.collegeId === c.id);
      return { ...publicCollege(c, courseById), cover: photo ? photoUrl(photo.file) : "", cutoffs: latestCutoffs(c.id, cutoffs, courseById, 6) };
    });
  return Response.json({ colleges: list });
}
