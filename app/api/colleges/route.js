import { all } from "@/lib/db";
import { photoUrl } from "@/lib/photos";
import { latestCutoffs, publicCollege } from "@/lib/public";

// Filters: q (name), state, district, stream, course (course id), partner=1, limit.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const state = (searchParams.get("state") || "").toLowerCase();
  const district = (searchParams.get("district") || "").toLowerCase();
  const stream = searchParams.get("stream") || "";
  const course = searchParams.get("course") || "";
  const partner = searchParams.get("partner") === "1";
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 100);

  const [colleges, courses, photos, cutoffs] = await Promise.all([all("colleges"), all("courses"), all("photos"), all("cutoffs")]);
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const cover = new Map();
  for (const p of photos) if (p.collegeId && !cover.has(p.collegeId)) cover.set(p.collegeId, photoUrl(p.file));

  const list = colleges
    .filter((c) => c.active)
    .map((c) => ({ ...publicCollege(c, courseById), cover: cover.get(c.id) || "", cutoffs: latestCutoffs(c.id, cutoffs, courseById) }))
    .filter((c) => !q || c.name.toLowerCase().includes(q))
    .filter((c) => !state || c.state.toLowerCase() === state)
    .filter((c) => !district || c.district.toLowerCase().includes(district))
    .filter((c) => !stream || c.courses.some((x) => x.stream === stream))
    .filter((c) => !course || c.courses.some((x) => x.id === course))
    .filter((c) => !partner || c.partner)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit);

  return Response.json({ colleges: list });
}
