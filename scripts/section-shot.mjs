/**
 * Captures one element by selector, at one viewport width.
 *   node scripts/section-shot.mjs <path> <selector> <label> [widths...]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [, , path, selector, label, ...rest] = process.argv;
const widths = rest.length ? rest.map(Number) : [1440];
mkdirSync("screenshots", { recursive: true });

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

for (const width of widths) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 500 ? 844 : 900 },
    deviceScaleFactor: 2,
    isMobile: width < 500,
    hasTouch: width < 500,
  });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await page.waitForTimeout(1400);
  // The sticky header paints over whatever it overlaps, so it comes out of
  // the way for the capture.
  await page.addStyleTag({ content: "header { visibility: hidden !important; }" });
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await el.screenshot({ path: `screenshots/${label}-${width}.png` });
  console.log(`ok ${label} @${width}`);
  await ctx.close();
}

await browser.close();
