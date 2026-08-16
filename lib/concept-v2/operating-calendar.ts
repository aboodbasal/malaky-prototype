/**
 * The operating calendar — a month of Malaky's work, shown as a month.
 *
 * The point of the visualisation is that the whole month is already handled:
 * work behind the reference day is finished, work ahead of it is prepared or
 * being prepared, and the only thing left for a person is approval. A single
 * upcoming occasion cannot show that, so this carries past, present and future
 * together.
 *
 * ## Real vs fictional
 *
 * Two kinds of entry, and they are typed apart so they cannot be confused:
 *
 * - `observance` — a real public occasion. It carries no date of its own. The
 *   date comes from ./calendar, where it is recorded against an official
 *   source. A component may never place one of these on a date of its own
 *   choosing.
 * - `company` — a fictional demo-business event: a launch, a conference, an
 *   opening. Private company context, not a public holiday, and it says so in
 *   the UI. These need no verification and are dated freely.
 *
 * ## Why the month is anchored
 *
 * The grid is a fixed reference frame rather than the live current month, for
 * two reasons. It renders identically on the server and the client, so there
 * is no hydration mismatch and no blank calendar before JavaScript runs. And a
 * live month cannot be relied on to tell the story — visited on the 1st it
 * would have no completed work behind it, and the next verified observance
 * might not fall inside it at all.
 *
 * Only the month name is displayed, never the year, so the anchor cannot go
 * visibly stale. Countdowns are a separate matter: those are computed from the
 * real clock against the verified date — see ./calendar.
 */

import { getObservance, type Observance } from "./calendar";

/* ------------------------------------------------------------------ *
 * The reference frame
 * ------------------------------------------------------------------ */

/**
 * The month the calendar depicts, and the day it treats as "today".
 *
 * September, because that is the month holding the verified observance this
 * section is built around. The 11th, because it leaves real work on both
 * sides of it.
 */
export const ANCHOR = { year: 2026, month: 9, today: 11 } as const;

/* ------------------------------------------------------------------ *
 * Status
 * ------------------------------------------------------------------ */

export type ActivityStatus =
  | "opportunity"
  | "preparing"
  | "drafts-ready"
  | "awaiting-approval"
  | "campaign-ready"
  | "published"
  | "completed";

/**
 * Four readings, not seven. A visitor should be able to scan the month and
 * see at a glance what is done, what is moving, what wants them, and what has
 * only been noticed — without reading a legend.
 */
export type StatusTone = "done" | "moving" | "needs-you" | "noticed";

export interface StatusMeta {
  label: string;
  tone: StatusTone;
  /** The mark drawn in the calendar cell. */
  glyph: "check" | "full" | "half" | "ring";
}

export const STATUS: Record<ActivityStatus, StatusMeta> = {
  completed: { label: "Completed", tone: "done", glyph: "check" },
  published: { label: "Published", tone: "done", glyph: "check" },
  "campaign-ready": { label: "Campaign ready", tone: "needs-you", glyph: "full" },
  "awaiting-approval": { label: "Awaiting approval", tone: "needs-you", glyph: "full" },
  "drafts-ready": { label: "Drafts ready", tone: "moving", glyph: "half" },
  preparing: { label: "Preparing", tone: "moving", glyph: "half" },
  opportunity: { label: "Opportunity", tone: "noticed", glyph: "ring" },
};

/* ------------------------------------------------------------------ *
 * Entries
 * ------------------------------------------------------------------ */

/** One line of work in the detail panel. */
export interface WorkItem {
  channel: string;
  /** What happened to it. Past tense for finished work. */
  state: string;
  done: boolean;
}

interface EntryBase {
  id: string;
  /**
   * What the cell says. A seventh of a calendar cannot hold a full title, and
   * an ellipsis says nothing at all — so each entry names itself twice.
   */
  short: string;
  status: ActivityStatus;
  /** The channels, and where each one got to. */
  work: WorkItem[];
  /** Shown under the work list when something is still owed by a person. */
  awaiting?: string;
}

/** A real public occasion. Its date is looked up, never written here. */
interface ObservanceEntry extends EntryBase {
  kind: "observance";
  observanceId: string;
}

/** Fictional demo-business context. Dated freely because nothing is claimed. */
interface CompanyEntry extends EntryBase {
  kind: "company";
  title: string;
  day: number;
}

export type CalendarEntry = ObservanceEntry | CompanyEntry;

/**
 * The month's work.
 *
 * Ordered by day. Statuses run from finished on the left of the month to
 * barely-noticed on the right, which is what makes the row of marks read as a
 * pipeline rather than a scatter.
 */
