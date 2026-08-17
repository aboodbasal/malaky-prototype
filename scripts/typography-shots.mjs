/**
 * Full-page captures for the locked typography system, plus a per-page audit:
 * which families actually render text, whether anything overflows the
 * viewport, and whether the page logged an error.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = "screenshots/typography";
await mkdir(OUT, { recursive: true });

const SHOTS = [
  ["home-1440", "/concept-v2", 1440, 900],
  ["home-390", "/concept-v2", 390, 844],
  ["pricing-1440", "/concept-v2/pricing", 1440, 900],
  ["request-demo-1440", "/concept-v2/request-demo", 1440, 900],
];

const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

for (const [label, route, width, height] of SHOTS) {
  const ctx = await b.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => {
    if (m.type() === "error") errs.push(m.text());
  });

  await p.goto("http://localhost:3000" + route, { waitUntil: "networkidle" });
  /* Walk the page so every reveal has fired before the capture. */
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(900);

  const audit = await p.evaluate(() => {
    const families = new Set();
    for (const el of document.querySelectorAll("body *")) {
      const hasText = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim(),
      );
      if (hasText) families.add(getComputedStyle(el).fontFamily.split(",")[0].replace(/"/g, ""));
    }
    const de = document.documentElement;
    return {
      families: [...families].sort(),
      overflow: de.scrollWidth > de.clientWidth,
      height: de.scrollHeight,
    };
  });
  console.log(label, JSON.stringify({ ...audit, errors: errs }));

  await p.screenshot({ path: `${OUT}/${label}.png`, fullPage: true });
  console.log(`ok ${label}`);
  await ctx.close();
}

await b.close();
