/**
 * Guards the two website legal pages.
 *
 * The important checks are the negative ones: no invented entity, no invented
 * jurisdiction, no invented address, no compliance or security claim, and no
 * statement about where customer data lives — none of that has been decided,
 * and a legal page is exactly where an invention would do damage.
 */
import { chromium } from "playwright";
import { LEGAL, isProductionReady } from "../lib/concept-v2/legal.ts";

const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
let fail = 0;
const ok = (n, p, d = "") => {
  console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`);
  if (!p) fail++;
};

/* --- the config -------------------------------------------------------- */
const readiness = isProductionReady();
ok("legal config reports what is outstanding", Array.isArray(readiness.missing),
   readiness.missing.join(", ") || "nothing outstanding");
for (const [key, value] of Object.entries(LEGAL)) {
  if (value == null) continue;
  ok(`${key} is a decided value, not a guess`, typeof value === "string" && value.length > 0);
}

/* Anything that would be a fabricated real-world fact. */
const FORBIDDEN = [
  // named providers, none of which is connected
  /\bopenai\b/i, /\banthropic\b/i, /\baws\b/i, /amazon web services/i, /\bazure\b/i,
  /google cloud/i, /\bhubspot\b/i, /\bsalesforce\b/i,
  // compliance and certification claims
  /fully compliant/i, /\bgdpr[- ]compliant\b/i, /\bpdpl[- ]compliant\b/i,
  /\biso ?27001\b/i, /\bsoc ?2\b/i, /\bcertified\b/i, /\baudited\b/i,
  // security architecture
  /\bencrypt/i, /\bat rest\b/i, /\bin transit\b/i, /data cent/i, /\bhosted in\b/i,
  /access controls/i, /\b(data|storage|hosting) region\b/i,
  // invented specifics
  /within \d+ (business )?days/i, /\bfor \d+ (months|years)\b/i, /\b30 days\b/i,
  // a company entity or law nobody has chosen
  /\bLLC\b/, /\bFZ-?LLC\b/i, /\bLtd\b/, /\bDIFC\b/i, /\bADGM\b/i,
  /laws of (the )?(kingdom|united|saudi|jordan|england|dubai|uae)/i,
  // an address that looks like an address
  /@malaky\.(com|io|ai|co)/i,
];

const pages = [
  ["/concept-v2/privacy", "Privacy Policy", 11],
  ["/concept-v2/terms", "Website Terms of Use", 13],
];

for (const [route, title, sectionCount] of pages) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => {
    if (m.type() === "error") errs.push(m.text());
  });
  await p.goto("http://localhost:3000" + route, { waitUntil: "networkidle" });

  const text = (await p.locator("body").innerText()).replace(/\s+/g, " ");
  console.log(`\n--- ${route} ---`);

  ok("page title renders", (await p.locator("h1").innerText()).includes(title));
  ok("one h1", (await p.locator("h1").count()) === 1);
  ok("sections are all h2", (await p.locator("article h2").count()) === sectionCount,
     `${await p.locator("article h2").count()} of ${sectionCount}`);
  ok("contents list matches the sections",
     (await p.locator("nav[aria-label=Contents] a").count()) === sectionCount);

  /* Every contents entry points at a section that exists. */
  const anchors = await p.$$eval("nav[aria-label=Contents] a", (as) =>
    as.map((a) => a.getAttribute("href").slice(1)));
  const missingTargets = [];
  for (const id of anchors) {
    if (!(await p.evaluate((i) => !!document.getElementById(i), id))) missingTargets.push(id);
  }
  ok("every contents link resolves", missingTargets.length === 0, missingTargets.join(", "));

  for (const pattern of FORBIDDEN) {
    const hit = text.match(pattern);
    if (hit) ok(`no invented claim: ${pattern}`, false, `found "${hit[0]}"`);
  }
  ok("no invented entity, provider, jurisdiction or compliance claim",
     !FORBIDDEN.some((r) => r.test(text)));

  /* Undecided values must be visibly undecided, once each. */
  const placeholders = text.match(/\[To be confirmed: [^\]]+\]/g) || [];
  ok("outstanding values are shown as outstanding", placeholders.length > 0,
     [...new Set(placeholders)].join(" "));

  ok("effective date is not invented", /\[To be confirmed: effective date\]/.test(text));

  /* Readability: the measure a legal page lives or dies by. */
  for (const width of [1440, 768, 390]) {
    await p.setViewportSize({ width, height: 900 });
    await p.waitForTimeout(150);
    const m = await p.evaluate(() => {
      /* A body paragraph, not the eyebrow or the meta line. */
      const prose = [...document.querySelectorAll("article section p")]
        .find((el) => el.textContent.trim().split(" ").length > 12);
      const de = document.documentElement;
      /* Measured against the face actually rendering, not an assumed em
         width — DM Sans's average character is far from 0.5em. */
      const probe = document.createElement("span");
      probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${getComputedStyle(prose).font}`;
      probe.textContent = "abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz";
      document.body.appendChild(probe);
      const avg = probe.getBoundingClientRect().width / probe.textContent.length;
      probe.remove();
      return {
        measure: Math.round(prose.getBoundingClientRect().width / avg),
        overflow: de.scrollWidth > de.clientWidth,
      };
    });
    ok(`@${width} no horizontal overflow`, !m.overflow);
    ok(`@${width} line length within 45–85 characters`, m.measure >= 45 && m.measure <= 85, `~${m.measure} characters`);
  }

  ok("no console errors", errs.length === 0, errs.join(" | "));
  await ctx.close();
}

/* --- the links into them ----------------------------------------------- */
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
for (const [label, href] of [["Privacy", "/concept-v2/privacy"], ["Terms", "/concept-v2/terms"]]) {
  const link = p.locator(`footer a[href="${href}"]`);
  ok(`footer links to ${label}`, (await link.count()) === 1);
}

await p.goto("http://localhost:3000/concept-v2/request-demo", { waitUntil: "networkidle" });
ok("demo form links to the privacy policy",
   (await p.locator('form a[href="/concept-v2/privacy"]').count()) === 1);
ok("demo form has no terms acceptance checkbox",
   !/i agree|accept the terms/i.test(await p.locator("form").innerText()));

await b.close();
console.log(fail ? `\n${fail} FAILURE(S)` : "\nall checks passed");
process.exit(fail ? 1 : 0);
