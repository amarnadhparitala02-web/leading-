import { all } from "@/lib/db";

// Courses that at least one visible college actually offers. Used for the course filter on the
// colleges page. There is no separate courses page: courses live inside each college.
export async function GET(request) {
  const stream = new URL(request.url).searchParams.get("stream");
  const [courses, colleges] = await Promise.all([all("courses"), all("colleges")]);
  const offered = new Set(colleges.filter((c) => c.active).flatMap((c) => c.courseIds || []));
  return Response.json({
    courses: courses.filter((c) => c.active && offered.has(c.id) && (!stream || c.stream === stream)).sort((a, b) => a.name.localeCompare(b.name)),
  });
}
