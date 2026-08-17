/**
 * Guards the purchase and onboarding journey.
 *
 * Two things matter most here, and neither is layout. First, the arithmetic:
 * every figure a customer can see must reconcile with the pricing page and
 * with itself. Second, the honesty: no screen may claim that money moved, an
 * account exists, a file was stored, a channel was connected or a meeting was
 * booked — and no infrastructure vendor may be named anywhere, because none
 * has been chosen.
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { MANAGED, PLANS } from "../lib/concept-v2/pricing.ts";
import { ANNUAL_DISCOUNT, priceOrder } from "../lib/concept-v2/commerce.ts";
import {
  CALENDAR_LINE_ONE,
  CALENDAR_LINE_TWO,
  CHANNEL_NOTE,
  STEPS,
} from "../lib/concept-v2/onboarding-steps.ts";

const BASE = "http://localhost:3000/concept-v2";
const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
let fail = 0;
const ok = (n, p, d = "") => {
  console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`);
  if (!p) fail++;
};

const ctx = await b.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: "reduce" });
const errs = [];
const page = await ctx.newPage();
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errs.push(m.text());
});

const go = async (path) => {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
};
const text = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");

/* ------------------------------------------------------------------ *
 * The arithmetic, before anything is rendered
 * ------------------------------------------------------------------ */

const business = PLANS.find((p) => p.id === "business");
const scale = PLANS.find((p) => p.id === "scale");

ok("prices come from the pricing page, not from the flow",
   business.monthly === 599 && scale.monthly === 899 && MANAGED.monthly === 299,
   `${business.monthly} / ${scale.monthly} / +${MANAGED.monthly}`);

for (const term of ["monthly", "annual"]) {
  for (const managed of [false, true]) {
    for (const planId of ["business", "scale"]) {
      const o = priceOrder({ planId, term, managed });
      const months = term === "annual" ? 12 : 1;
      const monthly = (planId === "business" ? 599 : 899) + (managed ? 299 : 0);
      ok(`${planId}/${term}${managed ? "/managed" : ""}: subtotal is months × monthly`,
         o.subtotal === monthly * months, String(o.subtotal));
      ok(`${planId}/${term}${managed ? "/managed" : ""}: subtotal − saving = total`,
         o.subtotal - o.discount === o.total, `${o.subtotal} − ${o.discount} = ${o.total}`);
      ok(`${planId}/${term}${managed ? "/managed" : ""}: the saving is whole dollars`,
         Number.isInteger(o.discount));
      ok(`${planId}/${term}${managed ? "/managed" : ""}: monthly carries no discount`,
         term === "annual" || o.discount === 0);
    }
  }
}
ok("the annual discount is the published 10%", ANNUAL_DISCOUNT === 0.1);

/* Setup is words, never a figure — "included" and "$0" are different claims. */
for (const plan of PLANS) {
  ok(`${plan.name}: setup is included rather than zero`, plan.setup.fee === null,
     String(plan.setup.fee));
}

/* ------------------------------------------------------------------ *
 * Entry points
 * ------------------------------------------------------------------ */

await go("");
const heroPrimary = page.locator("h1#hero-title").locator("xpath=../div//a").first();
ok("the hero keeps its orange primary",
   (await heroPrimary.innerText()).includes("See Malaky with your brand"),
   await heroPrimary.innerText());

const heroSecondary = page.locator("h1#hero-title").locator("xpath=../div//a").nth(1);
ok("the hero's gold button now says Get started",
   (await heroSecondary.innerText()).trim() === "Get started");
ok("and it opens the self-serve route",
   (await heroSecondary.getAttribute("href")) === "/concept-v2/get-started");

const heroGold = await heroSecondary.evaluate((el) => getComputedStyle(el).color);
ok("the gold secondary is still gold", heroGold === "rgb(227, 192, 132)", heroGold);

const headerButtons = await page
  .locator("header [class*=actions] a[class*=btn]")
  .allInnerTexts();
ok("the header carries one filled action", headerButtons.length === 1, headerButtons.join(" | "));
ok("and it is Get started", headerButtons[0]?.trim() === "Get started");
ok("the demo route stays in the header as a link, not a second button",
   (await page.locator("header [class*=demoLink]").count()) === 1);

