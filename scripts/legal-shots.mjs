/** Screenshots for the two website legal pages, plus the footer. */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = "screenshots/legal";
await mkdir(OUT, { recursive: true });

const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

for (const [label, route, width, height] of [
  ["privacy-1440", "/concept-v2/privacy", 1440, 900],
  ["privacy-390", "/concept-v2/privacy", 390, 844],
  ["terms-1440", "/concept-v2/terms", 1440, 900],
  ["terms-390", "/concept-v2/terms", 390, 844],
]) {
  const ctx = await b.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000" + route, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/${label}.png`, fullPage: true });
  console.log(`ok ${label}`);
  await ctx.close();
}

/* The footer, with the Legal column back in it. */
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/concept-v2/privacy", { waitUntil: "networkidle" });
await p.locator("footer").scrollIntoViewIfNeeded();
await p.waitForTimeout(300);
await p.locator("footer").screenshot({ path: `${OUT}/footer.png` });
console.log("ok footer");

await b.close();
