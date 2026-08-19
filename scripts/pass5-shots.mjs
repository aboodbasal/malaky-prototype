/** Pass-5 review captures. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("screenshots/pass5", { recursive: true });

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const OUT = "screenshots/pass5";

const walk = async (page) => {
  await page.evaluate(async () => {
    const s = innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
};

const ctxFor = (width) => browser.newContext({
  viewport: { width, height: width < 500 ? 844 : 900 },
  deviceScaleFactor: 2, isMobile: width < 500, hasTouch: width < 500,
});

// 1 + 2 — whole page, both ends of the range.
for (const width of [1440, 390]) {
  const ctx = await ctxFor(width);
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await walk(page);
  await page.screenshot({ path: `${OUT}/home-${width}-full.png`, fullPage: true });
  console.log(`ok home @${width}`);
  await ctx.close();
}

// 3–6 — the restructured sections, header hidden so it does not paint over them.
const SECTIONS = [
  ["#product", "proactive"],
  ["#how-it-works", "one-event"],
  ["#real-brands", "real-brands"],
  ["#control", "approval-trust"],
];
for (const [selector, label] of SECTIONS) {
  const ctx = await ctxFor(1440);
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await walk(page);
  await page.addStyleTag({ content: "header { visibility: hidden !important; }" });
  const el = page.locator(selector);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await el.screenshot({ path: `${OUT}/${label}-1440.png` });
  console.log(`ok ${label}`);
  await ctx.close();
}

// 7 — the illustrative result for a real company's domain, and an authored one.
for (const [domain, label, width] of [
  ["ataccama.com", "demo-unknown", 1440],
  ["ataccama.com", "demo-known", 1440],
  ["ataccama.com", "demo-unknown", 390],
]) {
  const ctx = await ctxFor(width);
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await walk(page);
  await page.locator("#brand-demo").scrollIntoViewIfNeeded();
  await page.locator("#brand-demo input").fill(domain);
  await page.locator("#brand-demo form button[type=submit]").click();
  await page.waitForTimeout(7000);
  await page.addStyleTag({ content: "header { visibility: hidden !important; }" });
  await page.locator("#brand-demo").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.locator("#brand-demo").screenshot({ path: `${OUT}/${label}-${width}.png` });
  console.log(`ok ${label} @${width}`);
  await ctx.close();
}

// 8 — the persistent mobile CTA, at rest and after scrolling.
for (const width of [390, 360]) {
  const ctx = await ctxFor(width);
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.locator("header").screenshot({ path: `${OUT}/mobile-cta-${width}.png` });
  const box = await page.locator("header .shell").boundingBox();
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    return { scrollW: de.scrollWidth, clientW: de.clientWidth };
  });
  console.log(`ok mobile-cta @${width}  bar ${Math.round(box.width)}px  page ${overflow.scrollW}/${overflow.clientW}`);
  await ctx.close();
}

await browser.close();
