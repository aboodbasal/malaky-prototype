/**
 * Screenshot helper for reviewing the concept.
 *   node scripts/shots.mjs <path> <label> [widths...]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [, , path = "/concept-v2", label = "home", ...rest] = process.argv;
const widths = rest.length ? rest.map(Number) : [1440, 1280, 1024, 768, 390];
const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const errors = [];

for (const width of widths) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 500 ? 844 : 900 },
    deviceScaleFactor: 2,
    isMobile: width < 500,
    hasTouch: width < 500,
  });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${width}] ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`[${width}] pageerror: ${e.message}`));

  await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  // Walk the page so scroll-triggered reveals have run before capture.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.waitForTimeout(3600);

  await page.screenshot({ path: `${OUT}/${label}-${width}-top.png` });
  await page.screenshot({ path: `${OUT}/${label}-${width}-full.png`, fullPage: true });

  // Horizontal overflow check.
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    const offenders = [];
    if (de.scrollWidth > de.clientWidth + 1) {
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.right > de.clientWidth + 1 || r.left < -1) {
          const cs = getComputedStyle(el);
          if (cs.position === "fixed" || cs.visibility === "hidden") continue;
          offenders.push(
            `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} → ${Math.round(r.left)}..${Math.round(r.right)}`,
          );
        }
      }
    }
    return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, offenders: offenders.slice(0, 6) };
  });

  if (overflow.scrollWidth > overflow.clientWidth + 1) {
    console.log(`OVERFLOW @${width}: ${overflow.scrollWidth} > ${overflow.clientWidth}`);
    overflow.offenders.forEach((o) => console.log("   ", o));
  } else {
    console.log(`ok @${width}`);
  }

  await ctx.close();
}

await browser.close();
if (errors.length) {
  console.log("\nCONSOLE ERRORS:");
  errors.forEach((e) => console.log(" ", e));
} else {
  console.log("\nno console errors");
}
