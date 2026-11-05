// Fixed vocabulary used across the site. Business details (name, phone, hero text and so on)
// are not here any more: an admin edits them in the admin panel (see lib/settings.js).

export const EXAMS = ["TS EAPCET", "AP EAPCET"];
export const STATES = ["Telangana", "Andhra Pradesh", "Madhya Pradesh", "Uttarakhand", "Haryana", "Gujarat", "Maharashtra"];
export const DEFAULT_EXAM = "TS EAPCET"; // cutoff records saved before AP support are TS EAPCET

// Telangana (TS EAPCET) splits SC into groups I, II and III; Andhra Pradesh (AP EAPCET) uses a single SC.
export const CATEGORIES = ["OC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "SC-I", "SC-II", "SC-III", "ST", "EWS"];
const TS_ONLY = ["SC-I", "SC-II", "SC-III"];
export const categoriesFor = (exam) => CATEGORIES.filter((c) => (exam === "TS EAPCET" ? c !== "SC" : !TS_ONLY.includes(c)));
export const GENDERS = ["Boys", "Girls"];
export const STREAMS = { btech: "B.Tech", agriculture: "Agriculture" };
export const COLLEGE_TYPES = ["Government", "Private", "Autonomous", "University", "Deemed university"];
export const LEAD_STATUSES = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["scheduled", "Counselling Scheduled"],
  ["followup", "Follow-up Needed"],
  ["converted", "Converted"],
  ["closed", "Closed"],
];
