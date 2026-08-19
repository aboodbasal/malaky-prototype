/** Operating-calendar review captures. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("screenshots/calendar", { recursive: true });
const OUT = "screenshots/calendar";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

const open = async (w) => {
  const ctx = await b.newContext({
    viewport: { width: w, height: w < 500 ? 844 : 900 },
    deviceScaleFactor: 2, isMobile: w < 500, hasTouch: w < 500,
  });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "header { visibility: hidden !important; }" });
  await p.locator("#product").scrollIntoViewIfNeeded();
  await p.waitForTimeout(1200);
  return [ctx, p];
};

for (const w of [1440, 390]) {
  const [ctx, p] = await open(w);
  const label = w === 1440 ? "desktop" : "mobile";

  await p.locator("#product").screenshot({ path: `${OUT}/${label}-default.png` });
  console.log(`ok ${label}-default (Saudi National Day)`);

  // A completed past event, to show the panel switching.
  await p.locator("#product button", { hasText: "Campaign launch" }).first().click();
  await p.waitForTimeout(500);
  await p.locator("#product").screenshot({ path: `${OUT}/${label}-completed.png` });
  console.log(`ok ${label}-completed (Quarterly campaign launch)`);

  // A future event that is still being prepared.
  await p.locator("#product button", { hasText: "Product launch" }).first().click();
  await p.waitForTimeout(500);
  await p.locator("#product").screenshot({ path: `${OUT}/${label}-preparing.png` });
  console.log(`ok ${label}-preparing (Product launch)`);

  await ctx.close();
}
await b.close();
