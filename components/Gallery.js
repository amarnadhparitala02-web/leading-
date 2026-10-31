"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";

// Photo grid with a simple click-to-enlarge viewer. Pass `photos`, or leave it out
// to load the general site gallery. Renders nothing when there are no photos.
// `featured` gives larger tiles with the caption shown over the photo, and the first photo spans two columns.
export default function Gallery({ photos: given, title = "Gallery", featured = false }) {
  const [photos, setPhotos] = useState(given || []);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (given) return;
    fetch("/api/gallery").then((r) => r.json()).then((d) => setPhotos(d.photos)).catch(() => {});
  }, [given]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!photos.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className={featured ? "text-2xl md:text-3xl" : "text-2xl font-bold"}>{title}</h2>
      <div className={`mt-4 grid gap-3 ${featured ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
        {photos.map((p, i) => (
          <div key={p.id} className={featured && i === 0 ? "col-span-2 md:row-span-2" : ""}>
            <Reveal delay={featured ? (i % 3) * 90 : 0} className="h-full">
              <button
                type="button"
                onClick={() => setOpen(p)}
                aria-label={p.caption ? `Enlarge photo: ${p.caption}` : "Enlarge photo"}
                className={`group relative block w-full overflow-hidden rounded-xl ${featured ? (i === 0 ? "h-64 md:h-full md:min-h-[22rem]" : "h-44 md:h-52") : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.caption || title}
                  loading="lazy"
                  className={`w-full object-cover transition duration-500 group-hover:scale-105 ${featured ? "h-full" : "h-40"}`}
                />
                {featured && p.caption && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 text-left text-xs font-medium leading-snug text-white md:text-sm">
                    {p.caption}
                  </span>
                )}
              </button>
            </Reveal>
          </div>
        ))}
      </div>
      {open && (
        <div role="dialog" aria-modal="true" onClick={() => setOpen(null)} className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4">
          <figure className="max-h-full max-w-4xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={open.url} alt={open.caption || title} className="max-h-[80vh] rounded-lg" />
            {open.caption && <figcaption className="mt-2 text-center text-sm text-white">{open.caption}</figcaption>}
          </figure>
        </div>
      )}
    </section>
  );
}
