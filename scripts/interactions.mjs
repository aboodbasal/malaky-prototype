import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(String(e.message)));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });

// 1. Orbit: hover a card, confirm the orbit slows and the card comes forward.
const sample = async () => page.evaluate(() => {
  const el = document.querySelector('[aria-label^="Marketing Malaky"] > div');
  return el.style.transform;
});
const a = await sample(); await page.waitForTimeout(700); const b = await sample();
console.log("orbit moving:", a !== b);
// The cards are always in motion, so Playwright's stability check never
// settles — move the mouse to wherever the card is right now instead.
const box = await page.locator('[aria-label^="Marketing Malaky"] > div').first().boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.waitForTimeout(1100);
const c = await sample(); await page.waitForTimeout(700); const d = await sample();
const delta = (s) => Number(s.match(/translate3d\(([-\d.]+)px/)?.[1] ?? 0);
console.log("hover slowed:", Math.abs(delta(d) - delta(c)) < Math.abs(delta(b) - delta(a)));
console.log("hovered card forward:", await page.evaluate(() => {
  const inner = document.querySelector('[aria-label^="Marketing Malaky"] > div > div');
  return getComputedStyle(inner).transform !== "none";
}));

// 2. Approval flow.
await page.locator("#control").scrollIntoViewIfNeeded();
await page.getByRole("button", { name: "Approve", exact: true }).click();
await page.waitForTimeout(2400);
console.log("approval reached scheduled:", await page.locator('li[data-state="current"]').last().innerText());
console.log("preference remembered visible:", await page.getByText("Preference remembered", { exact: true }).isVisible());
await page.screenshot({ path: "screenshots/approval-after.png" });

// 3. Memory replay.
await page.getByRole("button", { name: "Replay the sequence" }).click();
await page.waitForTimeout(2400);
console.log("future draft shown:", await page.getByText("From the 14th, same-day").isVisible());

// 4. Brand demo — covered in depth by scripts/pass2-qa.mjs. Here we only
// confirm the section still mounts in its initial state.
await page.locator("#brand-demo").scrollIntoViewIfNeeded();
console.log("brand demo input present:", await page.locator("#company-url").isVisible());

// 5. Pricing: Middle East launch pricing, with no billing toggle.
await page.goto("http://localhost:3000/concept-v2/pricing", { waitUntil: "networkidle" });
const business = page.locator("article").filter({ hasText: "Malaky Business" });
console.log("business price:", await business.locator("p").nth(1).innerText());
console.log("setup included, not priced:",
  (await business.getByText("Included during launch").count()) === 1);
console.log("no term on the public card:", (await business.getByText("Term").count()) === 0);
console.log("no billing toggle:", (await page.getByRole("button", { name: /Pay annually|Billed monthly/ }).count()) === 0);

// Pass 6: the platform is stated once, above the cards, and the cards carry
// coverage instead of a feature checklist.
const pricingText = (await page.locator("main").innerText()).replace(/\s+/g, " ");
console.log("platform stated once:",
  (pricingText.match(/Persistent brand memory/g) || []).length === 1);
console.log("annual note stated once:", (pricingText.match(/Save 10%/g) || []).length === 1);
console.log("annual note outside the cards:",
  (await business.getByText("Save 10%").count()) === 0);
console.log("card leads with coverage:", await business.locator("dl dt").first().innerText());
console.log("capacity behind a disclosure:",
  (await page.locator("details summary").innerText()).includes("Operating capacity"));

// Middle East launch: retired figures must not reappear anywhere public.
const retired = ["$3,500", "$6,000", "$120,000", "$7,500", "$12,500", "$25,000", "12-month engagement"];
console.log("retired pricing absent:", JSON.stringify(retired.filter((r) => pricingText.includes(r))));
console.log("launch prices present:",
  ["$599", "$899", "Custom", "$299"].every((p) => pricingText.includes(p)));
console.log("combined totals shown:",
  pricingText.includes("$898") && pricingText.includes("$1,198"));
console.log("managed is qualified:",
  /assisted operating service, not a dedicated full-time/.test(pricingText));
console.log("executive voice limits:",
  JSON.stringify(await Promise.all(["business", "scale", "enterprise"].map((id) =>
    page.locator(`article:has(#${id}-name) div:has(> dt:text-is("Executive voices")) dd`).innerText()))));
console.log("superseded voice limits absent:",
  !/Up to 5|Extended (voice )?library/.test(pricingText));
console.log("managed makes no staffing claim:",
  !/(dedicated account manager|24\/7|unlimited)/i.test(pricingText));
console.log("no most-popular badge:", !/most popular/i.test(pricingText));
console.log("short-form video renamed:", (await page.getByText("AI video", { exact: false }).count()) === 0);
console.log("one CTA label on pricing:", (await page.getByRole("link", { name: "Talk to Enterprise" }).count()) === 0);

// 5b. CTA vocabulary is standardised across both pages.
const ctaAudit = async (url) => {
  await page.goto(`http://localhost:3000${url}`, { waitUntil: "networkidle" });
  const banned = ["Request access", "Request a demo", "Build Malaky for my company"];
  const text = await page.locator("body").innerText();
  return banned.filter((b) => text.includes(b));
};
console.log("stale CTAs on home:", JSON.stringify(await ctaAudit("/concept-v2")));
console.log("stale CTAs on pricing:", JSON.stringify(await ctaAudit("/concept-v2/pricing")));

// 5c. Control guarantees, merged into approval, with honest labelling.
await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
await page.locator("#control").scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
console.log("control headline:", await page.getByText("You stay in control").first().isVisible());
// Scoped to the guarantees list — #control also holds the approval track's <li>s.
const pillars = page.locator('#control ul[aria-label="What stays under your control"] li');
console.log("planned labels:", await pillars.filter({ hasText: "Planned" }).count());
console.log("demonstrated labels:", await pillars.filter({ hasText: "Demonstrated" }).count());
await page.screenshot({ path: "screenshots/trust-section.png" });

// 5d. Approved lines must survive every pass.
// Normalise typographic apostrophes so the assertions match the rendered copy.
const bodyText = (await page.locator("body").innerText()).replace(/\u2019/g, "'");
for (const line of [
  "You shouldn't have to correct the same thing twice",
  "Arabic isn't a language toggle",
  "Different language. Different rhythm. Same brand.",
  "Your marketing",
]) {
  console.log(`preserved "${line.slice(0, 34)}...":`, bodyText.includes(line));
}
console.log("no fake follower counts:", !/[0-9]{2,3},[0-9]{3} followers/.test(bodyText));
console.log("no Made in Saudi Arabia:", !bodyText.includes("Made in Saudi Arabia"));

// 6. Reduced motion.
const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const rp = await rm.newPage();
rp.on("pageerror", (e) => errs.push("rm: " + e.message));
await rp.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
const r1 = await rp.evaluate(() => document.querySelector('[aria-label^="Marketing Malaky"] > div').style.transform);
await rp.waitForTimeout(1200);
const r2 = await rp.evaluate(() => document.querySelector('[aria-label^="Marketing Malaky"] > div').style.transform);
console.log("reduced-motion orbit static:", r1 === r2 && r1 !== "");
await rp.screenshot({ path: "screenshots/reduced-motion.png" });

console.log(errs.length ? "ERRORS: " + errs.join(" | ") : "no page errors");
await browser.close();
