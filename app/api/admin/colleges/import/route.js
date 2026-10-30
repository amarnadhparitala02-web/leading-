import { guard } from "@/lib/auth";
import { all, insertMany, save } from "@/lib/db";
import { parseCsv } from "@/lib/csv";
import { randomUUID } from "crypto";
import { STATES, STREAMS } from "@/lib/site";
import { clean, json } from "@/lib/validate";

const REQUIRED = ["name", "district"];

// CSV columns: name, district, address, website, description, courses, partner, state, summary, stream (the last three are optional)
//   courses: course names separated by ; (must already exist under Courses)
//   partner: yes/no. "yes" records the MOU but does NOT make it public; an admin
//            must tick public display on the college so only confirmed partners show.
// Colleges whose name already exists are skipped.
export async function POST(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const { csv } = await request.json().catch(() => ({}));
  if (!csv || typeof csv !== "string") return json({ error: "No CSV provided" }, 400);

  const [header, ...lines] = parseCsv(csv);
  const cols = (header || []).map((h) => h.trim().toLowerCase());
  const missing = REQUIRED.filter((r) => !cols.includes(r));
  if (missing.length) return json({ error: `Missing columns: ${missing.join(", ")}` }, 400);
  if (lines.length > 500) return json({ error: "Import at most 500 colleges at a time" }, 400);

  const [existing, courses] = await Promise.all([all("colleges"), all("courses")]);
  const taken = new Set(existing.map((c) => c.name.toLowerCase()));
  const courseId = new Map(courses.map((c) => [c.name.toLowerCase(), c.id]));

  const good = [];
  const errors = [];
  const skipped = [];
  const warnings = [];
  const newCourses = [];

  lines.forEach((cells, i) => {
    const r = Object.fromEntries(cols.map((c, j) => [c, clean(cells[j], 2000)]));
    const line = i + 2;
    const name = clean(r.name, 150);
    const district = clean(r.district, 60);
    if (!name || !district) return errors.push(`Line ${line}: name and district are required`);
    if (taken.has(name.toLowerCase())) return skipped.push(name);
    taken.add(name.toLowerCase());

    const ids = [];
    for (const n of (r.courses || "").split(";").map((s) => s.trim()).filter(Boolean)) {
      const id = courseId.get(n.toLowerCase());
      if (id) ids.push(id);
      else {
        // Unknown course: create it so the import never loses data. Stream comes from the optional stream column.
        const created = { id: randomUUID(), createdAt: new Date().toISOString(), name: n, stream: STREAMS[r.stream] ? r.stream : "btech", degree: "", eligibility: "", active: true };
        newCourses.push(created);
        courseId.set(n.toLowerCase(), created.id);
        ids.push(created.id);
        warnings.push(`Line ${line} (${name}): new course "${n}" was added (${STREAMS[created.stream]})`);
      }
    }

    good.push({
      name, district,
      state: STATES.find((x) => x.toLowerCase() === (r.state || "").toLowerCase()) || "",
      address: clean(r.address, 300),
      website: /^https?:\/\//i.test(r.website || "") ? clean(r.website, 200) : "",
      summary: clean(r.summary, 500),
      description: clean(r.description, 2000),
      facilities: [], feeNote: "", feeVerifiedOn: "",
      active: true,
      partnership: { mou: /^(yes|y|true)$/i.test(r.partner || ""), displayPublic: false },
      courseIds: ids,
    });
  });

  if (newCourses.length) await save("courses", [...courses, ...newCourses]);
  if (good.length) await insertMany("colleges", good);
  return json({ imported: good.length, skipped, errors, warnings });
}
