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

/* One revolution is 29s. N frames evenly spaced across it walks the whole
   ring, so the composition is judged over a cycle rather than at one moment. */
const REVOLUTION_MS = 29_000;
const FRAMES = Number(process.argv[3] ?? 8);
for (let i = 0; i < FRAMES; i++) {
  await hero.screenshot({ path: `screenshots/hero-orbit-${i + 1}.png` });
  console.log(`ok hero-orbit-${i + 1}`);
  if (i < FRAMES - 1) await page.waitForTimeout(Math.round(REVOLUTION_MS / FRAMES));
}

/* Close-ups: wait for a card to swing to its nearest point, freeze the loop,
   then capture it. This is what "recognizable at the front" has to survive. */
for (const [key, name] of [
  ["shrimp-joint", "shrimp"],
  ["inception", "inception"],
  ["ataccama", "ataccama"],
]) {
  const selector =
    `section[aria-labelledby='hero-title'] [role='group'] img[src*='${key}']`;

  const page2 = await ctx.newPage();
  await page2.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await page2.waitForTimeout(1500);

  await page2.evaluate(async (sel) => {
    const card = document.querySelector(sel).closest("[style*='width']");
    const widthNow = () => card.getBoundingClientRect().width;
    const sample = async (ms) => {
      let max = 0;
      const until = Date.now() + ms;
      while (Date.now() < until) {
        await new Promise((r) => setTimeout(r, 60));
        max = Math.max(max, widthNow());
      }
      return max;
    };

    // First learn the card's true peak over a full revolution — a local
    // wobble is not the front of the orbit — then wait for it to come round
    // again and freeze the loop there.
    const peak = await sample(30_000);
    const deadline = Date.now() + 32_000;
    while (Date.now() < deadline && widthNow() < peak * 0.995) {
      await new Promise((r) => setTimeout(r, 60));
    }
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
  }, selector);
  await page2.waitForTimeout(400);

  const box = await page2.locator(selector).boundingBox();
  const view = page2.viewportSize();
  const pad = 46;
  const x = Math.max(0, box.x - pad);
  const y = Math.max(0, box.y - pad);
  await page2.screenshot({
    path: `screenshots/hero-closeup-${name}.png`,
    clip: {
      x,
      y,
      width: Math.min(box.width + pad * 2, view.width - x),
      height: Math.min(box.height + pad * 2, view.height - y),
    },
  });
  console.log(`ok hero-closeup-${name}  ${Math.round(box.width)}x${Math.round(box.height)}`);
  await page2.close();
}

await browser.close();
