import { MIME, readPhotoFile, validFileName } from "@/lib/photos";

// Serves uploaded photos. Only names we generated are accepted, so no path can escape the folder.
export async function GET(request, { params }) {
  const { file } = await params;
  if (!validFileName(file)) return new Response("Not found", { status: 404 });
  try {
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
