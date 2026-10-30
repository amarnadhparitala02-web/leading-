"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Gallery from "@/components/Gallery";
import Icon from "@/components/Icons";
import SaveButton from "@/components/SaveButton";
import { getCompare, MAX_COMPARE, setCompare } from "@/lib/compare";
import { STREAMS } from "@/lib/site";

export default function CollegePage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <CollegeDetails />
    </Suspense>
  );
}

function CompareToggle({ id }) {
  const [picked, setPicked] = useState(false);
  useEffect(() => {
    const sync = () => setPicked(getCompare().includes(id));
    sync();
    window.addEventListener("ll-compare", sync);
    return () => window.removeEventListener("ll-compare", sync);
  }, [id]);

  function toggle() {
    const ids = getCompare();
    if (ids.includes(id)) setCompare(ids.filter((x) => x !== id));
    else if (ids.length < MAX_COMPARE) setCompare([...ids, id]);
  }
  return (
    <button type="button" onClick={toggle} aria-pressed={picked} className={`btn text-sm ${picked ? "btn-brand" : "btn-outline"}`}>
      {picked ? "Added to compare" : "Compare"}
    </button>
  );
}

function Fact({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-brand">{value}</dd>
    </div>
  );
}

function CourseDetails({ course, cutoffs }) {
  const rows = cutoffs.filter((x) => x.courseId === course.id);
  const facts = [
    ["Duration", course.duration],
    ["Seats", course.seats],
    ["Annual fee", course.fee ? `${course.fee}${course.feeVerifiedOn ? ` (verified ${course.feeVerifiedOn})` : ""}` : ""],
    ["Eligibility", course.eligibility],
  ].filter(([, v]) => v);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-bold text-brand">{course.name}</h3>
        <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-brand">{STREAMS[course.stream] || course.stream}</span>
      </div>
      {course.degree && <p className="text-sm text-slate-500">{course.degree}</p>}

      {facts.length > 0 ? (
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {facts.map(([l, v]) => <Fact key={l} label={l} value={v} />)}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Fees, seats and duration for this course have not been added yet. Ask a counsellor for details.</p>
      )}
      {course.note && <p className="mt-4 rounded-lg bg-soft p-3 text-sm text-slate-700">{course.note}</p>}

      <h4 className="mt-6 font-bold text-brand">Historical cutoffs for this course</h4>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No verified cutoff records yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-lg border border-[color:var(--line)]">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-soft text-brand">
              <tr><th scope="col" className="p-2.5">Exam</th><th scope="col" className="p-2.5">Year</th><th scope="col" className="p-2.5">Round</th><th scope="col" className="p-2.5">Category</th><th scope="col" className="p-2.5">Closing rank</th><th scope="col" className="p-2.5">Source</th></tr>
            </thead>
            <tbody>
              {rows.map((x, i) => (
                <tr key={i} className="border-t border-[color:var(--line)]">
                  <td className="p-2.5">{x.exam}</td><td className="p-2.5">{x.year}</td><td className="p-2.5">{x.round}</td>
                  <td className="p-2.5">{x.category}{x.gender !== "Any" ? ` (${x.gender})` : ""}</td>
                  <td className="p-2.5 font-semibold">{x.closingRank.toLocaleString("en-IN")}</td>
                  <td className="p-2.5 text-xs">{x.source}{x.demo && <b className="ml-1 text-red-700">DEMO</b>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-xs text-slate-500">Past cutoffs are indicative and do not guarantee admission in any year.</p>
    </div>
  );
}

function CollegeDetails() {
  const { id } = useParams();
  const [data, setData] = useState(undefined);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`/api/colleges/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setData(d); setSelected(d?.college?.courses?.[0]?.id || null); })
      .catch(() => setData(null));
  }, [id]);

  const course = useMemo(() => data?.college.courses.find((x) => x.id === selected) || null, [data, selected]);

  if (data === undefined) return <p className="p-8" role="status">Loading...</p>;
  if (data === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-lg font-semibold text-brand">We could not find that college.</p>
        <Link href="/colleges" className="btn btn-accent mt-4">Back to colleges</Link>
      </div>
    );
  }

  const { college: c, cutoffs, photos } = data;
  const place = [c.district, c.state].filter(Boolean).join(", ");
  const hasFacts = c.type || c.established || c.affiliation || c.accreditation || place || c.website;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <Link href="/colleges" className="text-sm font-semibold text-moss underline">← All colleges</Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl md:text-5xl">{c.name}</h1>
          {c.partner && <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-brand">Partner college</span>}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-slate-600"><Icon name="pin" className="h-4 w-4" />{place}{c.address ? ` · ${c.address}` : ""}</p>
        {c.summary && <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700">{c.summary}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href="/contact" className="btn btn-accent">Request counselling</Link>
          <Link href="/rank-guidance" className="btn btn-brand">Check my rank</Link>
          <CompareToggle id={c.id} />
          <SaveButton collegeId={c.id} />
        </div>
      </header>

      {(hasFacts || c.highlights.length > 0) && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {hasFacts && (
            <section className="card p-6" aria-labelledby="facts-title">
              <h2 id="facts-title" className="text-xl">College at a glance</h2>
              <dl className="mt-4 grid gap-5 sm:grid-cols-2">
                <Fact label="Type" value={c.type} />
                <Fact label="Established" value={c.established} />
                <Fact label="Affiliation / approvals" value={c.affiliation} />
                <Fact label="Accreditation" value={c.accreditation} />
                <Fact label="Location" value={place} />
                {c.website && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Website</dt>
                    <dd className="mt-0.5"><a href={c.website} target="_blank" rel="noopener noreferrer" className="font-medium text-moss underline">Official website</a></dd>
                  </div>
                )}
              </dl>
            </section>
          )}
          {c.highlights.length > 0 && (
            <section className="panel-soft p-6" aria-labelledby="hl-title">
              <h2 id="hl-title" className="text-xl">Highlights</h2>
              <ul className="mt-4 space-y-2.5">
                {c.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white"><Icon name="check" className="h-3.5 w-3.5" /></span>{h}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {c.description && (
        <section className="mt-10" aria-labelledby="about-title">
          <h2 id="about-title" className="text-2xl">About {c.name}</h2>
          <p className="mt-3 max-w-4xl whitespace-pre-line leading-relaxed text-slate-700">{c.description}</p>
        </section>
      )}

      <section className="mt-10" aria-labelledby="courses-title">
        <h2 id="courses-title" className="text-2xl">Courses offered</h2>
        {c.courses.length === 0 ? (
          <p className="panel-soft mt-4 p-6 text-slate-600">The course list for this college has not been added yet. Please ask a counsellor.</p>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-[18rem_1fr]">
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" role="tablist" aria-label="Courses">
              {c.courses.map((x) => (
                <li key={x.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selected === x.id}
                    onClick={() => setSelected(x.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition ${selected === x.id ? "border-brand bg-brand text-white shadow" : "border-[color:var(--line)] bg-white text-brand hover:border-[#9fb8e6]"}`}
                  >
                    <span className="block font-semibold leading-snug">{x.name}</span>
                    <span className={`block text-xs ${selected === x.id ? "text-white/75" : "text-slate-500"}`}>{STREAMS[x.stream] || x.stream}{x.duration ? ` · ${x.duration}` : ""}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="card p-6" role="tabpanel">
              {course && <CourseDetails course={course} cutoffs={cutoffs} />}
            </div>
          </div>
        )}
        {c.feeNote && <p className="panel-soft mt-5 p-4 text-sm"><b>Fees note:</b> {c.feeNote}{c.feeVerifiedOn && ` (verified ${c.feeVerifiedOn})`}</p>}
      </section>

      {c.facilities.length > 0 && (
        <section className="mt-10" aria-labelledby="fac-title">
          <h2 id="fac-title" className="text-2xl">Facilities</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{c.facilities.map((x) => <li key={x} className="rounded-full bg-soft px-3 py-1 text-sm text-brand">{x}</li>)}</ul>
        </section>
      )}

      {photos.length > 0 && <div className="-mx-4 mt-6"><Gallery photos={photos} title="Photos" /></div>}
    </div>
  );
}
