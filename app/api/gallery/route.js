import { all } from "@/lib/db";
import { photoUrl } from "@/lib/photos";

// General (not college-specific) photos. A photo marked slot "hero" is the homepage hero image
// and is kept out of the gallery grid.
export async function GET(request) {
  new URL(request.url);
  const general = (await all("photos"))
    .filter((p) => !p.collegeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const hero = general.find((p) => p.slot === "hero");
  return Response.json({
    hero: hero ? { url: photoUrl(hero.file), caption: hero.caption } : null,
    photos: general.filter((p) => p.slot !== "hero").map((p) => ({ id: p.id, url: photoUrl(p.file), caption: p.caption })),
  });
}
