import { all } from "@/lib/db";
import { photoUrl } from "@/lib/photos";
import { publicCollege } from "@/lib/public";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const district = (searchParams.get("district") || "").toLowerCase();
  const stream = searchParams.get("stream") || "";
  const partner = searchParams.get("partner") === "1";

  const [colleges, courses, photos] = await Promise.all([all("colleges"), all("courses"), all("photos")]);
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const cover = new Map();
  for (const p of photos) if (p.collegeId && !cover.has(p.collegeId)) cover.set(p.collegeId, photoUrl(p.file));

  const list = colleges
    .filter((c) => c.active)
    .map((c) => ({ ...publicCollege(c, courseById), cover: cover.get(c.id) || "" }))
    .filter((c) => !q || c.name.toLowerCase().includes(q))
    .filter((c) => !district || c.district.toLowerCase() === district)
    .filter((c) => !stream || c.courses.some((x) => x.stream === stream))
    .filter((c) => !partner || c.partner)
    .sort((a, b) => a.name.localeCompare(b.name));

  return Response.json({ colleges: list });
}
