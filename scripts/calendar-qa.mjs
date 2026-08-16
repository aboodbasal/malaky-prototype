/**
 * Guards two things: the real-calendar rule, and that the operating calendar
 * actually reads as a month of work rather than one event in a box.
 */
import { chromium } from "playwright";
import { OBSERVANCES, daysUntil, formatCountdown } from "../lib/concept-v2/calendar.ts";
import { ANCHOR, ENTRIES, STATUS, resolveEntries } from "../lib/concept-v2/operating-calendar.ts";

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let fail = 0;
const ok = (n, p, d = "") => { console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`); if (!p) fail++; };

/* --- verified data -------------------------------------------------- */
for (const o of OBSERVANCES) {
  ok(`${o.name}: records a source`, o.source.trim().length > 20);
  ok(`${o.name}: records a verification date`, /^\d{4}-\d{2}-\d{2}$/.test(o.verified), o.verified);
}
const expect = { "sa-national-day": [9, 23], "sa-founding-day": [2, 22] };
for (const [id, [m, d]] of Object.entries(expect)) {
  const o = OBSERVANCES.find((x) => x.id === id);
  ok(`${id} is ${d}/${m}`, o && o.month === m && o.day === d, o ? `${o.day}/${o.month}` : "missing");
}
ok("no lunar event stored as a fixed date",
   !OBSERVANCES.some((o) => o.kind === "lunar" && o.month && o.day));

const nationalDay = OBSERVANCES.find((o) => o.id === "sa-national-day");
ok("daysUntil is 0 on the day", daysUntil(nationalDay, new Date(2026, 8, 23)) === 0);
ok("daysUntil rolls to next year after the date",
   daysUntil(nationalDay, new Date(2026, 8, 24)) === 364);

/* No component may place a real occasion itself: an observance entry has no
   day of its own, and resolveEntries reads it from the verified record. */
const observanceEntries = ENTRIES.filter((e) => e.kind === "observance");
ok("observance entries carry no date of their own",
   observanceEntries.every((e) => !("day" in e)), `${observanceEntries.length} checked`);
const resolved = resolveEntries();
const resolvedNd = resolved.find((e) => e.kind === "observance");
ok("the observance resolves onto its verified day", resolvedNd.day === nationalDay.day,
   `day ${resolvedNd.day}`);

/* --- the rendered month --------------------------------------------- */
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
await p.locator("#product").scrollIntoViewIfNeeded();
await p.waitForTimeout(700);

const cal = p.locator("#product");
ok("the month is named", (await cal.innerText()).toLowerCase().includes("september"));
ok("seven weekday columns", (await p.locator("#product [aria-hidden] > span").count()) >= 7);

const grid = await p.evaluate(() => {
  const cells = [...document.querySelectorAll("#product [role=listitem]")];
  return {
    days: cells.length,
    past: cells.filter((c) => c.dataset.when === "past").length,
    today: cells.filter((c) => c.dataset.when === "today").length,
    future: cells.filter((c) => c.dataset.when === "future").length,
    withEvents: cells.filter((c) => c.dataset.hasEvent).length,
  };
});
ok("thirty numbered days", grid.days === 30, String(grid.days));
ok("the month shows past, present and future",
   grid.past > 0 && grid.today === 1 && grid.future > 0,
   `${grid.past} past / ${grid.today} today / ${grid.future} future`);
ok("events on both sides of today", grid.withEvents === ENTRIES.length, `${grid.withEvents} events`);

/* The verified occasion must sit in the cell numbered 23. */
const ndCell = await p.evaluate(() => {
  const cells = [...document.querySelectorAll("#product [role=listitem]")];
  const hit = cells.find((c) => /national day/i.test(c.textContent));
  return hit ? Number(hit.querySelector("span").textContent) : null;
});
ok("the observance is drawn on its verified day", ndCell === nationalDay.day, `cell ${ndCell}`);

/* Past work must be finished and future work must not be. */
const marks = await p.evaluate(() => {
  const cells = [...document.querySelectorAll("#product [role=listitem]")];
  return cells.filter((c) => c.dataset.hasEvent).map((c) => ({
    day: Number(c.querySelector("span").textContent),
    tone: c.querySelector("button").dataset.tone,
  }));
});
ok("everything behind today is done",
   marks.filter((m) => m.day < ANCHOR.today).every((m) => m.tone === "done"),
   marks.filter((m) => m.day < ANCHOR.today).map((m) => `${m.day}:${m.tone}`).join(" "));
ok("nothing ahead of today is marked done",
   marks.filter((m) => m.day > ANCHOR.today).every((m) => m.tone !== "done"),
   marks.filter((m) => m.day > ANCHOR.today).map((m) => `${m.day}:${m.tone}`).join(" "));
ok("all four readings appear in the month",
   new Set(marks.map((m) => m.tone)).size === 4, [...new Set(marks.map((m) => m.tone))].join(", "));

/* --- the detail panel ------------------------------------------------ */
let panel = (await cal.innerText()).replace(/\s+/g, " ").toLowerCase();
ok("the verified occasion is selected by default", panel.includes("saudi national day"));
ok("it is labelled a public holiday", panel.includes("public holiday"));
const expected = formatCountdown(daysUntil(nationalDay, new Date()));
ok("its countdown is computed from the verified date", panel.includes(expected.toLowerCase()), expected);
ok("the prepared channels are listed",
   ["instagram", "linkedin company", "executive linkedin", "arabic social", "newsletter"]
     .every((c) => panel.includes(c)));
ok("it shows what is awaited", panel.includes("your approval"));
ok("it offers the review affordance", panel.includes("review campaign"));

/* Selecting a finished event changes the panel and drops the CTA. */
await p.locator("#product button", { hasText: "Campaign launch" }).first().click();
await p.waitForTimeout(400);
panel = (await cal.innerText()).replace(/\s+/g, " ").toLowerCase();
ok("selecting another event updates the panel", panel.includes("quarterly campaign launch"));
ok("a company event is labelled as one", panel.includes("company event"));
ok("a finished event reads as completed", panel.includes("completed"));
ok("a finished event offers no review CTA", !panel.includes("review campaign"));
ok("a finished event carries no countdown", !/\d+ days away/.test(panel));

/* Nothing anywhere invents performance. */
ok("no fabricated performance figures",
   !/(impressions|reach|engagement rate|ctr|roi|\d+% (uplift|increase|growth))/i.test(panel));

/* --- keyboard -------------------------------------------------------- */
const first = p.locator("#product button").first();
await first.focus();
await p.keyboard.press("Enter");
await p.waitForTimeout(300);
ok("events are operable by keyboard",
   (await p.locator("#product button[aria-pressed=true]").count()) === 1);
const ring = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== "none");
ok("focused event shows a ring", ring);

ok("no console or hydration errors", errs.length === 0, errs.join(" | "));

/* --- statuses are all reachable in the data -------------------------- */
const used = new Set(ENTRIES.map((e) => e.status));
ok("every status maps to a tone and a glyph",
   [...used].every((s) => STATUS[s] && STATUS[s].tone && STATUS[s].glyph), [...used].join(", "));

await b.close();
console.log(fail ? `\n${fail} FAILURE(S)` : "\nall checks passed");
process.exit(fail ? 1 : 0);