await go("/pricing");
const pricingCtas = await page.locator("article a[class*=btn]").evaluateAll((els) =>
  els.map((e) => [e.innerText.trim(), e.getAttribute("href")]),
);
ok("Business goes to the self-serve flow",
   pricingCtas[0][0] === "Get started" && pricingCtas[0][1].includes("plan=business"),
   pricingCtas[0].join(" → "));
ok("Scale goes to the self-serve flow",
   pricingCtas[1][0] === "Get started" && pricingCtas[1][1].includes("plan=scale"),
   pricingCtas[1].join(" → "));
ok("Enterprise still asks for a conversation",
   pricingCtas[2][0] === "Request a private demo" &&
     pricingCtas[2][1] === "/concept-v2/request-demo",
   pricingCtas[2].join(" → "));

/* ------------------------------------------------------------------ *
 * Get started
 * ------------------------------------------------------------------ */

await go("/get-started");
let body = await text();
ok("the flow says what it is", /Concept preview/i.test(body));
ok("Business is the default", /\$599/.test(body));

const total = () => page.locator("[class*=totalAmount]").innerText();
ok("the summary opens at the Business monthly price",
   (await total()).replace(/\s+/g, " ").startsWith("$599"), await total());

await page.locator("label:text-is('Malaky Scale')").click();
await page.waitForTimeout(150);
ok("choosing Scale changes the total", (await total()).includes("$899"), await total());

await page.locator("label:text-is('Malaky Managed')").click();
await page.waitForTimeout(150);
ok("adding Managed reaches the published combination",
   (await total()).includes("$1,198"), await total());

await page.locator("label:has-text('Annual') >> nth=0").click();
await page.waitForTimeout(150);
const annual = priceOrder({ planId: "scale", term: "annual", managed: true });
body = await text();
ok("annual shows a subtotal", body.includes(`$${annual.subtotal.toLocaleString("en-US")}`));
ok("annual shows the saving", body.includes(`$${annual.discount.toLocaleString("en-US")}`));
ok("annual's total is subtotal minus saving",
   (await total()).includes(`$${annual.total.toLocaleString("en-US")}`), await total());

const continueHref = await page.locator("aside a[class*=btn]").getAttribute("href");
ok("the selection travels to checkout in the link",
   continueHref === "/concept-v2/checkout?plan=scale&term=annual&managed=1", continueHref);

ok("setup is shown as included, not as $0",
   /Included during launch/.test(body) && !/\$0\b/.test(body));
ok("Managed states what it is not", body.includes(MANAGED.clarification.slice(0, 40)));
ok("Enterprise is offered as a conversation, not a card",
   (await page.locator("a[href='/concept-v2/request-demo']").count()) >= 1);

/* ------------------------------------------------------------------ *
 * Checkout
 * ------------------------------------------------------------------ */

await go("/checkout?plan=scale&term=annual&managed=1");
body = await text();
ok("checkout carries the selection through",
   body.includes("Malaky Scale") && body.includes(MANAGED.name));
ok("checkout's total matches what was chosen",
   (await total()).includes(`$${annual.total.toLocaleString("en-US")}`), await total());

ok("the payment area accepts nothing",
   (await page.locator("[class*=surface] input, [class*=surface] textarea").count()) === 0);
ok("and says so on the page", /accepts no card details/i.test(body));
ok("the CTA is the one that was briefed",
   /Start my Malaky deployment/.test(body));

const surfaceSource = readFileSync("components/concept-v2/purchase/PaymentSurface.tsx", "utf8");
ok("the payment module carries its engineering note",
   surfaceSource.includes(
     "This payment surface is visual only. Engineering will replace/connect this",
   ));

/* Validation, then the declined path, then the successful one. */
await page.locator("button[type=submit]").click();
await page.waitForTimeout(200);
ok("an empty checkout does not proceed", page.url().includes("/checkout"));
ok("and it says what is missing",
   (await page.locator("[class*=fieldError]").count()) >= 1);

const fill = async (email) => {
  await page.fill("input[autocomplete=name]", "Sam Visitor");
  await page.fill("input[type=email]", email);
  await page.fill("input[autocomplete=organization]", "Northline Group");
  await page.selectOption("select", "Saudi Arabia");
};

