import { guard } from "@/lib/auth";
import { all, insert, patch, save } from "@/lib/db";
import { deletePhotoFile } from "@/lib/photos";
import { clean, json } from "@/lib/validate";

function fromBody(b) {
  return {
    name: clean(b.name, 150),
    district: clean(b.district, 60),
    address: clean(b.address, 300),
    website: /^https?:\/\//i.test(String(b.website || "")) ? clean(b.website, 200) : "",
    description: clean(b.description, 2000),
    facilities: Array.isArray(b.facilities) ? b.facilities.map((f) => clean(f, 60)).filter(Boolean) : [],
    feeNote: clean(b.feeNote, 300),
    feeVerifiedOn: clean(b.feeVerifiedOn, 10),
    active: b.active !== false,
    partnership: { mou: Boolean(b.partnership?.mou), displayPublic: Boolean(b.partnership?.displayPublic) },
    courseIds: Array.isArray(b.courseIds) ? b.courseIds.map((c) => clean(c, 80)) : [],
  };
}

export async function GET(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  return json({ colleges: (await all("colleges")).sort((a, b) => a.name.localeCompare(b.name)) });
}

export async function POST(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const data = fromBody(await request.json().catch(() => ({})));
  if (!data.name || !data.district) return json({ error: "Name and district are required" }, 400);
  return json({ college: await insert("colleges", data) });
}

export async function PATCH(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const body = await request.json().catch(() => ({}));
  const data = fromBody(body);
  if (!data.name || !data.district) return json({ error: "Name and district are required" }, 400);
  const college = await patch("colleges", body.id, data);
  return college ? json({ college }) : json({ error: "Not found" }, 404);
}

// Permanently removes a college together with its cutoff records and photos.
export async function DELETE(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const id = new URL(request.url).searchParams.get("id");
  const colleges = await all("colleges");
  if (!colleges.some((c) => c.id === id)) return json({ error: "Not found" }, 404);

  const photos = await all("photos");
  await Promise.all(photos.filter((p) => p.collegeId === id).map((p) => deletePhotoFile(p.file)));
  await save("photos", photos.filter((p) => p.collegeId !== id));
  await save("cutoffs", (await all("cutoffs")).filter((c) => c.collegeId !== id));
  await save("colleges", colleges.filter((c) => c.id !== id));
  return json({ ok: true });
}
