import { guard } from "@/lib/auth";
import { all } from "@/lib/db";
import { json } from "@/lib/validate";

export async function GET(request) {
  const g = await guard(request);
  if (g.error) return g.error;
  const leads = (await all("leads")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json({ leads });
}
