// One-off import of a TGCHE "Last Rank Statement" PDF (or a wide CSV) straight into Supabase.
//
//   node scripts/import-cutoffs.mjs <file.pdf|file.csv>            preview only, nothing is written
//   node scripts/import-cutoffs.mjs <file> --commit                write to the database
//
// Options: --exam "TS EAPCET"  --year 2025  --round "Second Phase"  --source "..."
// Year, round and exam are read from the PDF when it is a TGCHE statement. Importing again for the same
// exam + year + round replaces that data. The admin panel (Cutoffs > Year-wise data) does the same thing.
import fs from "node:fs";
import path from "node:path";
import { extractText, getDocumentProxy } from "unpdf";
import { parseLastRankText, parseWideCsv } from "../lib/lastRanks.js";
import { planImport } from "../lib/cutoffImport.js";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.startsWith("--"));
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
if (!file) {
  console.error("Usage: node scripts/import-cutoffs.mjs <file.pdf|file.csv> [--commit]");
  process.exit(1);
}

// Read .env.local without extra dependencies.
for (const line of fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function rest(pathAndQuery, init = {}) {
  const res = await fetch(`${URL_}/rest/v1/${pathAndQuery}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  if (!res.ok) throw new Error(`${pathAndQuery}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json().catch(() => null);
}
async function all(table) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const page = await rest(`records?table_name=eq.${table}&select=data&order=position`, { headers: { Range: `${from}-${from + 999}` } });
    rows.push(...page.map((r) => r.data));
    if (page.length < 1000) break;
  }
  return rows;
}

// ---- parse
let parsed;
if (/\.pdf$/i.test(file)) {
  const pdf = await getDocumentProxy(new Uint8Array(fs.readFileSync(file)));
  const { text } = await extractText(pdf, { mergePages: true });
  parsed = parseLastRankText(text);
} else {
  const { rows, errors } = parseWideCsv(fs.readFileSync(file, "utf8"));
  if (errors.length) console.warn(errors.slice(0, 10).join("\n"));
  parsed = { meta: {}, rows };
}
const exam = opt("exam") || parsed.meta.exam || "TS EAPCET";
const year = Number(opt("year") || parsed.meta.year);
const round = opt("round") || parsed.meta.round || "Final";
if (!Number.isInteger(year)) throw new Error("Could not work out the year. Pass --year 2025");
const source = opt("source") || `${exam.startsWith("TS") ? "TGEAPCET" : "APEAPCET"} ${year} Last Rank Statement, ${round} (official)`;

// ---- plan
const [colleges, courses, cutoffs] = await Promise.all([all("colleges"), all("courses"), all("cutoffs")]);
const plan = planImport(parsed.rows, { colleges, courses, exam, year, round, source, state: exam.startsWith("TS") ? "Telangana" : "Andhra Pradesh" });
const replaced = cutoffs.filter((c) => (c.exam || "TS EAPCET") === exam && c.year === year && c.round === round);

console.log(`${exam} ${year} ${round}`);
console.log(plan.stats, `existing records replaced: ${replaced.length}`);
plan.warnings.slice(0, 10).forEach((w) => console.log("warning:", w));
if (!args.includes("--commit")) {
  console.log("\nPreview only. Add --commit to write this to the database.");
  process.exit(0);
}

// ---- write
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
const insert = async (table, items) => {
  for (const part of chunk(items, 300)) {
    await rest("records", { method: "POST", body: JSON.stringify(part.map((d) => ({ table_name: table, id: d.id, data: d }))) });
  }
};

for (const part of chunk(replaced, 100)) {
  const ids = part.map((c) => `"${c.id}"`).join(",");
  await rest(`records?table_name=eq.cutoffs&id=in.(${ids})`, { method: "DELETE" });
}
await insert("courses", plan.newCourses);
await insert("colleges", plan.newColleges);
for (const p of plan.patches) {
  await rest("rpc/patch_record", { method: "POST", body: JSON.stringify({ p_table: "colleges", p_id: p.id, p_patch: p.fields }) });
}
await insert("cutoffs", plan.records);
console.log("Done. Saved", plan.records.length, "cutoff records,", plan.newColleges.length, "new colleges,", plan.newCourses.length, "new courses.");
