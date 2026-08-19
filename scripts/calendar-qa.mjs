/**
 * Guards the multi-market operating calendar.
 *
 * Two things matter most, and both are about honesty rather than layout:
 * every real occasion must carry its verified date for the right country, and
 * no country's occasion may ever appear in another country's calendar.
 */
import { chromium } from "playwright";
import {
  OBSERVANCES,
  daysUntil,
  formatCountdown,
  formatObservanceDate,
} from "../lib/concept-v2/calendar.ts";
import { MARKETS, STATUS, resolveEntries } from "../lib/concept-v2/operating-calendar.ts";

const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
let fail = 0;
const ok = (n, p, d = "") => {
  console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`);
  if (!p) fail++;
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* --- the verified record ---------------------------------------------- */

for (const o of OBSERVANCES) {
  ok(`${o.country} ${o.name}: records a source`, o.source.trim().length > 30);
  ok(`${o.country} ${o.name}: records a verification date`,
     /^\d{4}-\d{2}-\d{2}$/.test(o.verified), o.verified);
  ok(`${o.country} ${o.name}: lunar entries are year-specific`,
     o.kind !== "lunar" || typeof o.year === "number", o.kind);
  ok(`${o.country} ${o.name}: status is stated`,
     ["fixed", "announced", "provisional"].includes(o.status), o.status);
}

/* The dates themselves, each checked against the decree or announcement that
   sets it. A wrong day here is the worst bug this section can have. */
const EXPECTED = {
  "sa-national-day": [9, 23, "Wednesday"],
  "sa-founding-day": [2, 22, null],
  "ae-eid-al-etihad": [12, 2, "Wednesday"],
  "jo-labour-day": [5, 1, "Friday"],
  "jo-independence-day": [5, 25, "Monday"],
  "jo-eid-al-adha-2026": [5, 26, "Tuesday"],
  "qa-sport-day": [2, 10, "Tuesday"],
  "qa-national-day": [12, 18, null],
  "om-national-day": [11, 20, "Friday"],
};
for (const [id, [month, day, weekday]] of Object.entries(EXPECTED)) {
  const o = OBSERVANCES.find((x) => x.id === id);
  ok(`${id} is ${day}/${month}`, o && o.month === month && o.day === day,
     o ? `${o.day}/${o.month}` : "missing");
  if (weekday) {
    const actual = WEEKDAYS[new Date(Date.UTC(2026, month - 1, day)).getUTCDay()];
    ok(`${id} falls on a ${weekday} in 2026`, actual === weekday, actual);
  }
}

/* --- the markets -------------------------------------------------------- */

ok("five markets", MARKETS.length === 5, MARKETS.map((m) => m.label).join(", "));

const months = MARKETS.map((m) => `${m.label}:${m.anchor.month}`);
ok("each market has its own month, not a global one",
   new Set(MARKETS.map((m) => m.anchor.month)).size === MARKETS.length, months.join(" "));

for (const market of MARKETS) {
  const entries = resolveEntries(market);
  const marketEvents = entries.filter((e) => e.kind === "market");
  const companyEvents = entries.filter((e) => e.kind === "company");

  ok(`${market.label}: has at least one verified market event`, marketEvents.length >= 1,
     marketEvents.map((e) => e.title).join(", "));
  ok(`${market.label}: has 3–5 illustrative company events`,
     companyEvents.length >= 3 && companyEvents.length <= 5, String(companyEvents.length));

  /* The check the whole feature depends on. */
  const foreign = marketEvents.filter((e) => e.observance.country !== market.code);
  ok(`${market.label}: no other country's occasion appears`, foreign.length === 0,
     foreign.map((e) => `${e.title} (${e.observance.country})`).join(", "));

  ok(`${market.label}: market events land on their verified day`,
     marketEvents.every((e) => e.day === e.observance.day && e.observance.month === market.anchor.month));

  const raw = market.entries.filter((e) => e.kind === "market");
  ok(`${market.label}: market entries carry no date of their own`,
     raw.every((e) => !("day" in e)), `${raw.length} checked`);

  ok(`${market.label}: every company event names its type`,
     companyEvents.every((e) => typeof e.eventType === "string" && e.eventType.length > 0));

  ok(`${market.label}: work is attached to every event`,
     entries.every((e) => e.work.length >= 2));

  const tones = new Set(entries.map((e) => STATUS[e.status].tone));
  ok(`${market.label}: the month reads as a pipeline, not one state`, tones.size >= 3,
     [...tones].join(", "));

  const past = entries.filter((e) => e.day < market.anchor.today);
  const future = entries.filter((e) => e.day > market.anchor.today);
  ok(`${market.label}: work on both sides of the reference day`,
     past.length > 0 && future.length > 0, `${past.length} past / ${future.length} ahead`);
  ok(`${market.label}: everything behind the reference day is done`,
     past.every((e) => STATUS[e.status].tone === "done"),
     past.map((e) => `${e.day}:${STATUS[e.status].tone}`).join(" "));
}

