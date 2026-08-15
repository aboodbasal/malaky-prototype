import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 1440, height: 950 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();

// Fan-out: six Falak adaptations, static
await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
await p.locator("#how-it-works").scrollIntoViewIfNeeded();
await p.waitForTimeout(1500);
await p.locator("#how-it-works ol").screenshot({ path: "screenshots/audit/falak-fanout.png" });

// Arabic section campaign panels
await p.locator("#arabic").scrollIntoViewIfNeeded();
await p.waitForTimeout(900);
await p.locator("#arabic").screenshot({ path: "screenshots/audit/sidra-arabic-panels.png" });

// Approval card close-up
await p.locator("#why-malaky").scrollIntoViewIfNeeded();
await p.waitForTimeout(700);
await p.locator("#why-malaky article").first().screenshot({ path: "screenshots/audit/falak-approval-card.png" });

// Brand demo: each brand, each visual channel
const run = async (domain, tag, channels) => {
  await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await p.locator("#brand-demo").scrollIntoViewIfNeeded();
  await p.fill("#company-url", domain);
  await p.getByRole("button", { name: /Show me/ }).click();
  await p.waitForSelector("text=Here's what Malaky would prepare today", { timeout: 15000 });
  await p.waitForTimeout(700);
  for (const ch of channels) {
    await p.getByRole("tab", { name: ch, exact: true }).click();
    await p.waitForTimeout(700);
    await p.locator("#channel-panel").screenshot({ path: `screenshots/audit/${tag}-${ch.toLowerCase()}.png` });
  }
};
await run("nuraliving.com", "nura", ["Instagram", "Newsletter"]);
await run("meezanadvisory.com", "meezan", ["LinkedIn", "Executive"]);
await run("darsidra.com", "sidra", ["Instagram"]);
await run("falaklogistics.com", "falak", ["LinkedIn"]);
await b.close();
console.log("captured");
