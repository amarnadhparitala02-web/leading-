import { all } from "@/lib/db";

// Only stories an admin has published, and only if consent was confirmed for them.
export async function GET(request) {
  const limit = Math.min(Number(new URL(request.url).searchParams.get("limit")) || 50, 50);
  const stories = (await all("stories"))
    .filter((s) => s.published && s.consentConfirmed)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map(({ id, displayName, stream, year, unsure, explored, support, outcome, quote }) => ({
      id, displayName, stream, year, unsure, explored, support, outcome, quote,
    }));
  return Response.json({ stories });
}
