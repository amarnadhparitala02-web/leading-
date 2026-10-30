import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { dbError, sb, supabaseEnabled } from "@/lib/supabase";

// Every page and admin screen reads and writes through these functions. With Supabase keys in
// .env.local they use the Supabase database; without them they use JSON files in /data (development).
// Each "table" is a list of records that each have an id.

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

export const seeds = { courses: courseSeed };

// ---------------------------------------------------------------- local files (development)
const dir = path.join(process.cwd(), "data");
const file = (table) => path.join(dir, `${table}.json`);

const fileBackend = {
  async all(table) {
    try {
      return JSON.parse(await fs.readFile(file(table), "utf8"));
    } catch {
      return seeds[table] ? seeds[table]() : [];
    }
  },
  async save(table, rows) {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file(table), JSON.stringify(rows, null, 2));
  },
  async insert(table, item) {
    const rows = await this.all(table);
    rows.push(item);
    await this.save(table, rows);
  },
  async insertMany(table, items) {
    await this.save(table, [...(await this.all(table)), ...items]);
  },
  async patch(table, id, fields) {
    const rows = await this.all(table);
    const row = rows.find((r) => r.id === id);
    if (!row) return null;
    Object.assign(row, fields);
    await this.save(table, rows);
    return row;
  },
  async remove(table, id) {
    const rows = await this.all(table);
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return false;
    await this.save(table, next);
    return true;
  },
};

// ---------------------------------------------------------------- Supabase
const PAGE = 1000; // PostgREST returns at most 1000 rows per request, so read in pages
const CHUNK = 500;

// A seeded table (courses) is first saved to the database the first time anything changes it,
// so the starter list becomes real, editable rows. After that, an empty table stays empty.
async function ensureInitialized(table) {
  if (!seeds[table]) return;
  const { data, error } = await sb().from("table_state").select("table_name").eq("table_name", table).maybeSingle();
  if (error) throw dbError(error);
  if (!data) await sbBackend.save(table, seeds[table]());
}

const sbBackend = {
  async all(table) {
    const rows = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await sb().from("records").select("data").eq("table_name", table).order("position").range(from, from + PAGE - 1);
      if (error) throw dbError(error);
      rows.push(...data.map((r) => r.data));
      if (data.length < PAGE) break;
    }
    if (rows.length === 0 && seeds[table]) {
      const { data, error } = await sb().from("table_state").select("table_name").eq("table_name", table).maybeSingle();
      if (error) throw dbError(error);
      if (!data) return seeds[table]();
    }
    return rows;
  },
  async save(table, rows) {
    const { error } = await sb().rpc("replace_table", { p_table: table, p_rows: rows });
    if (error) throw dbError(error);
  },
  async insert(table, item) {
    await ensureInitialized(table);
    const { error } = await sb().from("records").insert({ table_name: table, id: item.id, data: item });
    if (error) throw dbError(error);
  },
  async insertMany(table, items) {
    await ensureInitialized(table);
    for (let i = 0; i < items.length; i += CHUNK) {
      const { error } = await sb().from("records").insert(items.slice(i, i + CHUNK).map((item) => ({ table_name: table, id: item.id, data: item })));
      if (error) throw dbError(error);
    }
  },
  async get(table, id) {
    const { data, error } = await sb().from("records").select("data").eq("table_name", table).eq("id", id).maybeSingle();
    if (error) throw dbError(error);
    return data?.data ?? null;
  },
  async patch(table, id, fields) {
    await ensureInitialized(table);
    const { data, error } = await sb().rpc("patch_record", { p_table: table, p_id: id, p_patch: fields });
    if (error) throw dbError(error);
    return data ?? null;
  },
  async remove(table, id) {
    await ensureInitialized(table);
    const { error, count } = await sb().from("records").delete({ count: "exact" }).eq("table_name", table).eq("id", id);
    if (error) throw dbError(error);
    return count > 0;
  },
};

const backend = () => (supabaseEnabled() ? sbBackend : fileBackend);

// ---------------------------------------------------------------- the functions the site uses
export const all = (table) => backend().all(table);
export const save = (table, rows) => backend().save(table, rows);

export async function get(table, id) {
  if (supabaseEnabled()) return sbBackend.get(table, id);
  return (await fileBackend.all(table)).find((r) => r.id === id) || null;
}

export async function insert(table, row) {
  const item = { id: randomUUID(), createdAt: new Date().toISOString(), ...row };
  await backend().insert(table, item);
  return item;
}

export async function insertMany(table, items) {
  const now = new Date().toISOString();
  const added = items.map((r) => ({ id: randomUUID(), createdAt: now, ...r }));
  await backend().insertMany(table, added);
  return added;
}

export const patch = (table, id, fields) => backend().patch(table, id, fields);

// Removes only the records that match, one by one, so records added by other visitors at the same
// moment are never overwritten (unlike saving the whole table back).
export async function removeWhere(table, predicate) {
  const rows = (await all(table)).filter(predicate);
  for (const r of rows) await remove(table, r.id);
  return rows.length;
}
export const remove = (table, id) => backend().remove(table, id);
