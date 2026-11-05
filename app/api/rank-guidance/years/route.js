import { all } from "@/lib/db";
import { yearsFor } from "@/lib/cutoffs";
import { DEFAULT_EXAM, EXAMS } from "@/lib/site";

// Years that have verified cutoff data for an exam, newest first. Lets the rank form offer a year choice.
export async function GET(request) {
  const exam = new URL(request.url).searchParams.get("exam") || DEFAULT_EXAM;
  if (!EXAMS.includes(exam)) return Response.json({ years: [] });
  return Response.json({ years: yearsFor(await all("cutoffs"), exam) });
}
