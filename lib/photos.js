import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { dbError, ensureBucket, PHOTO_BUCKET, sb, supabaseEnabled } from "@/lib/supabase";

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const dir = path.join(process.cwd(), "data", "uploads");

// Identify the real image type from the file's first bytes, not the name the browser sent.
export function detectImage(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

export const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
export const photoUrl = (file) => `/api/photos/${file}`;
export const validFileName = (name) => /^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(name);

// Photos live in a private Supabase Storage bucket when Supabase is configured, otherwise in
// data/uploads. Either way they are only ever served through /api/photos/<file>.
export async function savePhotoFile(buf, ext) {
  const file = `${randomUUID()}.${ext}`;
  if (supabaseEnabled()) {
    await ensureBucket();
    const { error } = await sb().storage.from(PHOTO_BUCKET).upload(file, buf, { contentType: MIME[ext], upsert: false });
    if (error) throw dbError(error, "storage");
    return file;
  }
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, file), buf);
  return file;
}

export async function readPhotoFile(file) {
  if (supabaseEnabled()) {
    const { data, error } = await sb().storage.from(PHOTO_BUCKET).download(file);
    if (error) throw dbError(error, "storage");
    return Buffer.from(await data.arrayBuffer());
  }
  return fs.readFile(path.join(dir, file));
}

export async function deletePhotoFile(file) {
  if (!validFileName(file)) return;
  if (supabaseEnabled()) {
    await sb().storage.from(PHOTO_BUCKET).remove([file]);
    return;
  }
  await fs.rm(path.join(dir, file), { force: true });
}