/* --- the rendered section ---------------------------------------------- */

const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => {
  if (m.type() === "error") errs.push(m.text());
});
await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
await p.locator("#product").scrollIntoViewIfNeeded();
await p.waitForTimeout(600);

const seen = [];
for (const market of MARKETS) {
  await p.locator(`#product button:text-is("${market.label}")`).click();
  await p.waitForTimeout(250);

  const view = await p.evaluate(() => {
    const sec = document.querySelector("#product");
    const cells = [...sec.querySelectorAll("[role=listitem]")];
    return {
      month: sec.querySelector("h3").innerText,
      days: cells.length,
      today: cells.filter((c) => c.dataset.when === "today").length,
      past: cells.filter((c) => c.dataset.when === "past").length,
      future: cells.filter((c) => c.dataset.when === "future").length,
      events: cells.filter((c) => c.dataset.hasEvent).length,
      panel: sec.querySelector("[aria-live]").innerText.replace(/\s+/g, " "),
    };
  });
  seen.push(view.month);

  const expectedDays = new Date(Date.UTC(market.anchor.year, market.anchor.month, 0)).getUTCDate();
  console.log(`\n--- ${market.label} ---`);
  ok("the month and year are named", view.month === `${
    ["January","February","March","April","May","June","July","August","September","October","November","December"][market.anchor.month - 1]
  } ${market.anchor.year}`, view.month);
  ok("the grid has the month's real length", view.days === expectedDays, String(view.days));
  ok("past, present and future are all shown",
     view.past > 0 && view.today === 1 && view.future > 0,
     `${view.past} / ${view.today} / ${view.future}`);
  ok("every entry is placed", view.events === resolveEntries(market).length, String(view.events));

  const entries = resolveEntries(market);
  const defaultEntry = entries.find((e) => e.id === market.defaultEntryId);
  ok("the market's own opening event is selected",
     view.panel.toLowerCase().includes(defaultEntry.title.toLowerCase()), defaultEntry.title);
  ok("the panel distinguishes market from company",
     /MARKET EVENT|COMPANY EVENT/.test(view.panel));

  if (defaultEntry.observance) {
    ok("the verified date is shown",
       view.panel.toLowerCase().includes(formatObservanceDate(defaultEntry.observance).toLowerCase()),
       formatObservanceDate(defaultEntry.observance));
  }

  /* No other market's occasion may be visible from here. */
  const otherOccasions = OBSERVANCES.filter((o) => o.country !== market.code).map((o) => o.name);
  const leaked = otherOccasions.filter((name) => view.panel.includes(name));
  ok("no other market's occasion leaks into the panel", leaked.length === 0, leaked.join(", "));

  ok("no fabricated performance figures",
     !/(impressions|reach|engagement rate|\bctr\b|\broi\b|\d+% (uplift|increase|growth))/i.test(view.panel));
  ok("no live countdown in an anchored month", !/\b\d+ days away\b/.test(view.panel));
}

ok("switching market switches the month", new Set(seen).size === MARKETS.length, seen.join(" · "));

/* Selecting a company event inside a market updates the panel. */
await p.locator(`#product button:text-is("Oman")`).click();
await p.waitForTimeout(200);
await p.locator('#product [role=listitem] button', { hasText: "Trade show" }).first().click();
await p.waitForTimeout(250);
const company = (await p.locator("#product [aria-live]").innerText()).replace(/\s+/g, " ");
ok("selecting a company event updates the panel", /Trade show attendance/i.test(company));
ok("a company event is labelled as one and typed", /COMPANY EVENT · Industry event/i.test(company));

/* Keyboard. */
await p.locator("#product button").first().focus();
await p.keyboard.press("Enter");
await p.waitForTimeout(200);
ok("the market selector is operable by keyboard",
   (await p.locator("#product button[aria-pressed=true]").count()) >= 1);

ok("the countdown helpers still work off the verified date",
   formatCountdown(daysUntil(OBSERVANCES.find((o) => o.id === "sa-national-day"), new Date(2026, 8, 22))) === "Tomorrow");

ok("no console or hydration errors", errs.length === 0, errs.join(" | "));

await b.close();
console.log(fail ? `\n${fail} FAILURE(S)` : "\nall checks passed");
process.exit(fail ? 1 : 0);
