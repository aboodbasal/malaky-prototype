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
await page.locator("#why-malaky").scrollIntoViewIfNeeded();
await page.getByRole("button", { name: "Approve", exact: true }).click();
await page.waitForTimeout(2400);
console.log("approval reached scheduled:", await page.locator('li[data-state="current"]').last().innerText());
console.log("preference remembered visible:", await page.getByText("Preference remembered", { exact: true }).isVisible());
await page.screenshot({ path: "screenshots/approval-after.png" });

// 3. Memory replay.
await page.getByRole("button", { name: "Replay the sequence" }).click();
await page.waitForTimeout(2400);
console.log("future draft shown:", await page.getByText("From the 14th, same-day").isVisible());

// 4. Brand demo simulation.
await page.locator("#brand-demo").scrollIntoViewIfNeeded();
await page.getByRole("button", { name: /Falak Logistics/ }).click();
await page.waitForTimeout(3600);
console.log("ingest complete:", await page.getByText("Falak Logistics is set up").isVisible());
await page.screenshot({ path: "screenshots/branddemo-after.png" });

// 5. Pricing annual toggle.
await page.goto("http://localhost:3000/concept-v2/pricing", { waitUntil: "networkidle" });
console.log("monthly price:", await page.locator("article").filter({ hasText: "Malaky Business" }).locator("p").nth(2).innerText());
await page.getByRole("button", { name: /Pay annually/ }).click();
await page.waitForTimeout(300);
console.log("annual price:", await page.locator("article").filter({ hasText: "Malaky Business" }).locator("p").nth(2).innerText());

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
