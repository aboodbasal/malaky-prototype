/**
 * Guards the rule Pass 5 exists to enforce: for a domain Malaky has not read,
 * the brand demo may not assert anything factual about that company.
 *
 * Authored demo companies are exempt — those profiles are written by hand for
 * fictional businesses, so they are allowed to read as findings.
 */
import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

let failures = 0;
const ok = (name, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!pass) failures++;
};

/**
 * Runs the demo and returns every channel's rendered text, lowercased.
 *
 * Two things this has to get right or it tests nothing: labels are uppercased
 * by CSS, so innerText never matches sentence-case source strings; and only
 * the selected channel is in the DOM, so the executive post has to be opened
 * before it can be checked.
 */
const run = async (domain) => {
  await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await page.locator("#brand-demo").scrollIntoViewIfNeeded();
  await page.fill("#company-url", domain);
  await page.getByRole("button", { name: /Show me/ }).click();
  await page.waitForSelector(
    "text=/Here's (what Malaky would prepare today|the shape of what Malaky prepares)/",
    { timeout: 15000 },
  );
  await page.waitForTimeout(400);

  let text = await page.locator("#brand-demo").innerText();
  for (const tab of ["Instagram", "Executive", "Newsletter"]) {
    await page.locator("#brand-demo [role=tab]", { hasText: tab }).first().click();
    await page.waitForTimeout(250);
    text += "\n" + (await page.locator("#brand-demo").innerText());
  }
  return text.replace(/\s+/g, " ").toLowerCase();
};

/* Real companies a visitor might plausibly type, including three named in the
   gallery on the same page. */
/* Domains the demo has never heard of. The Malaky customers moved out of this
   list when they became recognised profiles — see KNOWN_DOMAINS. */
const UNKNOWN = ["acmetrading.com", "northline-group.com", "quiethouse.co", "vela-partners.com"];

/* Claims the previous build invented for whatever domain was typed. None of
   them may appear for a company nothing was read about. */
const BANNED = [
  "saudi arabia",
  "opportunity detected",
  "riyadh",
  "jeddah",
  "dammam",
  "chief executive officer",
  "advisory retainers",
  "wholesale supply",
  "operating reviews",
  "next month",
  "this quarter",
];

for (const domain of UNKNOWN) {
  const text = await run(domain);
  const hits = BANNED.filter((b) => text.includes(b));
  ok(`${domain.padEnd(20)} asserts no invented facts`, hits.length === 0, hits.join(", ") || "none");
  ok(`${domain.padEnd(20)} labelled illustrative`, text.includes("illustrative opportunity"));
  ok(
    `${domain.padEnd(20)} says the site was not read`,
    text.includes("this website has not been read"),
  );
  ok(
    `${domain.padEnd(20)} carries the concept-preview notice`,
    text.includes("malaky is not reading this website yet"),
  );
  ok(
    `${domain.padEnd(20)} every intelligence row is an example`,
    text.includes("example audience") && text.includes("example voice"),
  );
  /* The invented palette is gone rather than relabelled: a placeholder
     identity is still an identity nobody chose. */
  ok(
    `${domain.padEnd(20)} invents no brand palette at all`,
    !text.includes("palette") && !text.includes("brand colors"),
  );
  ok(
    `${domain.padEnd(20)} offers the real-analysis conversion`,
    text.includes("want malaky to actually learn your company?"),
  );
  ok(`${domain.padEnd(20)} names no executive`, text.includes("your executive"));
}

/* The authored companies keep working, and keep their detected framing. */
for (const domain of ["ataccama.com", "bakertilly.sa"]) {
  const text = await run(domain);
  /* The label changed with the conversion: what the demo shows for a
     recognised customer is a business moment that company has actually made
     public, so it says so rather than claiming Malaky detected it. */
  ok(`${domain.padEnd(20)} still an authored profile`, text.includes("public business moment"));
  ok(`${domain.padEnd(20)} not mislabelled illustrative`, !text.includes("illustrative opportunity"));
  ok(
    `${domain.padEnd(20)} no conversion block`,
    !text.includes("want malaky to actually learn your company?"),
  );
}

/* The notice is on screen before anything runs, not only after. */
await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
await page.locator("#brand-demo").scrollIntoViewIfNeeded();
ok(
  "notice shown before any analysis",
  (await page.locator("#brand-demo").innerText())
    .toLowerCase()
    .includes("malaky is not reading this website yet"),
);

await browser.close();
console.log(failures ? `\n${failures} FAILURE(S)` : "\nall checks passed");
process.exit(failures ? 1 : 0);
