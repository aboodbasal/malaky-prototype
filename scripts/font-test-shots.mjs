/**
 * Hero display-font test — the face under test is applied to the hero
 * headline only.
 *
 * Captures the hero at desktop and mobile, and reports the computed family of
 * every other line of type on the page so it is provable that nothing else
 * moved. The italic variant of the accent word is produced by overriding the
 * style at runtime, so the comparison shots come from one build.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = "screenshots/font-test";
await mkdir(OUT, { recursive: true });

const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

/** [file name, viewport width, height, accent style] */
const SHOTS = [
  ["desktop-1440-upright", 1440, 900, null],
  ["desktop-1440-italic", 1440, 900, "italic"],
  ["mobile-390-upright", 390, 844, null],
];

for (const [label, width, height, accentStyle] of SHOTS) {
  const ctx = await b.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  if (accentStyle) {
    await p.evaluate((s) => {
      document.querySelector("#hero-title em").style.fontStyle = s;
    }, accentStyle);
  }
  await p.waitForTimeout(900);

  const info = await p.evaluate(() => {
    const family = (el) => getComputedStyle(el).fontFamily.split(",")[0].replace(/"/g, "");
    const h1 = document.querySelector("#hero-title");
    const em = h1.querySelector("em");
    const others = [...document.querySelectorAll("h2, h3, .shell p, a, button, li")]
      .filter((el) => !h1.contains(el))
      .map(family);
    return {
      headline: family(h1),
      size: getComputedStyle(h1).fontSize,
      weight: getComputedStyle(h1).fontWeight,
      accent: `${getComputedStyle(em).fontWeight} ${getComputedStyle(em).fontStyle}`,
      accentColor: getComputedStyle(em).color,
      lines: Math.round(
        h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).lineHeight),
      ),
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
