"use client";

import { useEffect, useState } from "react";

// Photo grid with a simple click-to-enlarge viewer. Pass `photos`, or leave it out
// to load the general site gallery. Renders nothing when there are no photos.
export default function Gallery({ photos: given, title = "Gallery" }) {
  const [photos, setPhotos] = useState(given || []);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (given) return;
    fetch("/api/gallery").then((r) => r.json()).then((d) => setPhotos(d.photos)).catch(() => {});
  }, [given]);

  if (!photos.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {photos.map((p) => (
          <button key={p.id} onClick={() => setOpen(p)} className="overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption || title} loading="lazy" className="h-40 w-full object-cover transition hover:scale-105" />
          </button>
        ))}
      </div>
      {open && (
        <div onClick={() => setOpen(null)} className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4">
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
