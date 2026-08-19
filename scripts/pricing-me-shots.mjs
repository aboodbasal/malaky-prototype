/**
 * Middle East launch pricing — full pages plus the individual blocks the
 * review asks for, and an audit of what is on the page: every price rendered,
 * any retired figure that leaked back in, and whether the page still shows
 * gold where the homepage would show orange.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = "screenshots/pricing-me";
await mkdir(OUT, { recursive: true });

/** Figures from the previous pricing that must not appear publicly. */
const RETIRED = ["$3,500", "$6,000", "$120,000", "$7,500", "$12,500", "$25,000", "12-month engagement"];

const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

/* --- full pages ----------------------------------------------------- */
for (const [label, width, height, scale] of [
  ["desktop-1440", 1440, 900, 1],
  ["mobile-390", 390, 844, 1],
]) {
  const ctx = await b.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    reducedMotion: "reduce",
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await p.goto("http://localhost:3000/concept-v2/pricing", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);

  const audit = await p.evaluate((retired) => {
    const text = document.body.innerText.replace(/\s+/g, " ");
    /* Gold is reserved for the logo artwork; anything else painting it means
       the page has drifted back to its own theme. */
    const goldish = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      for (const prop of ["color", "borderTopColor", "backgroundColor"]) {
        const m = cs[prop].match(/rgba?\((\d+), (\d+), (\d+)/);
        if (!m) continue;
        const [r, g, bl] = [+m[1], +m[2], +m[3]];
        /* warm, light, and not the orange-red accent */
        if (r > 180 && g > 150 && bl < 170 && r - bl > 50 && g - bl > 30) {
          goldish.push(`${el.tagName}.${(el.className || "").toString().split(" ")[0]}:${prop}=${cs[prop]}`);
        }
      }
    }
    const de = document.documentElement;
    return {
      prices: [...new Set(text.match(/\$[\d,]+/g) || [])],
      retiredFound: retired.filter((r) => text.includes(r)),
      goldish: [...new Set(goldish)].slice(0, 6),
      overflow: de.scrollWidth > de.clientWidth,
      height: de.scrollHeight,
    };
  }, RETIRED);
  console.log(label, JSON.stringify({ ...audit, errors }));

  await p.screenshot({ path: `${OUT}/${label}.png`, fullPage: true });
  console.log(`ok ${label}`);
  await ctx.close();
}

/* --- individual blocks ---------------------------------------------- */
const ctx = await b.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
});
const p = await ctx.newPage();
await p.goto("http://localhost:3000/concept-v2/pricing", { waitUntil: "networkidle" });
await p.waitForTimeout(400);

for (const [label, selector] of [
  ["card-business", "article:has(#business-name)"],
  ["card-scale", "article:has(#scale-name)"],
  ["card-enterprise", "article:has(#enterprise-name)"],
  ["managed", "#managed"],
  ["intelligence-setup", "section:has(#setup-title)"],
]) {
  const el = p.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(200);
  await el.screenshot({ path: `${OUT}/${label}.png` });
  console.log(`ok ${label}`);
}

await b.close();
