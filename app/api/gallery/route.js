import { all } from "@/lib/db";
import { photoUrl } from "@/lib/photos";

// General (not college-specific) photos for the public gallery.
export async function GET(request) {
  new URL(request.url);
  const photos = (await all("photos"))
    .filter((p) => !p.collegeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => ({ id: p.id, url: photoUrl(p.file), caption: p.caption }));
  return Response.json({ photos });
}
