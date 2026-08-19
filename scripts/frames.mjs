import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
for (let i = 0; i < 4; i++) {
  await p.screenshot({ path: `screenshots/orbit-frame-${i}.jpg`, type: "jpeg", quality: 82 });
  await p.waitForTimeout(7200);
}
await b.close();
