import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const shot = async (url, width, sel, name) => {
  const ctx = await b.newContext({ viewport: { width, height: width < 500 ? 844 : 900 }, deviceScaleFactor: 2, isMobile: width < 500 });
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000${url}`, { waitUntil: "networkidle" });
  if (sel === "footer") { await p.locator("footer").scrollIntoViewIfNeeded(); await p.waitForTimeout(600); }
  await p.locator(sel).screenshot({ path: `screenshots/deliver/${name}.png` });
  await ctx.close();
};
await shot("/concept-v2", 1440, "header", "logo-nav-desktop");
await shot("/concept-v2", 390, "header", "logo-nav-mobile");
await shot("/concept-v2/pricing", 1440, "header", "logo-pricing-header");
await shot("/concept-v2", 1440, "footer", "logo-footer");
await shot("/concept-v2", 768, "header", "logo-nav-tablet");
await shot("/concept-v2/pricing", 390, "header", "logo-pricing-mobile");
await b.close();
console.log("done");
