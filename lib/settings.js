// Site settings that an admin edits in the admin panel. Pure functions, safe to import in both
// server and client code. Anything not saved yet falls back to these defaults.

export const DEFAULT_SETTINGS = {
  name: "Leading Light Educational Services",
  short: "Leading Light",
  city: "Hyderabad",
  phone: "",
  whatsapp: "", // empty means: use the phone number
  email: "",
  address: "",
  hours: "",
  hero: {
    eyebrow: "Your +2 journey is complete",
    headline: "Your future journey",
    highlight: "starts here.",
    text: "From choosing the right course to finding a college that fits your goals, we help you understand your options and take the next step with confidence.",
  },
  about: {
    intro: "",   // paragraphs separated by a blank line; empty shows the standard text
    videos: [],  // [{ title, url }] YouTube links
    documents: [], // [{ label, url }] brochures, PDFs
  },
  footerBlurb: "Helping students across Andhra Pradesh and Telangana understand their options after +2, and take the next step with confidence.",
  officialLinks: [
    { label: "Telangana State Council of Higher Education", url: "https://tgche.ac.in" },
    { label: "Andhra Pradesh State Council of Higher Education", url: "https://apsche.ap.gov.in" },
  ],
  sections: { afterPlusTwo: true, journey: true, paths: true, colleges: true, parents: true, gallery: true },
};

export const SECTION_LABELS = {
  afterPlusTwo: "The moment after +2",
  journey: "Journey timeline",
  paths: "Choose your course (B.Tech / Agriculture)",
  colleges: "Discover colleges",
  parents: "For parents",
  gallery: "Photo gallery",
};

// Saved values win; missing ones fall back to the defaults.
export function mergeSettings(saved = {}) {
  const d = DEFAULT_SETTINGS;
  return {
    ...d,
    ...saved,
    hero: { ...d.hero, ...(saved.hero || {}) },
    about: { ...d.about, ...(saved.about || {}) },
    sections: { ...d.sections, ...(saved.sections || {}) },
    officialLinks: Array.isArray(saved.officialLinks) ? saved.officialLinks : d.officialLinks,
  };
}

const str = (v, max) => String(v ?? "").trim().slice(0, max);
// Video id from a youtube.com / youtu.be link, or "" when it is not one.
export const youtubeId = (u) => {
  const m = String(u || "").trim().match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  return m ? m[1] : "";
};
const httpUrl = (v) => (/^https?:\/\//i.test(String(v || "").trim()) ? str(v, 300) : "");

// Cleans whatever the admin form sends. Only known fields are kept, with length limits and
// web links restricted to http(s).
export function cleanSettings(b = {}) {
  const d = DEFAULT_SETTINGS;
  const h = b.hero || {};
  return {
    name: str(b.name, 120) || d.name,
    short: str(b.short, 60) || d.short,
    city: str(b.city, 60) || d.city,
    phone: str(b.phone, 30),
    whatsapp: str(b.whatsapp, 30),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(b.email, 120)) ? str(b.email, 120) : "",
    address: str(b.address, 300),
    hours: str(b.hours, 120),
    hero: {
      eyebrow: str(h.eyebrow, 80) || d.hero.eyebrow,
      headline: str(h.headline, 120) || d.hero.headline,
      highlight: str(h.highlight, 60),
      text: str(h.text, 400) || d.hero.text,
    },
    about: {
      intro: str(b.about?.intro, 4000),
      videos: (Array.isArray(b.about?.videos) ? b.about.videos : [])
        .map((v) => ({ title: str(v?.title, 120), url: youtubeId(v?.url) ? str(v.url, 300) : "" }))
        .filter((v) => v.url)
        .slice(0, 12),
      documents: (Array.isArray(b.about?.documents) ? b.about.documents : [])
        .map((l) => ({ label: str(l?.label, 120), url: httpUrl(l?.url) }))
        .filter((l) => l.label && l.url)
        .slice(0, 12),
    },
    footerBlurb: str(b.footerBlurb, 300) || d.footerBlurb,
    officialLinks: (Array.isArray(b.officialLinks) ? b.officialLinks : [])
      .map((l) => ({ label: str(l?.label, 120), url: httpUrl(l?.url) }))
      .filter((l) => l.label && l.url)
      .slice(0, 8),
    sections: Object.fromEntries(Object.keys(d.sections).map((k) => [k, b.sections?.[k] !== false])),
  };
}

const digits = (v) => String(v || "").replace(/\D/g, "");
// Indian numbers: add the 91 country code when only 10 digits are given.
const withCountry = (v) => (digits(v).length === 10 ? `91${digits(v)}` : digits(v));

export const telHref = (s) => (s?.phone ? `tel:+${withCountry(s.phone)}` : "");
export const waHref = (s, message = "Hi, I would like admission guidance.") => {
  const n = withCountry(s?.whatsapp || s?.phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : "";
};
