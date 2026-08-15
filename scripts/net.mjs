import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
p.on("requestfailed", (r) => console.log("FAILED", r.url(), r.failure()?.errorText));
p.on("response", (r) => { if (r.status() >= 400) console.log(r.status(), r.url()); });
await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
await b.close();
