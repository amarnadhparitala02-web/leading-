import { guard } from "@/lib/auth";
import { all, insert, patch, remove } from "@/lib/db";
import { clean, json } from "@/lib/validate";

// A student story follows the plan's template. Publishing needs the admin to confirm that the
// student gave permission, and to note how it was obtained, so nothing is shown without consent.
function fromBody(b) {
  return {
    displayName: clean(b.displayName, 80),
    stream: clean(b.stream, 60),
    year: clean(b.year, 10),
    unsure: clean(b.unsure, 600),
    explored: clean(b.explored, 600),
    support: clean(b.support, 600),
    outcome: clean(b.outcome, 400),
    quote: clean(b.quote, 400),
    consentConfirmed: b.consentConfirmed === true,
    consentNote: clean(b.consentNote, 300),
    published: b.published === true,
  };
}

function validate(d) {
  if (!d.displayName) return "Enter the name the student has approved for display";
  if (!d.quote && !d.unsure) return "Add the student's quote or what they were unsure about";
  if (d.published && !d.consentConfirmed) return "Confirm the student's permission before publishing";
  if (d.published && !d.consentNote) return "Note how and when permission was given";
  return "";
}

export async function GET(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  return json({ stories: (await all("stories")).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
}

export async function POST(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const data = fromBody(await request.json().catch(() => ({})));
  const problem = validate(data);
  if (problem) return json({ error: problem }, 400);
  return json({ story: await insert("stories", data) });
}

export async function PATCH(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const body = await request.json().catch(() => ({}));
  const data = fromBody(body);
  const problem = validate(data);
  if (problem) return json({ error: problem }, 400);
  const story = await patch("stories", body.id, data);
  return story ? json({ story }) : json({ error: "Not found" }, 404);
}

export async function DELETE(request) {
  const g = await guard(request, "admin");
  if (g.error) return g.error;
  const id = new URL(request.url).searchParams.get("id");
  return (await remove("stories", id)) ? json({ ok: true }) : json({ error: "Not found" }, 404);
}
