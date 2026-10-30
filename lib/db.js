import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// File-based tables for the MVP. Each table maps 1:1 to a MySQL table in the
// blueprint, so moving to a real database later only means replacing this file.
const dir = path.join(process.cwd(), "data");

const courseSeed = () => [
  ...["Computer Science & Engineering", "CSE (AI & Machine Learning)", "CSE (Data Science)", "Information Technology",
    "Electronics & Communication Engineering", "Electrical & Electronics Engineering", "Mechanical Engineering", "Civil Engineering"]
    .map((name) => ({
      id: `btech-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`,
      name, stream: "btech", degree: "B.Tech",
      eligibility: "Intermediate (MPC) or equivalent; admission through EAPCET counselling.",
      active: true,
    })),
  // Agriculture programmes still need to be confirmed with the business.
  ...["B.Sc (Hons.) Agriculture", "B.Sc (Hons.) Horticulture"].map((name) => ({
    id: `agri-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`,
    name, stream: "agriculture", degree: "B.Sc (Hons.)",
    eligibility: "Intermediate (BiPC) or equivalent; admission through EAPCET (Agriculture) counselling.",
    active: true,
  })),
];

const seeds = { courses: courseSeed };
const file = (table) => path.join(dir, `${table}.json`);

export async function all(table) {
  try {
    return JSON.parse(await fs.readFile(file(table), "utf8"));
  } catch {
    return seeds[table] ? seeds[table]() : [];
  }
}

export async function save(table, rows) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file(table), JSON.stringify(rows, null, 2));
}

export async function insert(table, row) {
  const rows = await all(table);
  const item = { id: randomUUID(), createdAt: new Date().toISOString(), ...row };
  rows.push(item);
  await save(table, rows);
  return item;
}

export async function insertMany(table, items) {
  const rows = await all(table);
  const now = new Date().toISOString();
  const added = items.map((r) => ({ id: randomUUID(), createdAt: now, ...r }));
  await save(table, [...rows, ...added]);
  return added;
}

export async function patch(table, id, fields) {
  const rows = await all(table);
  const row = rows.find((r) => r.id === id);
  if (!row) return null;
  Object.assign(row, fields);
  await save(table, rows);
  return row;
}

export async function remove(table, id) {
  const rows = await all(table);
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await save(table, next);
  return true;
}
