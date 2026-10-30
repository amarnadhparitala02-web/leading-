import { all } from "@/lib/db";
import { MIME, readPhotoFile, validFileName } from "@/lib/photos";

// Serves uploaded photos. Only names we generated are accepted, so no path can escape the folder,
// and only photos that still exist in the database are served. That way a photo an admin deletes
// stops being served at once, even if the storage service still has a cached copy for a while.
export async function GET(request, { params }) {
  const { file } = await params;
  if (!validFileName(file)) return new Response("Not found", { status: 404 });
  try {
    if (!(await all("photos")).some((p) => p.file === file)) return new Response("Not found", { status: 404 });
    const data = await readPhotoFile(file);
    return new Response(data, {
      headers: {
        "Content-Type": MIME[file.split(".").pop()],
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