await fill("sam@fail.test");
await page.locator("button[type=submit]").click();
await page.waitForTimeout(1600);
const declined = await page.locator("p[role=alert]").innerText();
ok("a declined payment keeps the customer on checkout", page.url().includes("/checkout"));
ok("and says nothing was charged", /nothing has been charged/i.test(declined), declined);
ok("the typed details survive a decline",
   (await page.inputValue("input[autocomplete=organization]")) === "Northline Group");

await fill("sam@northline.sa");
await page.locator("button[type=submit]").click();
await page.waitForTimeout(2200);
ok("a successful checkout moves to Intelligence Setup",
   page.url().includes("/onboarding"), page.url());
ok("and carries the plan with it", page.url().includes("plan=scale"), page.url());

/* ------------------------------------------------------------------ *
 * Onboarding
 * ------------------------------------------------------------------ */

body = await text();
ok("all eight steps are visible from step one",
   (await page.locator("nav[aria-label='Setup steps'] li").count()) === 8);
ok("the rail names the steps the brief listed",
   STEPS.every((s) => body.includes(s.title)),
   STEPS.map((s) => s.title).join(", "));
ok("the company from checkout is not asked for twice",
   (await page.inputValue("input[id$='-company']")) === "Northline Group",
   await page.inputValue("input[id$='-company']"));

const stepThrough = async (targetId) => {
  for (let i = 0; i < 8; i++) {
    const heading = await page.locator("h2[id=setup-title]").innerText();
    if (heading === targetId) return heading;
    await page.locator("button[class*=btn]:has-text('Continue')").last().click();
    await page.waitForTimeout(250);
  }
  return null;
};

/* 01 needs a company before it will move. */
await page.fill("input[id$='-company']", "");
await page.locator("button[class*=btn]:has-text('Continue')").last().click();
await page.waitForTimeout(200);
ok("step 01 will not continue without a company",
   /which company/i.test(await page.locator("p[role=alert]").innerText()));
await page.fill("input[id$='-company']", "Northline Group");

await page.locator("button[class*=btn]:has-text('Continue')").last().click();
await page.waitForTimeout(250);
body = await text();
ok("step 02 offers a visual upload zone", /Choose files, or drop them here/i.test(body));
ok("and states that nothing is uploaded",
   /Nothing is uploaded, read or stored/i.test(body));

await page.locator("button[class*=btn]:has-text('Continue')").last().click();
await page.waitForTimeout(250);
body = await text();
ok("Scale's executive voice limit is the plan's",
   /up to 3 executive voices/i.test(body), body.match(/covers[^.]*\./)?.[0]);
ok("and another voice can be added under it",
   (await page.locator("button:has-text('Add another voice')").count()) === 1);

await page.locator("button[class*=btn]:has-text('Continue')").last().click();
await page.waitForTimeout(250);
await page.locator("button[class*=btn]:has-text('Continue')").last().click();
await page.waitForTimeout(250);
ok("step 04 will not continue without a primary market",
   /market Malaky should plan against/i.test(await page.locator("p[role=alert]").innerText()));
await page.selectOption("select[id$='-primary']", "SA");
ok("the six markets are offered",
   (await page.locator("select[id$='-primary'] option").count()) === 7);

await page.locator("button[class*=btn]:has-text('Continue')").last().click();
await page.waitForTimeout(250);
await page.locator("button[class*=btn]:has-text('Continue')").last().click();
await page.waitForTimeout(250);
body = await text();
ok("step 05 will not continue without a channel",
   /at least one channel/i.test(await page.locator("p[role=alert]").innerText()));
ok("choosing a channel is stated as planning, not connection",
   body.includes(CHANNEL_NOTE), CHANNEL_NOTE);
await page.locator("label[class*=channel]").first().click();

await page.locator("button[class*=btn]:has-text('Continue')").last().click();
await page.waitForTimeout(250);
body = await text();
ok("the calendar step carries its first line", body.includes(CALENDAR_LINE_ONE));
ok("and its second", body.includes(CALENDAR_LINE_TWO));

await page.locator("button[class*=btn]:has-text('Continue')").last().click();
await page.waitForTimeout(250);
body = await text();
ok("approvals are configured, not exercised",
   /Nothing is approved or published from this screen/i.test(body));

await page.locator("button[class*=btn]:has-text('Continue')").last().click();
await page.waitForTimeout(1200);
ok("finishing setup reaches the walkthrough",
   page.url().includes("/onboarding/schedule"), page.url());

