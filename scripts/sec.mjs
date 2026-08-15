import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const [, , url, sel, name] = process.argv;
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:3000${url}`, { waitUntil: "networkidle" });
await page.locator(sel).first().scrollIntoViewIfNeeded();
await page.waitForTimeout(3500);
await page.screenshot({ path: `screenshots/${name}.png` });
await browser.close();
