// Turns parsed last-rank rows into the records to store, without touching the database.
// Used by the admin upload (preview, then save) and by scripts/import-cutoffs.mjs.
import { randomUUID } from "crypto";
import { norm, titleCase } from "./lastRanks.js";

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// The 8 core branches keep the names the site already uses; the rest are named from the statement.
const COURSE_ALIASES = {
  CSM: "CSE (AI & Machine Learning)",
  CSD: "CSE (Data Science)",
};

// Institutes whose record already exists on the site under another name: code -> existing college name.
const COLLEGE_ALIASES = {
  SRHP: "SR University, Warangal",
};

export function collegeDisplayName(row) {
  const name = titleCase(row.collegeName);
  const place = titleCase(row.place);
  return place && !norm(name).includes(norm(place)) ? `${name}, ${place}` : name;
}

export function planImport(rows, { colleges, courses, exam, year, round, source, state, today = new Date().toISOString().slice(0, 10) }) {
  const collegeByCode = new Map();
  const collegeByName = new Map();
  for (const c of colleges) {
    const code = c.eapcetCodes?.[exam];
    if (code) collegeByCode.set(code, c);
    collegeByName.set(norm(c.name), c);
  }
  const courseByName = new Map(courses.map((c) => [norm(c.name), c]));
  const courseIdsTaken = new Set(courses.map((c) => c.id));

  const newColleges = new Map(); // key -> college to insert
  const patches = new Map(); // college id -> fields to merge into an existing college
  const newCourses = new Map();
  const records = [];
  const warnings = [];

  const collegeFor = (row) => {
    const key = row.instCode || norm(row.collegeName);
    let college = (row.instCode && collegeByCode.get(row.instCode)) || newColleges.get(key);
    if (!college && row.instCode && COLLEGE_ALIASES[row.instCode]) college = collegeByName.get(norm(COLLEGE_ALIASES[row.instCode]));
    const display = collegeDisplayName(row);
    if (!college) college = collegeByName.get(norm(display)) || collegeByName.get(norm(row.collegeName));
    if (!college) {
      college = {
        id: randomUUID(),
        name: display,
        state: row.state || state || "",
        district: row.districtName || "",
        address: [titleCase(row.place), row.districtName].filter(Boolean).join(", "),
        website: "", summary: "", description: "",
        type: row.collegeType === "GOV" ? "Government" : row.collegeType === "UNIV" ? "University" : "Private",
        established: "", affiliation: row.affiliation || "", accreditation: "",
        highlights: [], facilities: [], feeNote: "", feeVerifiedOn: "",
        // Kept for rank results and cutoff history only; hidden from the public college list until an admin lists it.
        active: true, cutoffOnly: true,
        partnership: { mou: false, displayPublic: false },
        courseIds: [], courseDetails: {},
        eapcetCodes: row.instCode ? { [exam]: row.instCode } : {},
        createdAt: new Date().toISOString(),
      };
      newColleges.set(key, college);
    } else if (row.instCode && !college.eapcetCodes?.[exam] && !newColleges.has(key)) {
      // An existing college is recognised by name or alias: remember its code so the next upload matches directly.
      college.eapcetCodes = { ...(college.eapcetCodes || {}), [exam]: row.instCode };
      patches.set(college.id, { eapcetCodes: college.eapcetCodes });
    }
    return college;
  };

  const courseFor = (row) => {
    const wanted = (row.branchCode && COURSE_ALIASES[row.branchCode]) || row.branchName;
    let course = courseByName.get(norm(wanted)) || courseByName.get(norm(row.branchName));
    if (!course) {
      const name = titleCase(row.branchName);
      let id = `btech-${slug(name)}`;
      while (courseIdsTaken.has(id)) id += "-2";
      courseIdsTaken.add(id);
      course = {
        id, name, stream: "btech", degree: "B.Tech", code: row.branchCode || "",
        eligibility: "Intermediate (MPC) or equivalent; admission through EAPCET counselling.",
        active: true, createdAt: new Date().toISOString(),
      };
      courseByName.set(norm(name), course);
      newCourses.set(course.id, course);
    }
    return course;
  };

  const seen = new Set();
  for (const row of rows) {
    const college = collegeFor(row);
    const course = courseFor(row);
    const key = `${college.id}|${course.id}`;
    if (seen.has(key)) {
      warnings.push(`${row.collegeName} / ${row.branchName} appears twice; the first one was kept`);
      continue;
    }
    seen.add(key);
    if (!college.courseIds.includes(course.id)) {
      college.courseIds = [...college.courseIds, course.id];
      if (!newColleges.has(row.instCode || norm(row.collegeName))) patches.set(college.id, { ...(patches.get(college.id) || {}), courseIds: college.courseIds });
    }
    records.push({
      id: randomUUID(), createdAt: new Date().toISOString(),
      collegeId: college.id, courseId: course.id, exam, year, round, ranks: row.ranks,
      source, verified: true, verifiedOn: today,
      instCode: row.instCode || "", branchCode: row.branchCode || "",
    });
  }

  const colleges2 = new Set(records.map((r) => r.collegeId));
  return {
    newColleges: [...newColleges.values()],
    patches: [...patches].map(([id, fields]) => ({ id, fields })),
    newCourses: [...newCourses.values()],
    records,
    warnings,
    stats: {
      rows: rows.length,
      records: records.length,
      colleges: colleges2.size,
      newColleges: newColleges.size,
      newCourses: newCourses.size,
      rankValues: records.reduce((n, r) => n + Object.values(r.ranks).reduce((m, g) => m + Object.keys(g).length, 0), 0),
    },
  };
}
