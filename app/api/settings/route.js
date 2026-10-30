import { all } from "@/lib/db";
import { mergeSettings } from "@/lib/settings";

// Public site settings: business name, contact details, hero text, footer links and section toggles.
export async function GET(request) {
  new URL(request.url);
  const saved = (await all("settings"))[0] || {};
  return Response.json({ settings: mergeSettings(saved) });
}
