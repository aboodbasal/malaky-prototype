/**
 * Guards the real-calendar rule: a real country/event pairing must never
 * appear with an invented date, and a countdown must agree with the verified
 * date rather than being typed in.
 */
import { chromium } from "playwright";
import { OBSERVANCES, daysUntil, formatObservanceDate, formatCountdown }
  from "../lib/concept-v2/calendar.ts";

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let fail = 0;
const ok = (n, p, d = "") => { console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`); if (!p) fail++; };

/* --- the data itself ------------------------------------------------ */
for (const o of OBSERVANCES) {
  ok(`${o.name}: records a source`, o.source.trim().length > 20, o.source.slice(0, 48) + "…");
  ok(`${o.name}: records a verification date`, /^\d{4}-\d{2}-\d{2}$/.test(o.verified), o.verified);
  ok(`${o.name}: has a country`, o.country.length === 2 && o.countryName.length > 0,
     `${o.countryName} (${o.country})`);
  ok(`${o.name}: fixed events carry a real month/day`,
     o.kind !== "fixed" || (o.month >= 1 && o.month <= 12 && o.day >= 1 && o.day <= 31),
     `${o.day}/${o.month}`);
}

/* The two dates this concept relies on, checked against the official record. */
const expect = { "sa-national-day": [9, 23], "sa-founding-day": [2, 22] };
for (const [id, [m, d]] of Object.entries(expect)) {
  const o = OBSERVANCES.find((x) => x.id === id);
  ok(`${id} is ${d}/${m}`, o && o.month === m && o.day === d, o ? `${o.day}/${o.month}` : "missing");
}

/* Lunar observances need a per-year verified date, so none may be stored as a
   fixed Gregorian day. */
ok("no lunar event stored as a fixed date",
   !OBSERVANCES.some((o) => o.kind === "lunar" && o.month && o.day));

/* --- daysUntil, including the rollover and the day itself ------------ */
const nationalDay = OBSERVANCES.find((o) => o.id === "sa-national-day");
ok("daysUntil is 0 on the day", daysUntil(nationalDay, new Date(2026, 8, 23)) === 0);
ok("daysUntil is 1 the day before", daysUntil(nationalDay, new Date(2026, 8, 22)) === 1);
ok("daysUntil rolls to next year after the date",
   daysUntil(nationalDay, new Date(2026, 8, 24)) === 364,
   String(daysUntil(nationalDay, new Date(2026, 8, 24))));
ok("countdown wording", formatCountdown(0) === "Today" && formatCountdown(1) === "Tomorrow"
   && formatCountdown(38) === "38 days away");

/* --- what the page actually renders ---------------------------------- */
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
await p.locator("#product").scrollIntoViewIfNeeded();
await p.waitForTimeout(600);

/* The countdown is uppercased by CSS, so innerText never matches sentence
   case. Compare lowercased, or this asserts nothing. */
const panel = (await p.locator("#product").innerText()).replace(/\s+/g, " ").toLowerCase();
ok("the real date is shown", panel.includes(formatObservanceDate(nationalDay).toLowerCase()),
   formatObservanceDate(nationalDay));
ok("the event is named", panel.includes(nationalDay.name.toLowerCase()));

const expected = formatCountdown(daysUntil(nationalDay, new Date()));
ok("the countdown matches the verified date", panel.includes(expected.toLowerCase()), expected);

/* The old hard-coded countdown must not come back in any form. */
const stale = panel.match(/\b\d+ days away\b/g) || [];
ok("only one countdown, and it is the computed one",
   stale.length === 1 && stale[0] === expected.toLowerCase(), stale.join(", ") || "none");

ok("no hydration or console errors", errs.length === 0, errs.join(" | "));

/* Nothing anywhere else on the page pairs a real occasion with a date. */
const page = (await p.locator("main").innerText()).replace(/\s+/g, " ");
const REAL_EVENTS = /National Day|Founding Day|Ramadan|Eid al-Fitr|Eid al-Adha|Eid/gi;
const mentions = page.match(REAL_EVENTS) || [];
ok("only the verified occasion is named on the page",
   mentions.every((m) => /National Day/i.test(m)), [...new Set(mentions)].join(", ") || "none");

await b.close();
console.log(fail ? `\n${fail} FAILURE(S)` : "\nall checks passed");
process.exit(fail ? 1 : 0);
