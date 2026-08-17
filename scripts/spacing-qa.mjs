/**
 * The spacing system is frozen. This is what freezing it means in practice.
 *
 * The rhythm is not an arbitrary scale: it is taken from the approved hero.
 * --section-y is the hero's own bottom padding (86px at 1440, 56px at 390),
 * and a section head sits from its content at the hero's largest internal
 * step, the gap between its CTA row and the activity strip (44 / 32).
 *
 * Every documented exception is asserted here too, so an exception stays a
 * decision someone made rather than a value that drifted:
 *   - the closing CTA runs the section rhythm × 1.15;
 *   - pricing, the demo form, the legal pages and the footer run
 *     --section-y-dense, about two thirds of the hero, because the reader is
 *     comparing or filling in rather than being introduced to anything;
 *   - the hero's own top padding is deliberately not the rhythm — it cancels
 *     the centring slack above the headline, and is guarded in its own right.
 */
import { chromium } from "playwright";

const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
let fail = 0;
const ok = (n, p, d = "") => {
  console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`);
  if (!p) fail++;
};
/* Sub-pixel tolerance: these are vw-derived and land on fractions. */
const near = (a, b2, tol = 1.5) => Math.abs(a - b2) <= tol;

const EXPECT = {
  1440: { rhythm: 86.4, head: 44.6, dense: 57.6, closing: 99.4, heroHead: 76 },
  390: { rhythm: 56, head: 32, dense: 40, closing: 64, heroHead: 48 },
};

for (const width of [1440, 390]) {
  const e = EXPECT[width];
  const ctx = await b.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  console.log(`\n--- @${width} ---`);

  await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await p.waitForTimeout(300);

  const home = await p.evaluate(() => {
    const px = (v) => Math.round(parseFloat(v) * 10) / 10;
    const cs = (el) => getComputedStyle(el);
    const secs = [...document.querySelectorAll("main > section")];
    const hero = document.querySelector("section[aria-labelledby=hero-title]");
    const body = secs.filter((s) => s !== hero && s.id !== "get-started");
    const head = document.querySelector("#product .shell > div");
    /* The closing CTA. It is the homepage's last section whatever it
       points at — the id followed the CTA to the self-serve route. */
    const closing = secs.find((s) => s.id === "get-started");
    return {
      heroPadBottom: px(cs(hero).paddingBottom),
      heroHeadline: Math.round(
        document.querySelector("#hero-title").getBoundingClientRect().top +
          window.scrollY -
          document.querySelector("header").getBoundingClientRect().bottom,
      ),
      bodyTop: [...new Set(body.map((s) => px(cs(s).paddingTop)))],
      bodyBottom: [...new Set(body.map((s) => px(cs(s).paddingBottom)))],
      headGap: px(cs(head).marginBottom),
      closingPad: px(cs(closing).paddingTop),
      footerPad: px(cs(document.querySelector("footer")).paddingTop),
    };
  });

  ok("the rhythm is the hero's own bottom padding", near(home.heroPadBottom, e.rhythm),
     `hero padB ${home.heroPadBottom}`);
  ok("every body section opens on the rhythm",
     home.bodyTop.length === 1 && near(home.bodyTop[0], e.rhythm), home.bodyTop.join(", "));
  ok("every body section closes on the rhythm",
     home.bodyBottom.length === 1 && near(home.bodyBottom[0], e.rhythm), home.bodyBottom.join(", "));
  ok("section head sits at the hero's largest internal step", near(home.headGap, e.head),
     `${home.headGap}`);
  ok("hero headline offset unchanged", near(home.heroHeadline, e.heroHead, 6),
     `${home.heroHeadline}px under the header`);

  /* Documented exceptions. */
  ok("exception: closing CTA runs the rhythm × 1.15", near(home.closingPad, e.closing),
     `${home.closingPad}`);
  ok("exception: footer runs the dense rhythm", near(home.footerPad, e.dense),
     `${home.footerPad}`);

  for (const [label, route, selector] of [
    ["pricing", "/concept-v2/pricing", "main section:nth-of-type(2)"],
    ["request-demo", "/concept-v2/request-demo", "main section:last-of-type"],
    ["legal", "/concept-v2/privacy", "main article"],
  ]) {
    await p.goto("http://localhost:3000" + route, { waitUntil: "networkidle" });
    await p.waitForTimeout(200);
    const v = await p.evaluate((sel) => {
      const el = document.querySelector(sel);
      const cs = getComputedStyle(el);
      return {
        top: Math.round(parseFloat(cs.paddingTop) * 10) / 10,
        bottom: Math.round(parseFloat(cs.paddingBottom) * 10) / 10,
      };
    }, selector);
    const hit = near(v.top, e.dense) || near(v.bottom, e.dense);
    ok(`exception: ${label} runs the dense rhythm`, hit, `top ${v.top} / bottom ${v.bottom}`);
  }

  await ctx.close();
}

/* The One Event lanes close on one baseline, whatever the cards do inside. */
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
await p.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 700) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 30));
  }
});
await p.waitForTimeout(400);
const lanes = await p.evaluate(() =>
  [...document.querySelectorAll("#how-it-works [class*=__col]")].map((c) =>
    Math.round(c.getBoundingClientRect().bottom),
  ));
ok("One Event lanes share one baseline", new Set(lanes).size === 1, lanes.join(", "));

await b.close();
console.log(fail ? `\n${fail} FAILURE(S)` : "\nspacing is where it was frozen");
process.exit(fail ? 1 : 0);
