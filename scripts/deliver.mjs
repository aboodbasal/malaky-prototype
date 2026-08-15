import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("screenshots/deliver", { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [path, label, width] of [
  ["/concept-v2", "homepage-desktop", 1440],
  ["/concept-v2", "homepage-mobile", 390],
  ["/concept-v2/pricing", "pricing-desktop", 1440],
  ["/concept-v2/pricing", "pricing-mobile", 390],
]) {
  const ctx = await b.newContext({
    viewport: { width, height: width < 500 ? 844 : 900 },
    deviceScaleFactor: 1,
    isMobile: width < 500,
    hasTouch: width < 500,
  });
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
  await p.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 110));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(3600);

  if (width < 500) {
    // A 390px full-page capture is ~17000px tall, which is unusable as an
    // image — send readable sections instead.
    const total = await p.evaluate(() => document.body.scrollHeight);
    const vh = 844;
    const sections = Math.min(6, Math.ceil(total / vh));
    const stride = Math.floor((total - vh) / (sections - 1));
    for (let i = 0; i < sections; i++) {
      await p.evaluate((y) => window.scrollTo(0, y), i * stride);
      await p.waitForTimeout(700);
      await p.screenshot({
        path: `screenshots/deliver/${label}-${i + 1}.jpg`,
        type: "jpeg",
        quality: 80,
      });
    }
  } else {
    await p.screenshot({ path: `screenshots/deliver/${label}.jpg`, fullPage: true, type: "jpeg", quality: 80 });
  }
  await ctx.close();
}
await b.close();
