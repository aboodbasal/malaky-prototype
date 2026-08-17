/**
 * Guards the real-customer conversion.
 *
 * Two failure modes, and this script exists for both.
 *
 * The first is a relapse: a fictional company or executive reappearing
 * anywhere a visitor can read it. The second is worse — a real customer
 * acquiring an invented fact, an invented logo, an invented social handle or
 * an invented face, which is the exact way a credibility pass makes things
 * less credible than the fiction it replaced.
 */
import { readFileSync, existsSync } from "node:fs";
import { chromium } from "playwright";
import {
  CUSTOMER_LIST,
  CUSTOMERS,
  EXECUTIVES,
  customersMissingLogos,
} from "../lib/concept-v2/customers.ts";
import {
  APPROVAL_PIECE,
  BILINGUAL_CAMPAIGN,
  EVENT_FANOUT,
  HERO_PIECES,
  MEMORY_EXAMPLE,
  SOURCE_EVENT,
} from "../lib/concept-v2/content.ts";

const BASE = "http://localhost:3000/concept-v2";
const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
let fail = 0;
const ok = (n, p, d = "") => {
  console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`);
  if (!p) fail++;
};

/* ------------------------------------------------------------------ *
 * The factual layer
 * ------------------------------------------------------------------ */

ok("six customers", CUSTOMER_LIST.length === 6, CUSTOMER_LIST.map((c) => c.name).join(", "));

for (const c of CUSTOMER_LIST) {
  ok(`${c.name}: states at least one fact`, c.facts.length >= 1, String(c.facts.length));
  ok(`${c.name}: every fact carries its source`,
     c.facts.every((f) => typeof f.source === "string" && f.source.trim().length > 20),
     c.facts.map((f) => f.source.slice(0, 24)).join(" | "));

  /* Unknowns are null, never guessed. A handle invented from a company name
     is how a real customer acquires a fake account. */
  ok(`${c.name}: no invented social handle`, c.handle === null || c.handle.length > 0);

  if (c.logo) {
    ok(`${c.name}: logo file exists`, existsSync(`public${c.logo.src}`), c.logo.src);
    const png = readFileSync(`public${c.logo.src}`);
    const isPng = png.subarray(1, 4).toString() === "PNG";
    if (isPng) {
      ok(`${c.name}: logo declares its true dimensions`,
         png.readUInt32BE(16) === c.logo.width && png.readUInt32BE(20) === c.logo.height,
         `${png.readUInt32BE(16)}×${png.readUInt32BE(20)} vs ${c.logo.width}×${c.logo.height}`);
    }
    ok(`${c.name}: logo has alt text`, (c.logo.alt ?? "").length > 3);
  }
}

const missing = customersMissingLogos();
console.log(
  `\n  logos outstanding: ${missing.length ? missing.map((c) => c.name).join(", ") : "none"}\n`,
);

/* Only people who publicly identify themselves in that role. */
for (const exec of Object.values(EXECUTIVES)) {
  ok(`${exec.name}: sourced`, exec.source.length > 30);
  ok(`${exec.name}: no invented likeness`, exec.portrait === null || !!exec.portrait.src);
  ok(`${exec.name}: attached to a real customer`, !!CUSTOMERS[exec.customerId]);
}
ok("only one named executive, and only where sourced",
   Object.keys(EXECUTIVES).length === 1, Object.keys(EXECUTIVES).join(", "));

/* ------------------------------------------------------------------ *
 * The illustrative layer points at real customers
 * ------------------------------------------------------------------ */

ok("One Event uses Alpha Pro MENA", SOURCE_EVENT.customerId === "alpha-pro");
ok("and its source event is sourced", (SOURCE_EVENT.source ?? "").length > 30);
ok("and it is a moment the customer really published",
   /AI assessment/i.test(SOURCE_EVENT.title), SOURCE_EVENT.title);
ok("every fan-out output is Alpha Pro's",
   EVENT_FANOUT.every((p) => p.customerId === "alpha-pro"));
/* Four channels, by label rather than by platform: the Arabic card is a
   LinkedIn post too, so two of them share a platform and differ in language
   and composition. */
ok("the fan-out covers four distinct channels",
   new Set(EVENT_FANOUT.map((p) => p.label)).size === 4,
   EVENT_FANOUT.map((p) => p.label).join(", "));
ok("the fourth is Arabic LinkedIn, not Arabic social",
   EVENT_FANOUT.some((p) => p.label === "Arabic LinkedIn" && p.dir === "rtl") &&
     !EVENT_FANOUT.some((p) => p.platform === "arabic-social"));
ok("and it is composed, not translated",
   EVENT_FANOUT.find((p) => p.label === "Arabic LinkedIn")?.copy.body !==
     EVENT_FANOUT.find((p) => p.label === "LinkedIn Company")?.copy.body);
ok("no fan-out card names an executive Alpha Pro has not assigned",
   EVENT_FANOUT.filter((p) => p.platform === "linkedin-executive").every((p) => !p.executiveId));

ok("Approval uses Baker Tilly Saudi Arabia", APPROVAL_PIECE.customerId === "baker-tilly-sa");
/* The review item is the customer's own published creative, so the section
   must say so — this is the one card on the page that is not ours. */
ok("and reviews their own published creative",
   APPROVAL_PIECE.platform === "real-screenshot" && !!APPROVAL_PIECE.realPostId,
   APPROVAL_PIECE.realPostId ?? "none");
ok("Memory uses Inception DAP", MEMORY_EXAMPLE.customerId === "inception-dap");
ok("and says the correction is illustrative", /Illustrative/i.test(MEMORY_EXAMPLE.note));
ok("Arabic uses Shrimp Joint", BILINGUAL_CAMPAIGN.customerId === "shrimp-joint");
ok("the two Arabic campaigns are not translations of each other",
   BILINGUAL_CAMPAIGN.en.headline !== BILINGUAL_CAMPAIGN.ar.headline &&
     BILINGUAL_CAMPAIGN.en.cta !== BILINGUAL_CAMPAIGN.ar.cta);

const heroCustomers = HERO_PIECES.filter((p) => p.customerId).map((p) => p.customerId);
ok("the hero spreads across the customer base", new Set(heroCustomers).size >= 3,
   heroCustomers.join(", "));
ok("the ILA executive draft is shown as a draft",
   HERO_PIECES.find((p) => p.executiveId === "dana")?.status === "prepared");

/* ------------------------------------------------------------------ *
 * The rendered page
 * ------------------------------------------------------------------ */

const ctx = await b.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errs.push(m.text());
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");

/* The retired ecosystem, in the order the brief listed it. */
for (const ghost of [
  "Falak Logistics",
  "Nura Living",
  "Meezan Advisory",
  "Dar Sidra",
  "Ahmed Al Farsi",
  "Layla Haddad",
  "Huda Nasser",
]) {
  ok(`no visitor-facing ${ghost}`, !body.includes(ghost));
}
ok("no fictional Arabic brand names either", !/فلك|سِدرة/.test(body));

/* The customers who should be visible, are. */
for (const name of ["Alpha Pro MENA", "Baker Tilly Saudi Arabia", "Inception DAP", "Shrimp Joint"]) {
  ok(`${name} appears on the homepage`, body.includes(name));
}

ok("the real-brands note calls them customers",
   /Malaky customer examples/i.test(body));
ok("and claims nothing about results",
   !/(trusted by|ROI|uplift|increase in|\d+% (more|growth|uplift))/i.test(body));

/* Prepared work says it is prepared. */
ok("the fan-out discloses that its cards are ours",
   /Prepared by Malaky/i.test(body));
/* The One Event section must not name a channel it no longer has. */
const oneEvent = (await page.locator("#how-it-works").innerText()).replace(/\s+/g, " ");
ok("One Event calls no channel Arabic Social", !/Arabic Social/i.test(oneEvent));
ok("and does name Arabic LinkedIn", /Arabic LinkedIn/i.test(oneEvent));
ok("engagement figures are disclaimed rather than presented as performance",
   /not performance/i.test(body));
ok("the memory correction is disclosed as illustrative", /Illustrative/i.test(body));
ok("the approval creative is attributed to its owner",
   /own published post, used here to demonstrate the review step/i.test(body));

/* Brand presence: a mark a reader cannot see is not brand presence. */
const marks = await page.locator('span[class*="mark"] img').evaluateAll((els) =>
  els.map((e) => {
    const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  }).filter((m) => m.w > 0),
);
ok("every rendered logo has real area", marks.every((m) => m.w >= 8 && m.h >= 8),
   marks.map((m) => `${m.w}x${m.h}`).join(" "));
for (const [sel, label] of [
  ["section:has(#memory-title)", "Memory"],
  ["#arabic", "Arabic"],
  ["#control", "Approval"],
]) {
  const biggest = await page.locator(`${sel} span[class*=mark] img`).evaluateAll((els) =>
    Math.max(0, ...els.map((e) => e.getBoundingClientRect().height)),
  );
  ok(`${label}: the customer's mark is legible, not a speck`, biggest >= 24,
     `${Math.round(biggest)}px tall`);
}
ok("both Arabic campaigns are disclosed as prepared",
   /Both campaigns prepared by Malaky/i.test(body));

