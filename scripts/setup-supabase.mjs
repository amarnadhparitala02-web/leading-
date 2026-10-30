// Creates the Supabase tables by running supabase/schema.sql straight on the database.
//
//   node scripts/setup-supabase.mjs
//
// Needs DATABASE_URL in .env.local (Supabase > Connect > the Postgres connection string, with your
// database password filled in). The script never prints the connection string or the password.
// Running it again is safe.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
if (!env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const sql = fs.readFileSync(path.join(root, "supabase", "schema.sql"), "utf8");
const client = new pg.Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("connected to the database");
  await client.query(sql);
  console.log("schema applied");
  await client.query("notify pgrst, 'reload schema'");
  console.log("asked the API to reload its table list");
  const { rows } = await client.query("select table_name from information_schema.tables where table_schema = 'public' order by 1");
  console.log("tables in public:", rows.map((r) => r.table_name).join(", "));
  const fns = await client.query("select routine_name from information_schema.routines where routine_schema = 'public' order by 1");
  console.log("functions in public:", fns.rows.map((r) => r.routine_name).join(", "));
} catch (e) {
  // Print the reason without any connection details.
  console.error("failed:", String(e.message || e).replace(/postgres(ql)?:\/\/\S+/g, "[connection string]"));
  if (e.code) console.error("code:", e.code);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
