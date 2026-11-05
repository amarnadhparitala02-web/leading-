import { extractText, getDocumentProxy } from "unpdf";
import { guard } from "@/lib/auth";
import { all, insertMany, patch, removeMany } from "@/lib/db";
import { planImport } from "@/lib/cutoffImport";
import { parseLastRankText, parseWideCsv } from "@/lib/lastRanks";
import { DEFAULT_EXAM, EXAMS } from "@/lib/site";
import { clean, json } from "@/lib/validate";

export const maxDuration = 120;

const sameSet = (c, exam, year, round) => (c.exam || DEFAULT_EXAM) === exam && c.year === year && c.round === round;

// The data sets already stored: one line per exam + year + round, so an admin can see what each year holds.
export async function GET(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const groups = new Map();
  for (const c of await all("cutoffs")) {
    const exam = c.exam || DEFAULT_EXAM;
    const key = `${exam}|${c.year}|${c.round}`;
    const d = groups.get(key) || { exam, year: c.year, round: c.round, records: 0, verified: 0, colleges: new Set(), source: c.source };
    d.records++;
    if (c.verified) d.verified++;
    d.colleges.add(c.collegeId);
    groups.set(key, d);
  }
  const datasets = [...groups.values()]
    .map((d) => ({ ...d, colleges: d.colleges.size }))
    .sort((a, b) => b.year - a.year || a.exam.localeCompare(b.exam) || a.round.localeCompare(b.round));
  return json({ datasets });
}

// Upload one year's statement (TGCHE last-rank PDF, or a wide CSV). mode=preview shows what would change;
// mode=commit saves it. Saving replaces any earlier data for the same exam + year + round.
export async function POST(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return json({ error: "Choose a PDF or CSV file" }, 400);
  if (file.size > 15_000_000) return json({ error: "The file is too large (15 MB maximum)" }, 400);

  const name = (file.name || "").toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
  const isCsv = name.endsWith(".csv") || file.type === "text/csv";
  if (!isPdf && !isCsv) return json({ error: "Upload a .pdf (TGCHE last rank statement) or a .csv file" }, 400);

  let parsed;
  const errors = [];
  try {
    if (isPdf) {
      const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
      const { text } = await extractText(pdf, { mergePages: true });
      parsed = parseLastRankText(text);
    } else {
      const r = parseWideCsv(await file.text());
      errors.push(...r.errors);
      parsed = { meta: {}, rows: r.rows };
    }
  } catch {
    return json({ error: "Could not read that file. Check that it is a valid, text-based PDF or CSV." }, 400);
  }

  // The exam, year and round come from the form; for a TGCHE PDF they are filled in from the document when left blank.
  const exam = clean(form.get("exam"), 20) || parsed.meta.exam || "";
  const year = Number(clean(form.get("year"), 4) || parsed.meta.year);
  const round = clean(form.get("round"), 40) || parsed.meta.round || "";
  const source = clean(form.get("source"), 200) || (parsed.meta.year ? `TGEAPCET ${parsed.meta.year} Last Rank Statement, ${parsed.meta.round} (official)` : "");
  const verified = form.get("verified") !== "0";
  const commit = form.get("mode") === "commit";

  if (!EXAMS.includes(exam)) return json({ error: "Choose AP EAPCET or TS EAPCET" }, 400);
  if (!Number.isInteger(year) || year < 2015 || year > 2100) return json({ error: "Enter the year these ranks are from (for example 2025)" }, 400);
  if (!round) return json({ error: "Enter the round or phase (for example Second Phase or Final)" }, 400);
  if (!source) return json({ error: "Source is required (for example: TGCHE last rank statement PDF)" }, 400);
  if (!parsed.rows.length) {
    return json({ error: errors[0] || "No colleges were found in that file. For a PDF it must be the TGCHE last rank statement with text (not a scanned image)." }, 400);
  }
  if (isPdf && parsed.meta.year && parsed.meta.year !== year) {
    return json({ error: `This PDF says ${parsed.meta.year} but you entered ${year}. Fix the year, or clear it to use the PDF's year.` }, 400);
  }

  const [colleges, courses, cutoffs] = await Promise.all([all("colleges"), all("courses"), all("cutoffs")]);
  const plan = planImport(parsed.rows, {
    colleges, courses, exam, year, round, source, state: exam === "TS EAPCET" ? "Telangana" : "Andhra Pradesh",
  });
  for (const r of plan.records) r.verified = verified;
  if (!verified) for (const r of plan.records) r.verifiedOn = "";
  const old = cutoffs.filter((c) => sameSet(c, exam, year, round));

  const summary = {
    exam, year, round, source, verified,
    ...plan.stats,
    replacing: old.length,
    newCollegeNames: plan.newColleges.slice(0, 8).map((c) => c.name),
    newCourseNames: plan.newCourses.map((c) => c.name),
    warnings: [...errors, ...plan.warnings].slice(0, 20),
  };
  if (!commit) return json({ preview: summary });

  // Add the new records first and remove the old ones afterwards, so a failure never leaves a year empty.
  if (plan.newCourses.length) await insertMany("courses", plan.newCourses);
  if (plan.newColleges.length) await insertMany("colleges", plan.newColleges);
  for (const p of plan.patches) await patch("colleges", p.id, p.fields);
  await insertMany("cutoffs", plan.records);
  if (old.length) await removeMany("cutoffs", old.map((c) => c.id));
  return json({ saved: summary });
}

// Removes one whole data set (exam + year + round), for example an upload made by mistake.
export async function DELETE(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const q = new URL(request.url).searchParams;
  const exam = q.get("exam");
  const year = Number(q.get("year"));
  const round = q.get("round");
  if (!EXAMS.includes(exam) || !Number.isInteger(year) || !round) return json({ error: "Missing exam, year or round" }, 400);
  const ids = (await all("cutoffs")).filter((c) => sameSet(c, exam, year, round)).map((c) => c.id);
  if (!ids.length) return json({ error: "Nothing found for that year" }, 404);
  await removeMany("cutoffs", ids);
  return json({ removed: ids.length });
}
