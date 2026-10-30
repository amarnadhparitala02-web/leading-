import { all } from "@/lib/db";

export async function GET(request) {
  const stream = new URL(request.url).searchParams.get("stream");
  const courses = (await all("courses")).filter((c) => c.active && (!stream || c.stream === stream));
  return Response.json({ courses });
}
