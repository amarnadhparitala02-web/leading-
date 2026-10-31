"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Gallery from "@/components/Gallery";
import Icon from "@/components/Icons";
import SaveButton from "@/components/SaveButton";
import { useSettings } from "@/components/SettingsProvider";
import { telHref, waHref } from "@/lib/settings";
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
  const { settings } = useSettings();
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
  const tel = telHref(settings);
  const wa = waHref(settings, `Hi, I would like guidance about ${c.name}.`);
  const cover = photos[0];
  const badges = [c.type, c.accreditation].filter(Boolean);
  const tiles = [
    ["Established", c.established],
    ["Courses", c.courses.length ? String(c.courses.length) : ""],
    ["Location", place],
    ["Approvals", c.affiliation],
  ].filter(([, v]) => v);
  const sections = [
    ["overview", "Overview", true],
    ["courses", "Courses", true],
    ["facilities", "Facilities", c.facilities.length > 0],
    ["photos", "Photos", photos.length > 0],
  ].filter(([, , show]) => show);

  return (
    <div>
      <section className="on-dark relative overflow-hidden bg-brand text-white">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.url} alt={cover.caption || `${c.name} campus`} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,31,75,0.35) 0%, rgba(11,31,75,0.92) 100%)" }} aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[22rem] max-w-6xl flex-col justify-end px-4 pb-8 pt-16 md:min-h-[26rem] md:pb-10">
          <Link href="/colleges" className="absolute left-4 top-5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white backdrop-blur hover:bg-white/25">← All colleges</Link>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => <span key={b} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{b}</span>)}
            {c.partner && <span className="rounded-full bg-coral px-3 py-1 text-xs font-semibold">Partner college</span>}
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl leading-tight md:text-5xl">{c.name}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-white/85"><Icon name="pin" className="h-4 w-4" />{place}{c.address ? ` · ${c.address}` : ""}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/contact" className="btn btn-accent">Request counselling</Link>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-light">WhatsApp us</a>}
            {tel && <a href={tel} className="btn btn-light">Call</a>}
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-20 border-b border-[color:var(--line)] bg-white/95 backdrop-blur">
        <nav aria-label="College sections" className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4">
          {sections.map(([key, label]) => (
            <a key={key} href={`#${key}`} className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-slate-600 hover:border-brand hover:text-brand">{label}</a>
          ))}
          <span className="ml-auto flex shrink-0 items-center gap-2 py-2 pl-4">
            <CompareToggle id={c.id} />
            <SaveButton collegeId={c.id} />
          </span>
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        {tiles.length > 0 && (
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-soft p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{l}</dt>
                <dd className="mt-1 font-bold text-brand">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0 space-y-12">
            <section id="overview" className="scroll-mt-32">
              <h2 className="text-2xl">About {c.name}</h2>
              {c.summary && <p className="mt-3 text-lg leading-relaxed text-slate-700">{c.summary}</p>}
              {c.description && <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">{c.description}</p>}
              {c.highlights.length > 0 && (
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {c.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 rounded-xl bg-soft p-3 text-sm text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white"><Icon name="check" className="h-3.5 w-3.5" /></span>{h}
                    </li>
                  ))}
                </ul>
              )}
              {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-5 text-sm">Visit official website ↗</a>}
            </section>

            <section id="courses" className="scroll-mt-32">
              <h2 className="text-2xl">Courses offered</h2>
              {c.courses.length === 0 ? (
                <p className="panel-soft mt-4 p-6 text-slate-600">The course list for this college has not been added yet. Please ask a counsellor.</p>
              ) : (
                <div className="mt-5 grid gap-5 xl:grid-cols-[16rem_1fr]">
                  <ul className="flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible" role="tablist" aria-label="Courses">
                    {c.courses.map((x) => (
                      <li key={x.id} className="shrink-0 xl:shrink">
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
              <section id="facilities" className="scroll-mt-32">
                <h2 className="text-2xl">Facilities</h2>
                <ul className="mt-3 flex flex-wrap gap-2">{c.facilities.map((x) => <li key={x} className="rounded-full bg-soft px-3.5 py-1.5 text-sm text-brand">{x}</li>)}</ul>
              </section>
            )}

            {photos.length > 0 && <section id="photos" className="-mx-4 scroll-mt-32"><Gallery photos={photos} title="Photos" /></section>}
          </div>

          <aside className="lg:sticky lg:top-40 lg:self-start">
            <div className="card p-6">
              <h2 className="text-lg">Interested in this college?</h2>
              <p className="mt-2 text-sm text-slate-600">Talk to a counsellor about courses, fees and admission. It is free.</p>
              <Link href="/contact" className="btn btn-accent mt-4 w-full">Request counselling</Link>
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-2 w-full">WhatsApp us</a>}
              {tel && <a href={tel} className="btn btn-brand mt-2 w-full">Call {settings.phone}</a>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