export const ENTRIES: CalendarEntry[] = [
  {
    kind: "company",
    id: "quarterly-campaign",
    title: "Quarterly campaign launch",
    short: "Campaign launch",
    day: 3,
    status: "completed",
    work: [
      { channel: "Instagram", state: "Published", done: true },
      { channel: "LinkedIn company", state: "Published", done: true },
      { channel: "Executive LinkedIn", state: "Approved and published", done: true },
      { channel: "Arabic social", state: "Published", done: true },
      { channel: "Newsletter", state: "Sent", done: true },
    ],
  },
  {
    kind: "company",
    id: "branch-opening",
    title: "New branch opening",
    short: "Branch opening",
    day: 9,
    status: "published",
    work: [
      { channel: "Instagram", state: "Published", done: true },
      { channel: "LinkedIn company", state: "Published", done: true },
      { channel: "Arabic social", state: "Published", done: true },
      { channel: "Newsletter", state: "Sent", done: true },
    ],
  },
  {
    kind: "company",
    id: "ceo-conference",
    title: "CEO conference keynote",
    short: "CEO keynote",
    day: 17,
    status: "awaiting-approval",
    work: [
      { channel: "Executive LinkedIn", state: "Drafted in the CEO's voice", done: true },
      { channel: "LinkedIn company", state: "Drafted", done: true },
      { channel: "Instagram", state: "Drafted", done: true },
    ],
    awaiting: "Approval from Ahmed Al Farsi",
  },
  {
    kind: "observance",
    id: "national-day",
    observanceId: "sa-national-day",
    short: "National Day",
    status: "campaign-ready",
    work: [
      { channel: "Instagram", state: "Ready", done: true },
      { channel: "LinkedIn company", state: "Ready", done: true },
      { channel: "Executive LinkedIn", state: "Ready", done: true },
      { channel: "Arabic social", state: "Written natively", done: true },
      { channel: "Newsletter", state: "Ready", done: true },
    ],
    awaiting: "Your approval",
  },
  {
    kind: "company",
    id: "anniversary",
    title: "Company anniversary",
    short: "Anniversary",
    day: 26,
    status: "opportunity",
    work: [
      { channel: "Instagram", state: "Not started", done: false },
      { channel: "LinkedIn company", state: "Not started", done: false },
      { channel: "Arabic social", state: "Not started", done: false },
    ],
  },
  {
    kind: "company",
    id: "product-launch",
    title: "Product launch",
    short: "Product launch",
    day: 29,
    status: "preparing",
    work: [
      { channel: "Instagram", state: "Drafting", done: false },
      { channel: "LinkedIn company", state: "Drafted", done: true },
      { channel: "Executive LinkedIn", state: "Drafting", done: false },
      { channel: "Arabic social", state: "Queued", done: false },
      { channel: "Newsletter", state: "Queued", done: false },
    ],
  },
];

/** The entry selected when the section first renders. */
export const DEFAULT_ENTRY_ID = "national-day";

/* ------------------------------------------------------------------ *
 * Resolution
 * ------------------------------------------------------------------ */

export interface ResolvedEntry {
  id: string;
  kind: CalendarEntry["kind"];
  title: string;
  short: string;
  /** Day of the month. For an observance this came from the verified record. */
  day: number;
  status: ActivityStatus;
  work: WorkItem[];
  awaiting?: string;
  /** Present only for a verified public occasion. */
  observance?: Observance;
}

/**
 * Turns entries into something a component can place on a grid.
 *
 * An observance's day is read from the verified record, and it is dropped
 * entirely if it does not fall in the anchored month — better an absent event
 * than one moved to fit the layout.
 */
export function resolveEntries(month: number = ANCHOR.month): ResolvedEntry[] {
  const out: ResolvedEntry[] = [];

  for (const entry of ENTRIES) {
    if (entry.kind === "company") {
      out.push({ ...entry, title: entry.title, short: entry.short, day: entry.day });
      continue;
    }

    const observance = getObservance(entry.observanceId);
    if (observance.month !== month) continue;
    out.push({
      id: entry.id,
      kind: "observance",
      title: observance.name,
      short: entry.short,
      day: observance.day,
      status: entry.status,
      work: entry.work,
      awaiting: entry.awaiting,
      observance,
    });
  }

  return out.sort((a, b) => a.day - b.day);
}

/* ------------------------------------------------------------------ *
 * The grid
 * ------------------------------------------------------------------ */

/** Sunday first — the working week across the Gulf. */
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface DayCell {
  /** Null for the leading and trailing blanks that pad the grid. */
  day: number | null;
  entry?: ResolvedEntry;
  /** Before, on, or after the anchored reference day. */
  when: "past" | "today" | "future";
}

/**
 * Builds the month grid, padded to whole weeks.
 *
 * Uses Date.UTC so the first weekday of the month cannot shift with the
 * viewer's timezone — the grid must be identical everywhere it renders.
 */
export function buildMonth(entries: ResolvedEntry[]): DayCell[] {
  const { year, month, today } = ANCHOR;
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const byDay = new Map(entries.map((e) => [e.day, e]));

  const cells: DayCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, when: "past" });
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      entry: byDay.get(day),
      when: day < today ? "past" : day === today ? "today" : "future",
    });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, when: "future" });

  return cells;
}

export function monthName(month: number = ANCHOR.month): string {
  return MONTH_NAMES[month - 1];
}
