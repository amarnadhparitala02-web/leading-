// Single place for business details. Fill in the empty values before launch.
export const site = {
  name: "Leading Light Educational Services",
  short: "Leading Light",
  city: "Hyderabad",
  phone: "", // e.g. "9876543210" or "+91 98765 43210"
  whatsapp: "", // leave empty to use the phone number
  email: "",
  address: "",
  hours: "",
};

const digits = (v) => String(v || "").replace(/\D/g, "");
// Indian numbers: add the 91 country code when only 10 digits are given.
const withCountry = (v) => (digits(v).length === 10 ? `91${digits(v)}` : digits(v));

export const telHref = () => (site.phone ? `tel:+${withCountry(site.phone)}` : "");
export const waHref = (message = "Hi, I would like admission guidance.") => {
  const n = withCountry(site.whatsapp || site.phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : "";
};

export const EXAMS = ["TS EAPCET", "AP EAPCET"];
export const STATES = ["Telangana", "Andhra Pradesh"];
export const DEFAULT_EXAM = "TS EAPCET"; // cutoff records saved before AP support are TS EAPCET

export const CATEGORIES =["OC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST", "EWS"];
export const GENDERS = ["Boys", "Girls"];
export const STREAMS = { btech: "B.Tech", agriculture: "Agriculture" };
export const LEAD_STATUSES = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["scheduled", "Counselling Scheduled"],
  ["followup", "Follow-up Needed"],
  ["converted", "Converted"],
  ["closed", "Closed"],
];