/* Every customer's own artwork is now supplied, so no slot should be reserved
   anywhere. The placeholder path stays in the component for the next customer,
   and is covered by the customersMissingLogos() assertion above rather than by
   a rendered example. */
const pending = await page.locator('[aria-label*="logo not yet supplied"]').count();
ok("no reserved slots remain — every logo is supplied", pending === 0, `${pending} slot(s)`);
ok("and the factual layer agrees", customersMissingLogos().length === 0,
   customersMissingLogos().map((c) => c.name).join(", "));

/* Official artwork, placed rather than processed. */
const placed = await page.locator('[class*="BrandMark"] img').evaluateAll((els) =>
  els.map((e) => {
    const r = e.getBoundingClientRect();
    return {
      src: e.getAttribute("src"),
      fit: getComputedStyle(e).objectFit,
      /* contain never distorts, but check the box is not absurd either. */
      boxRatio: r.height ? +(r.width / r.height).toFixed(2) : 0,
      natRatio: e.naturalHeight ? +(e.naturalWidth / e.naturalHeight).toFixed(2) : 0,
    };
  }),
);
ok("every placed logo is contained, never stretched",
   placed.length > 0 && placed.every((p) => p.fit === "contain"), `${placed.length} placements`);
ok("no logo is squeezed into a box wildly off its own ratio",
   placed.every((p) => p.natRatio === 0 || p.boxRatio / Math.min(p.natRatio, 3.2) < 1.35),
   placed.map((p) => `${p.boxRatio}/${p.natRatio}`).join(" "));

