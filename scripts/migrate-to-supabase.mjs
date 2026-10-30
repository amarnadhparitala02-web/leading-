// Copies the local development data (data/*.json and data/uploads) into Supabase.
//
//   node scripts/migrate-to-supabase.mjs              copy tables that are empty in Supabase, skip the rest
//   node scripts/migrate-to-supabase.mjs --overwrite  replace tables that already have rows in Supabase
//
// Run supabase/schema.sql in the Supabase SQL Editor first. Keys are read from .env.local and never printed.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}
const overwrite = process.argv.includes("--overwrite");
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// 1. The tables must exist.
const probe = await sb.from("records").select("id").limit(1);
if (probe.error) {
  console.error(probe.error.code === "PGRST205"
    ? "The tables are missing. Open Supabase > SQL Editor, paste the contents of supabase/schema.sql and click Run, then run this again."
    : `Could not reach Supabase: ${probe.error.message}`);
  process.exit(1);
}

// 2. Tables.
const dataDir = path.join(root, "data");
const files = fs.existsSync(dataDir) ? fs.readdirSync(dataDir).filter((f) => f.endsWith(".json")) : [];
for (const f of files) {
  const table = f.replace(/\.json$/, "");
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8")); } catch { console.log(`${table}: unreadable, skipped`); continue; }
  if (!Array.isArray(rows)) { console.log(`${table}: not a list, skipped`); continue; }
  if (rows.some((r) => !r?.id)) { console.log(`${table}: some records have no id, skipped`); continue; }

  const { count } = await sb.from("records").select("id", { count: "exact", head: true }).eq("table_name", table);
  if (count > 0 && !overwrite) { console.log(`${table}: Supabase already has ${count} records, left alone (use --overwrite to replace)`); continue; }
  const { error } = await sb.rpc("replace_table", { p_table: table, p_rows: rows });
  console.log(error ? `${table}: FAILED (${error.message})` : `${table}: ${rows.length} records copied`);
}

// 3. Photos.
const upDir = path.join(dataDir, "uploads");
const photos = fs.existsSync(upDir) ? fs.readdirSync(upDir) : [];
if (photos.length) {
  await sb.storage.createBucket("photos", { public: false, fileSizeLimit: 5 * 1024 * 1024, allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] });
  const mime = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
  let ok = 0;
  for (const name of photos) {
    const { error } = await sb.storage.from("photos").upload(name, fs.readFileSync(path.join(upDir, name)), { contentType: mime[name.split(".").pop()], upsert: true });
    if (error) console.log(`photo ${name}: FAILED (${error.message})`); else ok++;
  }
  console.log(`photos: ${ok} of ${photos.length} uploaded`);
} else {
  console.log("photos: none to upload");
}
console.log("done");
