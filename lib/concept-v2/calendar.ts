/**
 * Real-world calendar data.
 *
 * ## The rule
 *
 * Any real holiday, national day, religious event or public occasion shown
 * anywhere in Malaky must carry the correct official date for the specific
 * country and year being displayed. Nothing here may be written from memory:
 * an entry only exists once it has been checked against an authoritative
 * government or official source, and the source is recorded on the entry.
 *
 * A real country/event pairing must never appear with an invented date — and
 * that includes a countdown, which asserts a date implicitly. Countdowns in
 * the UI are computed from the verified date, never typed in.
 *
 * ## Fixed vs. lunar
 *
 * `kind: "fixed"` events fall on the same Gregorian day every year and can be
 * expressed once. `kind: "lunar"` events — Ramadan, Eid al-Fitr, Eid al-Adha —
 * move each Gregorian year and their final observance depends on official
 * lunar-calendar announcements, which can shift the day even after a
 * prediction is published. They therefore need a verified entry *per country
 * per year*, and are deliberately absent below rather than estimated. Add them
 * only with a year-specific official source, and mark whether the date is
 * announced or still provisional.
 *
 * ## Fictional business events
 *
 * Product launches, conferences, branch openings and anniversaries are company
 * context, not public occasions. They live with the demo brands in ./content
 * and must never be presented as public holidays.
 */

export type ObservanceKind = "fixed" | "lunar";

export interface Observance {
  id: string;
  /** English name as the official source gives it. */
  name: string;
  /** ISO 3166-1 alpha-2. An observance is always tied to a country. */
  country: "SA";
  countryName: string;
  kind: ObservanceKind;
  /** Gregorian month (1–12) and day, for `kind: "fixed"` only. */
  month: number;
  day: number;
  /** What the day marks, in one line. */
  commemorates: string;
  /**
   * Where the date was checked. Required — an entry without a source has not
   * been verified and does not belong here.
   */
  source: string;
  /** When this entry was last checked against that source. */
  verified: string;
}

/**
 * Verified fixed-date observances.
 *
 * Both were confirmed against the royal orders that established them, as
 * reported by the Saudi Press Agency and corroborated by the Ministry of
 * Foreign Affairs and Saudipedia. Neither moves: they are Gregorian-fixed, so
 * one entry serves every year.
 */
export const OBSERVANCES: Observance[] = [
  {
    id: "sa-national-day",
    name: "Saudi National Day",
    country: "SA",
    countryName: "Saudi Arabia",
    kind: "fixed",
    month: 9,
    day: 23,
    commemorates:
      "The 1932 royal decree renaming the Kingdom of Nejd and Hejaz as the Kingdom of Saudi Arabia.",
    source:
      "Royal decree of 1932, as published by the Saudi Press Agency (spa.gov.sa) and Visit Saudi (visitsaudi.com/en/saudi-calendar/saudi-national-day).",
    verified: "2026-08-16",
  },
  {
    id: "sa-founding-day",
    name: "Saudi Founding Day",
    country: "SA",
    countryName: "Saudi Arabia",
    kind: "fixed",
    month: 2,
    day: 22,
    commemorates:
      "The founding of the First Saudi State by Imam Muhammad bin Saud in 1727.",
    source:
      "Royal order of 27 January 2022 designating 22 February annually, published by the Saudi Press Agency (spa.gov.sa/2324647) and the Ministry of Foreign Affairs (mofa.gov.sa).",
    verified: "2026-08-16",
  },
];

const BY_ID = new Map(OBSERVANCES.map((o) => [o.id, o]));

export function getObservance(id: string): Observance {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`No verified observance: ${id}`);
  return found;
}

/* ------------------------------------------------------------------ *
 * Rendering helpers
 * ------------------------------------------------------------------ */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "23 September" — the date itself, with no year attached. */
export function formatObservanceDate(o: Observance): string {
  return `${o.day} ${MONTHS[o.month - 1]}`;
}

/**
 * Whole days from `today` until the observance's next occurrence.
 *
 * Compared on calendar date parts rather than timestamps, so a viewer's
 * timezone offset can never move the answer by a day. Returns 0 on the day
 * itself, and rolls to next year once the date has passed.
 *
 * Callers must pass `today` — this module never reads the clock, so nothing
 * here can differ between a server render and the first client render.
 */
export function daysUntil(o: Observance, today: Date): number {
  const y = today.getFullYear();
  const startOfDay = Date.UTC(y, today.getMonth(), today.getDate());
  let target = Date.UTC(y, o.month - 1, o.day);
  if (target < startOfDay) target = Date.UTC(y + 1, o.month - 1, o.day);
  return Math.round((target - startOfDay) / 86_400_000);
}

/** "38 days away" · "Tomorrow" · "Today". */
export function formatCountdown(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days away`;
}