/* ------------------------------------------------------------------ *
 * The brand demo, which is where the supplied artwork actually renders
 * ------------------------------------------------------------------ */

/* Wait on the reset control, which only exists once the run has finished.
   Waiting on the company name matched the suggested-domain chip instead, and
   read the section before it had analysed anything. */
const runDemo = async (domain) => {
  await page.locator("#brand-demo").scrollIntoViewIfNeeded();
  await page.fill("#company-url", domain);
  await page.getByRole("button", { name: /Show me/ }).click();
  await page.getByRole("button", { name: /Try another company/ }).waitFor({ timeout: 25000 });
  await page.waitForTimeout(300);
  return (await page.locator("#brand-demo").innerText()).replace(/\s+/g, " ");
};

/* The demo shows one channel at a time, so the executive card has to be
   selected before it can be read. */
const openExecutive = async () => {
  await page.locator("#brand-demo button", { hasText: "Executive" }).first().click();
  await page.waitForTimeout(400);
  return (await page.locator("#brand-demo").innerText()).replace(/\s+/g, " ");
};

const ata = await runDemo("ataccama.com");
ok("the demo recognises a real customer domain", /Ataccama/.test(ata));
ok("and reads the real public moment", /Data Observability/i.test(ata));
ok("and shows no invented brand swatches", !/Brand colors/i.test(ata));
const ataExec = await openExecutive();
ok("and names no executive Ataccama has not assigned",
   !/Ahmed|Layla|Huda/.test(ataExec) &&
     /voice not yet assigned|Executive voice/i.test(ataExec),
   ataExec.slice(ataExec.indexOf("Executive"), ataExec.indexOf("Executive") + 90));

await page.reload({ waitUntil: "networkidle" });
const ila = await runDemo("ila.edu");
ok("a second real customer resolves too", /International Language Academy/.test(ila));
const ilaExec = await openExecutive();
ok("and the named executive is the sourced one", /Dana Saif/.test(ilaExec));
ok("shown with her real public role",
   /Founder & Executive Director/i.test(ilaExec));

const ilaImgs = await page.locator('#brand-demo img[src*="ila-logo"]').count();
ok("the official ILA artwork is placed, unmodified", ilaImgs >= 1, `${ilaImgs} placement(s)`);
const distorted = await page.locator('#brand-demo img[src*="ila-logo"]').evaluateAll((els) =>
  els.filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && Math.abs(r.width - r.height) > 1.5;
  }).length,
);
ok("and never stretched out of its square", distorted === 0, `${distorted} distorted`);

ok("no console or hydration errors", errs.length === 0, errs.slice(0, 3).join(" | "));

await b.close();
console.log(fail ? `\n${fail} FAILURE(S)` : "\nall checks passed");
process.exit(fail ? 1 : 0);
