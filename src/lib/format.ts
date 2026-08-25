/**
 * Every number and date the UI prints goes through here, in en-GB.
 *
 * Counts are rounded to whole vehicles on the way out: the API returns
 * decimals because the 2024 baseline is a mean, but the model's own error is
 * ±18/h at best, so a decimal is noise dressed as precision.
 */

const LOCALE = "en-GB";

/** Whole vehicles, thousands-separated. */
export function formatCount(n: number): string {
  return Math.round(n).toLocaleString(LOCALE);
}

/** 14 -> "14:00" */
export function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

/** Signed, so "+4%" and "-4%" both read as a direction, not just a size. */
export function formatSignedPercent(pct: number, digits = 0): string {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(digits)}%`;
}

function parseIsoDate(iso: string): Date | null {
  // Midnight local, not UTC: `new Date("2025-02-15")` is UTC and lands on the
  // previous day west of Greenwich, which would name the wrong weekday.
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "2025-02-15" -> "Saturday", or "" when the input is not a date yet. */
export function weekdayName(iso: string): string {
  return parseIsoDate(iso)?.toLocaleDateString(LOCALE, { weekday: "long" }) ?? "";
}

/** "2025-02-15" -> "15 February 2025", or the input back if it will not parse. */
export function longDate(iso: string): string {
  return (
    parseIsoDate(iso)?.toLocaleDateString(LOCALE, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) ?? iso
  );
}
