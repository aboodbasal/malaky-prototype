import { chromium } from "playwright";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const b = await chromium.launch({ executablePath: EXE });

const shoot = async (width, label, fn) => {
  const ctx = await b.newContext({
    viewport: { width, height: width < 500 ? 844 : 950 },
    deviceScaleFactor: 1, isMobile: width < 500, hasTouch: width < 500,
  });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await p.locator("#brand-demo").scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await fn(p);
  await ctx.close();
};

const clip = async (p, name) => {
  const el = p.locator("#brand-demo");
  await el.screenshot({ path: `screenshots/deliver/${name}.jpg`, type: "jpeg", quality: 82 });
};

// 1. initial
await shoot(1440, "initial", async (p) => { await clip(p, "p2-1-initial"); });

// 2. during analysis
await shoot(1440, "analysis", async (p) => {
  await p.fill("#company-url", "falaklogistics.com");
  await p.getByRole("button", { name: /Show me/ }).click();
  await p.waitForTimeout(2600);
  await clip(p, "p2-2-analysis");
});

// 3. results (LinkedIn) + 4. different channel (Executive)
await shoot(1440, "results", async (p) => {
  await p.fill("#company-url", "falaklogistics.com");
  await p.getByRole("button", { name: /Show me/ }).click();
  await p.waitForSelector("text=Here's what Malaky would prepare today", { timeout: 15000 });
  await p.waitForTimeout(900);
  await clip(p, "p2-3-results-linkedin");
  await p.getByRole("tab", { name: "Executive", exact: true }).click();
  await p.waitForTimeout(800);
  await clip(p, "p2-4-channel-executive");
  await p.getByRole("tab", { name: "Instagram", exact: true }).click();
  await p.waitForTimeout(800);
  await clip(p, "p2-4b-channel-instagram");
});

// Arabic RTL check on the hospitality brand
await shoot(1440, "arabic", async (p) => {
  await p.fill("#company-url", "darsidra.com");
  await p.getByRole("button", { name: /Show me/ }).click();
  await p.waitForSelector("text=Here's what Malaky would prepare today", { timeout: 15000 });
  await p.getByRole("tab", { name: "Instagram", exact: true }).click();
  await p.waitForTimeout(800);
  await clip(p, "p2-5-arabic-rtl");
});

// 5. mobile results
await shoot(390, "mobile", async (p) => {
  await p.fill("#company-url", "falaklogistics.com");
  await p.getByRole("button", { name: /Show me/ }).click();
  await p.waitForSelector("text=Here's what Malaky would prepare today", { timeout: 15000 });
  await p.waitForTimeout(900);
  const total = await p.evaluate(() => document.querySelector("#brand-demo").scrollHeight);
  const top = await p.evaluate(() => document.querySelector("#brand-demo").offsetTop);
  for (let i = 0; i < 3; i++) {
    await p.evaluate((y) => window.scrollTo(0, y), top + i * 780);
    await p.waitForTimeout(400);
    await p.screenshot({ path: `screenshots/deliver/p2-6-mobile-${i + 1}.jpg`, type: "jpeg", quality: 82 });
  }
});
await b.close();
console.log("done");
