/** Pass-6 review captures for /concept-v2/pricing. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("screenshots/pass6", { recursive: true });
const OUT = "screenshots/pass6";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

const walk = async (p) => {
  await p.evaluate(async () => {
    const s = innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
    scrollTo(0, 0);
  });
  await p.waitForTimeout(900);
};

for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 500 ? 844 : 900 }, deviceScaleFactor: 2, isMobile: w < 500, hasTouch: w < 500 });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/concept-v2/pricing", { waitUntil: "networkidle" });
  await walk(p);
  await p.screenshot({ path: `${OUT}/pricing-${w}-full.png`, fullPage: true });
  console.log(`ok full @${w}`);
  await ctx.close();
}

const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/concept-v2/pricing", { waitUntil: "networkidle" });
await walk(p);
await p.addStyleTag({ content: "header { visibility: hidden !important; }" });

for (const [selector, label] of [
  ["article[aria-labelledby='business-name']", "card-business"],
  ["article[aria-labelledby='scale-name']", "card-scale"],
  ["article[aria-labelledby='enterprise-name']", "card-enterprise"],
  ["section[aria-labelledby='platform-title']", "platform"],
  ["section[aria-labelledby='setup-title']", "intelligence-setup"],
  ["section[aria-labelledby='compare-title']", "comparison"],
]) {
  const el = p.locator(selector);
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  await el.screenshot({ path: `${OUT}/${label}.png` });
  console.log(`ok ${label}`);
}

// The capacity disclosure, open, since it is closed by default.
await p.locator("details summary").click();
await p.waitForTimeout(300);
await p.locator("details").screenshot({ path: `${OUT}/capacity-details-open.png` });
console.log("ok capacity-details-open");

await b.close();
