import { createClient } from "@supabase/supabase-js";

// Server-only Supabase access. The secret service key never reaches the browser or the repository:
// it is read from .env.local (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY). When either is missing the
// site falls back to local files, which is handy for development without a database.

export const supabaseEnabled = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

let client;
export function sb() {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

// Turns a Supabase error into one with a clear message, including the common "tables not created yet" case.
export function dbError(error, what = "database") {
  const missing = error?.code === "PGRST205" || error?.code === "PGRST202" || /schema cache/i.test(error?.message || "");
  const err = new Error(
    missing
      ? "The Supabase tables are missing. Open Supabase > SQL Editor and run the file supabase/schema.sql."
      : `Supabase ${what} error: ${error?.message || "unknown"}`,
  );
  err.cause = error;
  return err;
}

export const PHOTO_BUCKET = "photos";
let bucketReady = null;

// Creates the private photo bucket the first time it is needed.
export function ensureBucket() {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { error } = await sb().storage.createBucket(PHOTO_BUCKET, {
        public: false,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });
      if (error && !/already exists|duplicate/i.test(error.message)) throw dbError(error, "storage");
    })().catch((e) => {
      bucketReady = null;
      throw e;
    });
  }
  return bucketReady;
}
