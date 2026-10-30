import { guard } from "@/lib/auth";
import { all, insert, remove } from "@/lib/db";
import { deletePhotoFile, detectImage, MAX_PHOTO_BYTES, photoUrl, savePhotoFile } from "@/lib/photos";
import { clean, json } from "@/lib/validate";

export async function GET(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const [photos, colleges] = await Promise.all([all("photos"), all("colleges")]);
  const name = new Map(colleges.map((c) => [c.id, c.name]));
  const list = photos
    .map((p) => ({ ...p, url: photoUrl(p.file), collegeName: p.collegeId ? name.get(p.collegeId) || "?" : p.slot === "hero" ? "Homepage hero" : "General" }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json({ photos: list });
}

// multipart form: file (jpg/png/webp, up to 5 MB), collegeId (optional), caption (optional).
export async function POST(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return json({ error: "Choose a photo to upload" }, 400);
  if (file.size > MAX_PHOTO_BYTES) return json({ error: "Photo is larger than 5 MB" }, 400);

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectImage(buf);
  if (!ext) return json({ error: "Only JPG, PNG or WebP photos are allowed" }, 400);

  const collegeId = clean(form.get("collegeId"), 60);
  if (collegeId && !(await all("colleges")).some((c) => c.id === collegeId)) {
    return json({ error: "College not found" }, 400);
  }

  // A general photo can be the homepage hero image. Only one at a time: the newest replaces the old.
  const slot = !collegeId && form.get("slot") === "hero" ? "hero" : "";
  if (slot) {
    for (const old of (await all("photos")).filter((p) => p.slot === "hero")) {
      await deletePhotoFile(old.file);
      await remove("photos", old.id);
    }
  }

  const stored = await savePhotoFile(buf, ext);
  const photo = await insert("photos", { file: stored, collegeId: collegeId || "", caption: clean(form.get("caption"), 150), slot });
  return json({ photo: { ...photo, url: photoUrl(stored) } });
}

export async function DELETE(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const id = new URL(request.url).searchParams.get("id");
  const photo = (await all("photos")).find((p) => p.id === id);
  if (!photo) return json({ error: "Not found" }, 404);
  await deletePhotoFile(photo.file);
  await remove("photos", id);
  return json({ ok: true });
}