/* ------------------------------------------------------------------ *
 * Walkthrough
 * ------------------------------------------------------------------ */

body = await text();
ok("no time of day is presented as available",
   !/\b([01]?\d|2[0-3]):[0-5]\d\s*(am|pm)?\b/i.test(
     body.replace(/before 12:00|12:00 – 15:00|15:00 – 18:00|after 18:00/gi, ""),
   ));
ok("nothing is described as booked",
   /No time is held and no invitation is sent/i.test(body));
await page.locator("button[type=submit]").click();
await page.waitForTimeout(200);
ok("it will not send without one",
   /at least one time of day/i.test(await page.locator("p[role=alert]").innerText()));

await page.locator("label:has-text('Morning')").first().click();
await page.locator("button[type=submit]").click();
await page.waitForTimeout(1400);
ok("requesting a walkthrough completes the journey",
   page.url().includes("/onboarding/complete"), page.url());

/* ------------------------------------------------------------------ *
 * Complete
 * ------------------------------------------------------------------ */

body = await text();
ok("the completion screen uses the briefed line",
   /Your Malaky setup is underway/.test(body));
ok("it names the company it was given", /Northline Group/.test(body));
ok("it summarises the deployment", /Malaky Scale/.test(body) && /Annual, prepaid/.test(body));
ok("it states the five things that did not happen",
   /No payment was taken, no account was created, no files were stored, no channel was connected and no meeting was booked/i.test(
     body,
   ));
ok("the only action is back to the site",
   (await page.locator("a[class*=btn]").allInnerTexts()).some((t) =>
     /Back to Malaky/.test(t),
   ));
ok("no receipt or transaction number is shown",
   !/receipt|transaction (id|number)|invoice number/i.test(body));

/* ------------------------------------------------------------------ *
 * The vocabulary that may never appear
 * ------------------------------------------------------------------ */

const FORBIDDEN = [
  /\bstripe\b/i, /checkout\.com/i, /\badyen\b/i, /\bpaypal\b/i, /\bsquare\b/i,
  /\bcalendly\b/i, /\bcal\.com\b/i, /google calendar/i, /\boutlook\b/i, /\bzoom\b/i,
  /\bhubspot\b/i, /\bsalesforce\b/i, /\bmailchimp\b/i, /\bsendgrid\b/i,
  /\baws\b/i, /\bazure\b/i, /google cloud/i, /\bopenai\b/i, /\banthropic\b/i,
  /\bsupabase\b/i, /\bfirebase\b/i, /\bauth0\b/i, /\bclerk\b/i,
  /payment (was )?(successful|received|complete)/i,
  /you (have been|were) charged/i,
  /your account (has been )?(created|is ready)/i,
  /(meeting|call|walkthrough) (has been |is )?(booked|confirmed for)/i,
  /successfully connected/i,
  /(bank-level|military-grade|256-bit) (security|encryption)/i,
  /\bPCI[- ]DSS\b/i,
  /\bSOC ?2\b/i,
];

for (const path of [
  "/get-started",
  "/checkout?plan=business&term=monthly&managed=0",
  "/onboarding",
  "/onboarding/schedule",
  "/onboarding/complete",
]) {
  await go(path);
  const t = await text();
  const hits = FORBIDDEN.filter((re) => re.test(t)).map((re) => re.source);
  ok(`${path}: names no provider and claims no outcome`, hits.length === 0, hits.join(", "));
}

/* ------------------------------------------------------------------ *
 * Responsive
 * ------------------------------------------------------------------ */

for (const width of [1440, 1024, 768, 390]) {
  await page.setViewportSize({ width, height: 900 });
  for (const path of [
    "/get-started",
    "/checkout?plan=scale&term=annual&managed=1",
    "/onboarding",
    "/onboarding/schedule",
    "/onboarding/complete",
  ]) {
    await go(path);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    ok(`${width}px ${path}: nothing spills sideways`, over <= 0, `${over}px`);
  }
}

ok("no console or hydration errors anywhere in the journey", errs.length === 0,
   errs.slice(0, 3).join(" | "));

await b.close();
console.log(fail ? `\n${fail} FAILURE(S)` : "\nall checks passed");
process.exit(fail ? 1 : 0);
