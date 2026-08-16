/** Pass-7 review captures for /concept-v2/request-demo. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("screenshots/pass7", { recursive: true });
const OUT = "screenshots/pass7";
const URL = "http://localhost:3000/concept-v2/request-demo";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

const ctxFor = (w) => b.newContext({
  viewport: { width: w, height: w < 500 ? 844 : 900 },
  deviceScaleFactor: 2, isMobile: w < 500, hasTouch: w < 500,
});

/* Ids are generated per render, so match on the stable suffix. */
const field = (p, name) => p.locator(`input[id$="-${name}"]`);

const fill = async (p, website = "nuraliving.com") => {
  await field(p, "name").fill("Huda Nasser");
  await field(p, "email").fill("huda@nuraliving.com");
  await field(p, "company").fill("Nura Living");
  await field(p, "website").fill(website);
  await field(p, "role").fill("Chief Marketing Officer");
  await field(p, "market").fill("Saudi Arabia");
  await p.getByText("Founder / executive LinkedIn").click();
  await p.getByText("Arabic content").click();
  await p.getByText("Campaign planning").click();
};

for (const w of [1440, 390]) {
  const ctx = await ctxFor(w);
  const p = await ctx.newPage();

  await p.goto(URL, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/initial-${w}.png`, fullPage: true });

  await fill(p);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/completed-${w}.png`, fullPage: true });

  await p.getByRole("button", { name: /Send request/ }).click();
  // The heading renders a typographic apostrophe; match either.
  await p.waitForSelector("text=/You.re on the list/", { timeout: 8000 });
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/success-${w}.png`, fullPage: true });

  console.log(`ok @${w}`);
  await ctx.close();
}

// Validation state, and the mocked failure path.
const ctx = await ctxFor(1440);
const p = await ctx.newPage();
await p.goto(URL, { waitUntil: "networkidle" });
await p.getByRole("button", { name: /Send request/ }).click();
await p.waitForTimeout(400);
await p.screenshot({ path: `${OUT}/validation-1440.png`, fullPage: true });
console.log("ok validation");

await p.goto(URL, { waitUntil: "networkidle" });
await fill(p, "fail.test");
await p.getByRole("button", { name: /Send request/ }).click();
await p.waitForSelector("form [role=alert]:not([hidden])", { timeout: 8000 });
await p.waitForTimeout(300);
await p.locator("form").screenshot({ path: `${OUT}/submit-failure-1440.png` });
console.log("ok submit-failure");

await b.close();
