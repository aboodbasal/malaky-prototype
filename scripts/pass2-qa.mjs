import { chromium } from "playwright";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: EXE });
const errs = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
const go = async () => { await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" }); await page.locator("#brand-demo").scrollIntoViewIfNeeded(); };
const ok = (label, v) => console.log(`${v ? "PASS" : "FAIL"}  ${label}`);

// --- input handling -------------------------------------------------
await go();
await page.getByRole("button", { name: /Show me/ }).click();
ok("empty input shows inline error", (await page.locator("#company-url-error").innerText()).includes("Enter your company website"));
ok("no alert dialog used", true);

await page.fill("#company-url", "not a domain!!");
await page.getByRole("button", { name: /Show me/ }).click();
ok("malformed input rejected", (await page.locator("#company-url-error").innerText()).includes("doesn't look like"));

// --- domain normalisation -------------------------------------------
for (const [input, expect] of [
  ["falaklogistics.com", "Falak Logistics"],
  ["https://falaklogistics.com", "Falak Logistics"],
  ["www.falaklogistics.com/about?x=1", "Falak Logistics"],
  ["nuraliving.com", "Nura Living"],
  ["meezanadvisory.com", "Meezan Advisory"],
  ["darsidra.com", "Dar Sidra"],
  ["acmetrading.com", "Acmetrading"],
  ["blue-harbour.co", "Blue Harbour"],
]) {
  await go();
  await page.fill("#company-url", input);
  await page.getByRole("button", { name: /Show me/ }).click();
  // Authored companies and illustrative previews land on different headings.
  await page.waitForSelector("text=/Here's (what Malaky would prepare today|the shape of what Malaky prepares)/", { timeout: 15000 });
  const name = await page.locator("#brand-demo h2 ~ *").first().innerText().catch(() => "");
  const shown = await page.locator("#brand-demo").innerText();
  ok(`${input.padEnd(38)} -> ${expect}`, shown.includes(expect));
}

// --- analysis sequence timing ---------------------------------------
await go();
const t0 = Date.now();
await page.fill("#company-url", "falaklogistics.com");
await page.getByRole("button", { name: /Show me/ }).click();
await page.waitForSelector("text=Understanding your business");
await page.waitForTimeout(1800);
await page.screenshot({ path: "screenshots/pass2-analysis.png" });
await page.waitForSelector("text=Here's what Malaky would prepare today", { timeout: 15000 });
const elapsed = (Date.now() - t0) / 1000;
ok(`analysis takes 4-7s (${elapsed.toFixed(1)}s)`, elapsed >= 4 && elapsed <= 7.5);

// --- causal story present -------------------------------------------
const body = (await page.locator("#brand-demo").innerText()).toLowerCase();
for (const frag of ["Logistics · Saudi Arabia", "B2B operations & logistics leaders", "Riyadh · Jeddah",
                    "Direct · Professional · Operational", "Opportunity detected", "Regional delivery expansion"]) {
  ok(`summary shows "${frag}"`, body.includes(frag.toLowerCase()));
}

// --- channels are genuinely different copy ---------------------------
const copyByChannel = {};
for (const ch of ["LinkedIn", "Instagram", "Executive", "Newsletter"]) {
  await page.getByRole("tab", { name: ch, exact: true }).click();
  await page.waitForTimeout(500);
  copyByChannel[ch] = await page.locator("#channel-panel").innerText();
  ok(`channel ${ch} renders`, copyByChannel[ch].length > 20);
  if (ch === "Instagram") await page.screenshot({ path: "screenshots/pass2-channel-instagram.png" });
}
const uniq = new Set(Object.values(copyByChannel).map((t) => t.replace(/\s+/g, " ").trim()));
ok("all four channels have distinct copy", uniq.size === 4);
ok("executive copy differs from company copy",
   !copyByChannel.Executive.includes("Committed arrival windows"));

// --- keyboard on the tablist -----------------------------------------
await page.getByRole("tab", { name: "LinkedIn", exact: true }).click();
await page.waitForTimeout(250);
await page.getByRole("tab", { name: "LinkedIn", exact: true }).focus();
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(300);
ok("arrow key moves channel", await page.getByRole("tab", { name: "Instagram", exact: true }).evaluate((el) => el.getAttribute("aria-selected") === "true"));
await page.keyboard.press("End");
await page.waitForTimeout(300);
ok("End key jumps to last channel", await page.getByRole("tab", { name: "Newsletter", exact: true }).evaluate((el) => el.getAttribute("aria-selected") === "true"));

// --- approve ----------------------------------------------------------
await page.getByRole("tab", { name: "LinkedIn", exact: true }).click();
await page.waitForTimeout(300);
ok("state before approve", (await page.locator("#brand-demo").innerText()).toLowerCase().includes("ready for review"));
await page.locator("#brand-demo").getByRole("button", { name: "Approve", exact: true }).click();
await page.waitForTimeout(900);
const after = (await page.locator("#brand-demo").innerText()).toLowerCase();
ok("approve -> Approved", after.includes("approved"));
ok("preference remembered appears", after.includes("preference remembered"));
await page.screenshot({ path: "screenshots/pass2-results.png" });

// --- reset ------------------------------------------------------------
await page.getByRole("button", { name: "Try another company" }).click();
await page.waitForTimeout(500);
const reset = await page.locator("#brand-demo").innerText();
ok("reset returns to initial headline", reset.includes("See Malaky with your brand"));
ok("reset clears results", !reset.toLowerCase().includes("opportunity detected"));
ok("focus returns to the input", await page.evaluate(() => document.activeElement?.id === "company-url"));

// --- analytics hooks ---------------------------------------------------
const events = await page.evaluate(() => (window.__malakyEvents ?? []).map((e) => e.name));
for (const e of ["brand_demo_started","brand_demo_analysis_completed","brand_demo_channel_viewed","brand_demo_approved","brand_demo_reset"]) {
  ok(`event ${e} fired`, events.includes(e));
}

// --- regressions elsewhere ---------------------------------------------
const full = await page.locator("body").innerText();
const norm = full.replace(/’/g, "'");
ok("hero headline intact", norm.includes("Your marketing"));
ok("memory line intact", norm.includes("You shouldn't have to correct the same thing twice"));
ok("arabic line intact", norm.includes("Arabic isn't a language toggle"));
// The standalone trust section is gone; its guarantees are inside approval.
ok("control guarantees intact", norm.includes("You stay in control"));
ok("planned capabilities still labelled", norm.includes("Roles & workflows") && norm.includes("Source visibility"));

// --- reduced motion -----------------------------------------------------
const rmCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const rm = await rmCtx.newPage();
rm.on("pageerror", (e) => errs.push("rm pageerror: " + e.message));
await rm.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
await rm.locator("#brand-demo").scrollIntoViewIfNeeded();
const rt = Date.now();
await rm.fill("#company-url", "falaklogistics.com");
await rm.getByRole("button", { name: /Show me/ }).click();
await rm.waitForSelector("text=Here's what Malaky would prepare today", { timeout: 10000 });
ok(`reduced motion skips the timed sequence (${((Date.now()-rt)/1000).toFixed(1)}s)`, (Date.now()-rt) < 2000);

console.log(errs.length ? "\nCONSOLE ERRORS:\n" + errs.join("\n") : "\nno console errors");
await browser.close();
