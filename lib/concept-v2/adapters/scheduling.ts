/**
 * SchedulingAdapter — the seam where a walkthrough would actually be booked.
 *
 * ## What the UI hands it
 *
 * A `WalkthroughRequest`: the customer's timezone, the windows that suit them,
 * how soon they want it, who else should join and any note. It is a statement
 * of preference, not a chosen slot.
 *
 * ## What the UI expects back
 *
 * `SchedulingResult`. On `ok` the flow moves to the completion screen, which
 * says the time will be confirmed — not that a meeting exists.
 *
 * ## Why no times are shown
 *
 * A grid of bookable slots would be the obvious design, and it would be a lie:
 * this repository has no calendar, no availability and no way to hold a time.
 * Rather than print plausible-looking slots and label them fake, the step asks
 * for preferences, which is honest at every size and needs no disclaimer to
 * be true. Nothing here invents availability.
 *
 * ## What production must provide
 *
 * - Real availability from the team's calendars, in the customer's timezone.
 * - A booking that holds the slot, with the double-booking race handled
 *   server-side rather than by whoever clicked first.
 * - Calendar invitations to the customer and to whoever is attending, and a
 *   video link if the walkthrough is remote.
 * - Reminders, rescheduling and cancellation, each of which is a screen this
 *   concept does not have.
 * - A decision about whether the customer picks a slot or the team proposes
 *   one. If it becomes slot-picking, this step is redesigned — the preference
 *   form below is not a slot picker with the slots missing.
 *
 * No scheduling provider is chosen, and none is named anywhere in this file.
 */

/** Where the customer is, in the markets this launch covers. */
export const TIMEZONES = [
  { id: "riyadh", label: "Riyadh (GMT+3)" },
  { id: "dubai", label: "Dubai / Muscat (GMT+4)" },
  { id: "amman", label: "Amman (GMT+3)" },
  { id: "doha", label: "Doha (GMT+3)" },
  { id: "other", label: "Somewhere else" },
] as const;

/**
 * Windows rather than times. A window is true regardless of what the team's
 * calendar looks like; a time is not.
 */
export const WINDOWS = [
  { id: "morning", label: "Morning", detail: "Before 12:00" },
  { id: "midday", label: "Midday", detail: "12:00 – 15:00" },
  { id: "afternoon", label: "Afternoon", detail: "15:00 – 18:00" },
  { id: "evening", label: "Evening", detail: "After 18:00" },
] as const;

/** Relative, so no date is invented for a calendar that does not exist. */
export const HORIZONS = [
  { id: "soon", label: "In the next few days" },
  { id: "week", label: "Next week" },
  { id: "later", label: "Later this month" },
] as const;

export interface WalkthroughRequest {
  timezone: string;
  /** One or more ids from WINDOWS. */
  windows: string[];
  horizon: string;
  /** Free text — colleagues who should be on the call. */
  attendees: string;
  notes: string;
}

export const EMPTY_WALKTHROUGH: WalkthroughRequest = {
  timezone: "riyadh",
  windows: [],
  horizon: "soon",
  attendees: "",
  notes: "",
};

export interface SchedulingResult {
  ok: boolean;
  /** True in this repository, always. Production sets it false. */
  demoMode: boolean;
  message?: string;
}

/** Long enough for the pending state to read as a request. */
const MOCK_LATENCY_MS = 700;

/**
 * Records a preference and returns. Nothing is booked, no invitation is sent,
 * and no time is held.
 */
export async function requestWalkthrough(
  request: WalkthroughRequest,
): Promise<SchedulingResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  void request;
  return { ok: true, demoMode: true };
}

/** What the call actually covers. Each line is something Malaky demonstrates. */
export const WALKTHROUGH_COVERS = [
  "How Malaky read your brand, and what it got right.",
  "The first marketing calendar it prepared for your business.",
  "Your company voice and executive voices, side by side.",
  "How approvals will run inside your team.",
];
