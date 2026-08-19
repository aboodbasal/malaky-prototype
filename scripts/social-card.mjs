/**
 * Renders the Malaky social sharing card to public/og/malaky-social.png.
 *
 * The checked-in PNG is the artifact — this script exists so the card can be
 * re-rendered deterministically and inspected, not so the build can generate
 * it. Nothing in the app runs this, and no dependency was added for it: it
 * uses the Chromium that already drives the QA suite.
 *
 * The logo is the approved artwork loaded straight off disk. It is placed at
 * its own aspect ratio and never redrawn, recoloured, traced, stretched or
 * paired with a Latin wordmark — see public/brand/README.md.
 *
 *   node scripts/social-card.mjs
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const ROOT = process.cwd();
const OUT = `${ROOT}/public/og/malaky-social.png`;

/* --- the typeface ---------------------------------------------------- *
 * DM Sans, the site's one Latin family, fetched as the variable font so the
 * card can use the same two weights the hero does: 400 for the headline and
 * 450 for the single word that lifts.                                    */

const CSS_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..500&display=swap";
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const css = await (await fetch(CSS_URL, { headers: { "User-Agent": UA } })).text();

/* The last @font-face in the response is the latin subset. */
const blocks = css.split("@font-face").filter((b) => b.includes("src:"));
const latin = blocks[blocks.length - 1];
const fontUrl = latin.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
if (!fontUrl) throw new Error("Could not find the DM Sans latin woff2 in the CSS response.");

const fontData = Buffer.from(await (await fetch(fontUrl)).arrayBuffer()).toString("base64");

/* --- the card --------------------------------------------------------- */

const logo = readFileSync(`${ROOT}/public/brand/malaky-logo-gold.png`).toString("base64");

const html = `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  @font-face {
    font-family: "DM Sans";
    font-style: normal;
    font-weight: 100 1000;
    src: url(data:font/woff2;base64,${fontData}) format("woff2");
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    position: relative;
    overflow: hidden;
    background: #080d11;
    font-family: "DM Sans", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  /* The hero's own glow, in the hero's own place. */
  .glow {
    position: absolute;
    top: -40%;
    left: -12%;
    width: 900px;
    height: 900px;
    background: radial-gradient(closest-side, rgba(255, 78, 45, 0.13), transparent 72%);
  }
  /* A trace of brand warmth opposite it. Gold, unlit, never an edge. */
  .warm {
    position: absolute;
    right: -18%;
    bottom: -46%;
    width: 820px;
    height: 820px;
    background: radial-gradient(closest-side, rgba(227, 192, 132, 0.055), transparent 70%);
  }
  .card {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 72px 76px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  /* Height only, width auto: the approved proportions, untouched.
     align-self matters — a flex child with width:auto is stretched to the
     column's width by default, which would squash the artwork. */
  .logo { height: 64px; width: auto; align-self: flex-start; display: block; }
  h1 {
    font-weight: 400;
    font-size: 96px;
    line-height: 1.05;
    letter-spacing: -0.032em;
    color: #f3ede6;
  }
  .accent { color: #ff4e2d; font-weight: 450; font-style: normal; }
  .foot { display: flex; align-items: center; gap: 20px; }
  .rule { width: 44px; height: 1px; background: rgba(227, 192, 132, 0.5); flex: none; }
  .lead { font-size: 25px; line-height: 1.4; letter-spacing: -0.012em; color: #b3ada6; }
</style></head>
<body>
  <span class="glow"></span>
  <span class="warm"></span>
  <div class="card">
    <img class="logo" src="data:image/png;base64,${logo}" alt="" />
    <h1>Your marketing<br />was <em class="accent">working</em><br />before you were.</h1>
    <div class="foot">
      <span class="rule"></span>
      <p class="lead">The proactive marketing operating system.</p>
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(200);

mkdirSync(`${ROOT}/public/og`, { recursive: true });
writeFileSync(OUT, await page.screenshot({ type: "png" }));
await browser.close();

const png = readFileSync(OUT);
console.log(
  `wrote ${OUT} — ${png.readUInt32BE(16)}×${png.readUInt32BE(20)}, ${Math.round(png.length / 1024)} KB`,
);
