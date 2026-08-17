/**
 * Hero display-font test — the face under test is applied to the hero
 * headline only.
 *
 * Version A is whatever the stylesheet currently ships. Version B is applied
 * as an override at runtime, so both comparison shots come from one build and
 * differ only in the values listed in B below.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = "screenshots/font-test";
await mkdir(OUT, { recursive: true });

/** Version B — a step smaller, with a tighter rhythm. */
const B = {
  size: "min(2.2vw + 30.5px, 62px)",
  mobileSize: "clamp(2.25rem, 9vw, 3.25rem)",
  lineHeight: "1.04",
  letterSpacing: "-0.034em",
  accentSize: "0.97em",
};

const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

/** [file name, viewport width, height, variant] */
const SHOTS = [
  ["desktop-1440-a", 1440, 900, "A"],
  ["desktop-1440-b", 1440, 900, "B"],
  ["mobile-390-a", 390, 844, "A"],
  ["mobile-390-b", 390, 844, "B"],
];

for (const [label, width, height, variant] of SHOTS) {
  const ctx = await b.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });

  if (variant === "B") {
    await p.evaluate(
      ([b, isMobile]) => {
        const h1 = document.querySelector("#hero-title");
        h1.style.fontSize = isMobile ? b.mobileSize : b.size;
        h1.style.lineHeight = b.lineHeight;
        h1.style.letterSpacing = b.letterSpacing;
        h1.querySelector("em").style.fontSize = b.accentSize;
      },
      [B, width < 1080],
    );
  }
  await p.waitForTimeout(900);

  const info = await p.evaluate(() => {
    const family = (el) => getComputedStyle(el).fontFamily.split(",")[0].replace(/"/g, "");
    const h1 = document.querySelector("#hero-title");
    const em = h1.querySelector("em");
    const cs = getComputedStyle(h1);
    const es = getComputedStyle(em);
    const others = [...document.querySelectorAll("h2, h3, .shell p, a, button, li")]
      .filter((el) => !h1.contains(el))
      .map(family);
    return {
      headline: family(h1),
      size: cs.fontSize,
      lineHeight: cs.lineHeight,
      tracking: cs.letterSpacing,
      weight: cs.fontWeight,
      accent: `${es.fontWeight} ${es.fontStyle} ${es.fontSize}`,
      accentColor: es.color,
      blockHeight: Math.round(h1.getBoundingClientRect().height),
      lines: Math.round(h1.getBoundingClientRect().height / parseFloat(cs.lineHeight)),
      elsewhere: [...new Set(others)].sort(),
    };
  });
  console.log(label, JSON.stringify(info));

  /* Clipped from the top of the document rather than an element screenshot:
     the header is fixed, and scrolling the section to the viewport top would
     park it over the first line of the headline. */
  const box = await p.evaluate(() => {
    window.scrollTo(0, 0);
    const r = document.querySelector("section[aria-labelledby=hero-title]").getBoundingClientRect();
    return { x: 0, y: 0, width: document.documentElement.clientWidth, height: Math.round(r.bottom) };
  });
  await p.screenshot({ path: `${OUT}/${label}.png`, fullPage: true, clip: box });
  console.log(`ok ${label}`);
  await ctx.close();
}

await b.close();
