// Reads "last rank" statements into plain rows. Pure functions (no database, no Next.js imports) so the
// same code runs in the admin upload and in the one-off import script.
//
// Two inputs are understood:
//  1. The TGCHE "TGEAPCET-YYYY Last Rank Statement" PDF text (one line per college + branch, 22 ranks).
//  2. A wide CSV: college, course, then one column per category and gender, e.g. OC_BOYS, BC_A_GIRLS.
import { parseCsv } from "./csv.js";

// The 22 rank columns in the TGCHE statement, in order: boys then girls for each category.
export const TS_COLUMNS = ["OC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC-I", "SC-II", "SC-III", "ST", "EWS"];
export const KNOWN_CATEGORIES = ["OC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "SC-I", "SC-II", "SC-III", "ST", "EWS"];

const DISTRICTS = {
  RR: "Ranga Reddy", MDL: "Medchal-Malkajgiri", HYD: "Hyderabad", HNK: "Hanumakonda", KHM: "Khammam",
  KRM: "Karimnagar", KGM: "Bhadradri Kothagudem", SRP: "Suryapet", WGL: "Warangal", YBG: "Yadadri Bhuvanagiri",
  SRD: "Sangareddy", PDL: "Peddapalli", NZB: "Nizamabad", MBN: "Mahabubnagar", MED: "Medak", SDP: "Siddipet",
  NLG: "Nalgonda", SRC: "Rajanna Sircilla", JTL: "Jagtial", MHB: "Mahabubabad", WNP: "Wanaparthy",
  NPT: "Narayanpet", KMR: "Kamareddy", NGKL: "Nagarkurnool", ADB: "Adilabad", NML: "Nirmal", MCL: "Mancherial",
  JGL: "Jangaon", JDW: "Jogulamba Gadwal", VKB: "Vikarabad", ASF: "Komaram Bheem Asifabad", BHP: "Jayashankar Bhupalpally",
};

export function titleCase(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|[\s(\-/&])([a-z])/g, (m, a, b) => a + b.toUpperCase())
    .replace(/\b(And|Of|For|In|The|To|At|On)\b/g, (w, _x, i) => (i === 0 ? w : w.toLowerCase()))
    .replace(/\b(Cse|Ece|Eee|Cad|Cam|Ai|Ml|Iot|Vlsi|Mtech|Btech|Jntuh|Ou|Ku|Sr|Vnr|Cvsr|Gnit|Mgit|Cbit)\b/gi, (w) => w.toUpperCase())
    .replace(/\bEngg\b/g, "Engg")
    .replace(/\bInst\b/g, "Inst")
    .replace(/\bIot\b/gi, "IoT");
}

