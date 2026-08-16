/**
 * Hero deliverables: the orbit at several rotational positions, plus a
 * close-up of one card caught at its nearest point.
 *
 * The orbit's frame loop bails out while `document.hidden` is true, so
 * overriding that property freezes the composition in place without touching
 * any application code.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("screenshots", { recursive: true });
const WIDTH = Number(process.argv[2] ?? 1440);

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: 940 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const hero = page.locator("section[aria-labelledby='hero-title']");
const visual = page.locator("section[aria-labelledby='hero-title'] [role='group']");

/* One revolution is 29s; five captures a little over a fifth of a turn apart
   walk the whole ring without landing twice on the same arrangement. */
for (let i = 0; i < 5; i++) {
  await hero.screenshot({ path: `screenshots/hero-orbit-${i + 1}.png` });
  console.log(`ok hero-orbit-${i + 1}`);
  if (i < 4) await page.waitForTimeout(6200);
}

/* Close-up: wait for the Ataccama card to swing to its nearest point, freeze,
   then capture it with a little breathing room. */
const ORBIT_ATACCAMA =
  "section[aria-labelledby='hero-title'] [role='group'] img[src*='ataccama']";

await page.evaluate(async (selector) => {
  const card = document.querySelector(selector).closest("[style*='width']");
  const widthNow = () => card.getBoundingClientRect().width;

  let previous = widthNow();
  let rising = false;
  const deadline = Date.now() + 40_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 80));
    const now = widthNow();
    if (now > previous) rising = true;
    // Peak: it swung toward the viewer and has started to recede again.
    else if (rising && now < previous) break;
    previous = now;
  }
  Object.defineProperty(document, "hidden", { value: true, configurable: true });
}, ORBIT_ATACCAMA);
await page.waitForTimeout(400);

const box = await page.locator(ORBIT_ATACCAMA).boundingBox();
const pad = 46;
await page.screenshot({
  path: "screenshots/hero-ataccama-closeup.png",
  clip: {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  },
});
console.log("ok hero-ataccama-closeup");

await browser.close();
