"use client";

// The colleges a visitor has ticked for comparison (up to 3), kept in their own browser only.
// Wrapped in try/catch because browser storage can be blocked or unavailable.
const KEY = "ll_compare";
export const MAX_COMPARE = 3;

export function getCompare() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

export function setCompare(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX_COMPARE)));
  } catch {
    /* storage unavailable: the comparison just will not persist */
  }
  window.dispatchEvent(new Event("ll-compare"));
}
