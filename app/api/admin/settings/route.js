import { guard } from "@/lib/auth";
import { all, save } from "@/lib/db";
import { cleanSettings, mergeSettings } from "@/lib/settings";
import { json } from "@/lib/validate";

export async function GET(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  return json({ settings: mergeSettings((await all("settings"))[0] || {}) });
}

// Replaces the saved settings with the cleaned form. Unknown fields are dropped.
export async function PUT(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const body = await request.json().catch(() => null);
  if (!body) return json({ error: "Invalid request" }, 400);
  const settings = cleanSettings(body);
  await save("settings", [{ id: "main", updatedAt: new Date().toISOString(), ...settings }]);
  return json({ settings });
}
