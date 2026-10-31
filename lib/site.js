// Fixed vocabulary used across the site. Business details (name, phone, hero text and so on)
// are not here any more: an admin edits them in the admin panel (see lib/settings.js).

export const EXAMS = ["TS EAPCET", "AP EAPCET"];
export const STATES = ["Telangana", "Andhra Pradesh", "Madhya Pradesh", "Uttarakhand", "Haryana", "Gujarat"];
export const DEFAULT_EXAM = "TS EAPCET"; // cutoff records saved before AP support are TS EAPCET

export const CATEGORIES = ["OC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST", "EWS"];
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
