import { guard } from "@/lib/auth";
import { all, insertMany, save } from "@/lib/db";
import { deletePhotoFile } from "@/lib/photos";
import { json } from "@/lib/validate";

// Demo records exist only so staff can try the tool before real data is imported.
// They are flagged `demo` and shown with a visible label on public pages.
export async function POST(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const { action } = await request.json().catch(() => ({}));

  if (action === "remove") {
    const demoIds = new Set((await all("colleges")).filter((c) => c.demo).map((c) => c.id));
    const photos = await all("photos");
    await Promise.all(photos.filter((p) => demoIds.has(p.collegeId)).map((p) => deletePhotoFile(p.file)));
    await save("photos", photos.filter((p) => !demoIds.has(p.collegeId)));
    await save("colleges", (await all("colleges")).filter((c) => !c.demo));
    await save("cutoffs", (await all("cutoffs")).filter((c) => !c.demo));
    return json({ ok: true });
  }

  if (action === "load") {
    if ((await all("colleges")).some((c) => c.demo)) return json({ error: "Demo data already loaded" }, 400);
    const base = { active: true, address: "", website: "", facilities: [], feeNote: "", feeVerifiedOn: "", partnership: { mou: false, displayPublic: false }, demo: true };
    const cse = "btech-computer-science-engineering";
    const ece = "btech-electronics-communication-engineering";
    const mech = "btech-mechanical-engineering";
    const agri = "agri-b-sc-hons-agriculture";
    const colleges = await insertMany("colleges", [
      { ...base, name: "DEMO College A", district: "Hyderabad", description: "Demo record. Not a real college.", courseIds: [cse, ece, mech] },
      { ...base, name: "DEMO College B", district: "Warangal", description: "Demo record. Not a real college.", courseIds: [cse, mech] },
      { ...base, name: "DEMO Agriculture College C", district: "Rangareddy", description: "Demo record. Not a real college.", courseIds: [agri] },
    ]);
    const [a, b, c] = colleges.map((x) => x.id);
    const rows = [];
    const add = (collegeId, courseId, closing) => {
      for (const category of ["OC", "BC-B", "SC"]) {
        const f = category === "OC" ? 1 : category === "BC-B" ? 1.8 : 3.5;
        rows.push({
          collegeId, courseId, year: 2025, round: "Final", category, gender: "Any",
          closingRank: Math.round(closing * f), source: "DEMO - not real data",
          verified: true, verifiedOn: new Date().toISOString().slice(0, 10), demo: true,
        });
      }
    };
    add(a, cse, 5000); add(a, ece, 9000); add(a, mech, 24000);
    add(b, cse, 12000); add(b, mech, 38000);
    add(c, agri, 6000);
    await insertMany("cutoffs", rows);
    return json({ ok: true });
  }

  return json({ error: "Unknown action" }, 400);
}
