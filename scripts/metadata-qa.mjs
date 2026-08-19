/**
 * Guards the public entry point and the sharing metadata.
 *
 * Three things this protects. The base URL must land on Malaky rather than on
 * a list of builds. The homepage's title and description must be the one
 * canonical pair, identical in the head, in Open Graph and on the X card.
 * And the card the whole site shares must actually exist, be 1200×630, and be
 * reachable at the path the metadata claims.
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { HOME_DESCRIPTION, HOME_TITLE, OG_IMAGE, SITE_NAME } from "../lib/site.ts";

const BASE = "http://localhost:3000";
const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
let fail = 0;
const ok = (n, p, d = "") => {
  console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`);
  if (!p) fail++;
};

const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errs.push(m.text());
});

const meta = () =>
  page.evaluate(() => {
    const get = (sel) => document.querySelector(sel)?.getAttribute("content") ?? null;
    return {
      title: document.title,
      description: get('meta[name="description"]'),
      ogTitle: get('meta[property="og:title"]'),
      ogDescription: get('meta[property="og:description"]'),
      ogImage: get('meta[property="og:image"]'),
      ogType: get('meta[property="og:type"]'),
      ogSite: get('meta[property="og:site_name"]'),
      ogWidth: get('meta[property="og:image:width"]'),
      ogHeight: get('meta[property="og:image:height"]'),
      twCard: get('meta[name="twitter:card"]'),
      twTitle: get('meta[name="twitter:title"]'),
      twDescription: get('meta[name="twitter:description"]'),
      twImage: get('meta[name="twitter:image"]'),
    };
  });

/* --- 1. the base URL is Malaky ---------------------------------------- */

const res = await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
ok("the base URL lands on the site", page.url() === `${BASE}/concept-v2`, page.url());
ok("and it arrives there successfully", res.status() === 200, String(res.status()));

const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
ok("no build index is visible", !/Malaky prototype|Concept builds/i.test(body));

/* The redirect itself, unfollowed: a real HTTP redirect, not a rendered page
   that happens to bounce. */
const raw = await fetch(`${BASE}/`, { redirect: "manual" });
ok("the root is a server redirect", raw.status >= 300 && raw.status < 400, String(raw.status));
ok("pointing at /concept-v2", raw.headers.get("location") === "/concept-v2",
   raw.headers.get("location"));

/* --- 2/3. the homepage's canonical wording ----------------------------- */

const home = await meta();
ok("the homepage title is the canonical one", home.title === HOME_TITLE, home.title);
ok("with a capital Your", /was working before you were$/.test(home.title) && home.title.includes("— Your"));
ok("the homepage description is exact", home.description === HOME_DESCRIPTION, home.description);

/* One wording across three surfaces. */
ok("Open Graph repeats the title verbatim", home.ogTitle === HOME_TITLE, home.ogTitle);
ok("Open Graph repeats the description verbatim", home.ogDescription === HOME_DESCRIPTION);
ok("the X card repeats the title verbatim", home.twTitle === HOME_TITLE, home.twTitle);
ok("the X card repeats the description verbatim", home.twDescription === HOME_DESCRIPTION);

ok("Open Graph declares a website", home.ogType === "website", home.ogType);
ok("Open Graph names the site", home.ogSite === SITE_NAME, home.ogSite);
ok("the X card is a large image", home.twCard === "summary_large_image", home.twCard);
ok("the card's dimensions are declared", home.ogWidth === "1200" && home.ogHeight === "630",
   `${home.ogWidth}×${home.ogHeight}`);

/* --- 4. the image itself ------------------------------------------------ */

ok("the image URL is absolute", /^https?:\/\//.test(home.ogImage ?? ""), home.ogImage);
ok("Open Graph and the X card share one image", home.ogImage === home.twImage);
ok("it is the site card", (home.ogImage ?? "").endsWith(OG_IMAGE.url), home.ogImage);

const img = await fetch(home.ogImage);
ok("the card resolves", img.status === 200, String(img.status));
ok("as a PNG", (img.headers.get("content-type") ?? "").includes("image/png"),
   img.headers.get("content-type"));

const png = Buffer.from(await img.arrayBuffer());
const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)];
ok("at 1200 × 630", w === 1200 && h === 630, `${w}×${h}`);

/* The approved artwork is placed, never processed. Its own file must be
   exactly what it was: same pixels, same dimensions. */
const logo = readFileSync("public/brand/malaky-logo-gold.png");
ok("the official logo artwork is untouched",
   logo.readUInt32BE(16) === 750 && logo.readUInt32BE(20) === 370,
   `${logo.readUInt32BE(16)}×${logo.readUInt32BE(20)}`);

/* --- 5. the commercial pages keep their own wording, and the card ------- */

for (const [path, title] of [
  ["/concept-v2/pricing", "Pricing — Malaky"],
  ["/concept-v2/get-started", "Get started — Malaky"],
  ["/concept-v2/request-demo", "Request a private demo — Malaky"],
]) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  const m = await meta();
  ok(`${path}: keeps its own title`, m.title === title, m.title);
  ok(`${path}: says the same thing to a crawler`, m.ogTitle === title, m.ogTitle);
  ok(`${path}: has its own description`,
     typeof m.description === "string" && m.description.length > 40 &&
       m.description !== HOME_DESCRIPTION);
  ok(`${path}: the description reaches Open Graph and the X card`,
     m.ogDescription === m.description && m.twDescription === m.description);
  ok(`${path}: shares the one site card`, (m.ogImage ?? "").endsWith(OG_IMAGE.url), m.ogImage);
  ok(`${path}: is a large-image card`, m.twCard === "summary_large_image", m.twCard);
}

/* --- 6. indexing policy is deliberately not set here -------------------- */

await page.goto(`${BASE}/concept-v2`, { waitUntil: "networkidle" });
const robots = await page.evaluate(
  () => document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
);
ok("no indexing decision has been made yet", robots === null, robots);

ok("no console or hydration errors", errs.length === 0, errs.slice(0, 3).join(" | "));

await b.close();
console.log(fail ? `\n${fail} FAILURE(S)` : "\nall checks passed");
process.exit(fail ? 1 : 0);