// Collapses a name so "Bio-Technology" and "Biotechnology", or "&" and "and", compare equal.
export const norm = (s) => String(s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");

// Takes the extracted text of a TGCHE last-rank PDF and returns { meta, rows }.
export function parseLastRankText(raw) {
  let text = String(raw || "").replace(/\r/g, "\n");
  const meta = {};
  const head = text.match(/TGEAPCET[-\s]*(\d{4})\s+(First|Second|Third|Final)\s+Phase/i);
  if (head) {
    meta.exam = "TS EAPCET";
    meta.year = Number(head[1]);
    meta.round = `${head[2][0].toUpperCase()}${head[2].slice(1).toLowerCase()} Phase`;
  }

  // Page headers, footers and the disclaimer are not data.
  const cut = text.search(/Disclaimer\s*:/i);
  if (cut > 0) text = text.slice(0, cut);
  text = text
    .replace(/Inst\s+Code\s+Institute\s+Name[\s\S]*?Affiliated\s+To/gi, " ")
    .replace(/TGEAPCET[-\s]*\d{4}\s+LAST\s+RANK\s+STATEMENT\s+[A-Z ]*?PHASE/gi, " ")
    .replace(/TGEAPCET[-\s]*\d{4}\s+(?:First|Second|Third|Final)\s+Phase/gi, " ")
    .replace(/\b\d+\s+of\s+\d+\b/g, " ")
    .replace(/JNTHM\s+T\b/g, "JNTHMT") // one institute code in the statement contains a stray space
    .replace(/\s+/g, " ")
    .trim();

  const tok = "(?:\\d+|NA)";
  const rx = new RegExp(
    `([A-Z0-9]{4,6}) ((?:[^0-9]|\\d(?!\\d))+?) (\\S+) (COED|GIRLS) (\\S+) ([A-Z0-9]{2,4}) (.+?) ((?:${tok} ){21}${tok}) ([A-Z][A-Z ]*?)(?= [A-Z0-9]{4,6} (?:[^0-9]|\\d(?!\\d))*?(?:COED|GIRLS) |$)`,
    "g",
  );

  const rows = [];
  for (const m of text.matchAll(rx)) {
    const [, instCode, name, distCode, edu, collegeType, branchCode, branchName, nums, affiliation] = m;
    const v = nums.split(" ").map((x) => (x === "NA" ? null : Number(x)));
    const ranks = {};
    TS_COLUMNS.forEach((cat, i) => {
      const cell = {};
      if (v[i * 2] != null) cell.Boys = v[i * 2];
      if (v[i * 2 + 1] != null) cell.Girls = v[i * 2 + 1];
      if (Object.keys(cell).length) ranks[cat] = cell;
    });
    // distCode is the token before COED; the place is the last word of the institute name
    const words = name.trim().split(" ");
    rows.push({
      instCode,
      collegeName: words.slice(0, -1).join(" ") || name,
      place: words[words.length - 1],
      distCode,
      districtName: DISTRICTS[distCode] || titleCase(words[words.length - 1]),
      girlsOnly: edu === "GIRLS",
      collegeType, // PVT, UNIV, GOV, SF
      branchCode,
      branchName: branchName.trim(),
      affiliation: affiliation.trim(),
      ranks,
    });
  }
  return { meta, rows };
}

const COL = /^(OC|BC[_\s-]?[A-E]|SC[_\s-]?(?:III|II|I)?|ST|EWS)[_\s-]*(BOYS|GIRLS|ANY)$/i;
const catName = (c) => {
  const k = c.toUpperCase().replace(/[_\s]/g, "-");
  return k === "SC-" ? "SC" : k;
};

// Wide CSV: college, course (required) + optional instCode, branchCode, state, district + rank columns.
export function parseWideCsv(csvText) {
  const [header, ...lines] = parseCsv(String(csvText || ""));
  if (!header) return { rows: [], errors: ["The file is empty"] };
  const cols = header.map((h) => h.trim());
  const idx = (name) => cols.findIndex((c) => c.toLowerCase() === name);
  const iCollege = idx("college");
  const iCourse = idx("course");
  const errors = [];
  if (iCollege < 0 || iCourse < 0) return { rows: [], errors: ["The CSV needs a 'college' column and a 'course' column"] };
  const rankCols = [];
  cols.forEach((c, i) => {
    const m = c.match(COL);
    if (m) rankCols.push({ i, category: catName(m[1]), gender: m[2][0].toUpperCase() + m[2].slice(1).toLowerCase() });
  });
  if (!rankCols.length) errors.push("No rank columns found. Use names like OC_BOYS, OC_GIRLS, BC_A_BOYS, SC_I_GIRLS, ST_BOYS, EWS_GIRLS");
  const opt = (name) => idx(name);
  const [iCode, iBranch, iState, iDistrict] = [opt("instcode"), opt("branchcode"), opt("state"), opt("district")];

  const rows = [];
  lines.forEach((cells, n) => {
    const get = (i) => (i >= 0 ? String(cells[i] ?? "").trim() : "");
    const collegeName = get(iCollege);
    const branchName = get(iCourse);
    if (!collegeName || !branchName) return errors.push(`Line ${n + 2}: college and course are required`);
    const ranks = {};
    for (const rc of rankCols) {
      const raw = String(cells[rc.i] ?? "").trim().replace(/,/g, "");
      if (!raw || /^(na|n\/a|-+)$/i.test(raw)) continue;
      const num = Number(raw);
      if (!Number.isInteger(num) || num < 1) {
        errors.push(`Line ${n + 2}: "${raw}" is not a valid rank in ${cols[rc.i]}`);
        continue;
      }
      (ranks[rc.category] ||= {})[rc.gender] = num;
    }
    if (!Object.keys(ranks).length) return errors.push(`Line ${n + 2}: no ranks for ${collegeName} / ${branchName}`);
    rows.push({
      instCode: get(iCode), collegeName, place: "", districtName: get(iDistrict), state: get(iState),
      branchCode: get(iBranch), branchName, ranks, girlsOnly: false, affiliation: "", collegeType: "",
    });
  });
  return { rows, errors };
}
