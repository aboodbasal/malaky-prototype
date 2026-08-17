/** Pass-7 QA for the private-demo request flow. */
import { chromium } from "playwright";

const URL = "http://localhost:3000/concept-v2/request-demo";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let fail = 0;
const ok = (n, p, d = "") => { console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`); if (!p) fail++; };
const field = (p, n) => p.locator(`input[id$="-${n}"]`);
const events = (p) => p.evaluate(() => (window.__malakyEvents || []).map((e) => e.name));

const newPage = async (width = 1440, opts = {}) => {
  const ctx = await b.newContext({
    viewport: { width, height: width < 500 ? 844 : 900 },
    isMobile: width < 500, hasTouch: width < 500, ...opts,
  });
  const p = await ctx.newPage();
  p.__errors = [];
  p.on("pageerror", (e) => p.__errors.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error") p.__errors.push(m.text()); });
  return [ctx, p];
};

const fillValid = async (p, website = "example-visitor.com") => {
  await field(p, "name").fill("Sam Visitor");
  await field(p, "email").fill("sam@example-visitor.com");
  await field(p, "company").fill("Example Visitor Co");
  await field(p, "website").fill(website);
  await field(p, "role").fill("Chief Marketing Officer");
  await field(p, "market").fill("Saudi Arabia");
};

/* --- 1. breakpoints: overflow and errors ---------------------------- */
for (const w of [1440, 1280, 1024, 768, 390, 360]) {
  const [ctx, p] = await newPage(w);
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const over = await p.evaluate(() => {
    const de = document.documentElement;
    return { scrollW: de.scrollWidth, clientW: de.clientWidth };
  });
  ok(`@${w} no horizontal overflow`, over.scrollW <= over.clientW + 1, `${over.scrollW}/${over.clientW}`);
  ok(`@${w} no console errors`, p.__errors.length === 0, p.__errors.join(" | "));
  await ctx.close();
}

/* --- 2. missing required fields ------------------------------------- */
{
  const [ctx, p] = await newPage();
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.getByRole("button", { name: /Send request/ }).click();
  await p.waitForTimeout(300);
  const shown = await p.locator("[id$='-error']").allInnerTexts();
  ok("all six required fields report", shown.length === 6, `${shown.length} messages`);
  const focused = await p.evaluate(() => document.activeElement?.id ?? "");
  ok("focus moves to the first problem", focused.endsWith("-name"), focused);
  ok("still on the form", (await p.locator("form").count()) === 1);
  ok("validation error tracked", (await events(p)).includes("demo_request_error"));
  await ctx.close();
}

/* --- 3. invalid email and website ----------------------------------- */
{
  const [ctx, p] = await newPage();
  await p.goto(URL, { waitUntil: "networkidle" });
  await fillValid(p);
  await field(p, "email").fill("sam@@example");
  await p.getByRole("button", { name: /Send request/ }).click();
  await p.waitForTimeout(300);
  ok("invalid email rejected", (await p.locator("input[id$='-email'] ~ [id$='-error']").innerText()).length > 0);

  await field(p, "email").fill("sam@example-visitor.com");
  await field(p, "website").fill("not a website");
  await p.getByRole("button", { name: /Send request/ }).click();
  await p.waitForTimeout(300);
  ok("invalid website rejected", (await p.locator("input[id$='-website'] ~ [id$='-error']").innerText()).length > 0);

  await field(p, "website").fill("https://www.Example-Visitor.com/about?x=1");
  await p.waitForTimeout(200);
  ok("messy but valid website accepted", (await p.locator("input[id$='-website'] ~ [id$='-error']").count()) === 0);

  await field(p, "email").fill("sam@gmail.com");
  await p.waitForTimeout(200);
  ok("personal address nudges, does not block",
    (await p.locator("input[id$='-email'] ~ span").innerText()).includes("work address"));
  await ctx.close();
}

/* --- 4. interests select and deselect -------------------------------- */
{
  const [ctx, p] = await newPage();
  await p.goto(URL, { waitUntil: "networkidle" });
  const chips = p.locator("fieldset label");
  const boxes = p.locator("fieldset input[type=checkbox]");
  await chips.filter({ hasText: "Arabic content" }).click();
  ok("interest selects", await boxes.nth(2).isChecked());
  await chips.filter({ hasText: "Arabic content" }).click();
  ok("interest deselects", !(await boxes.nth(2).isChecked()));

  await chips.filter({ hasText: "All of the above" }).click();
  const checkedAll = await p.evaluate(() =>
    [...document.querySelectorAll("fieldset input[type=checkbox]")].slice(0, 7).every((c) => c.checked));
  ok("all-of-the-above selects every option", checkedAll);
  await chips.filter({ hasText: "All of the above" }).click();
  const clearedAll = await p.evaluate(() =>
    [...document.querySelectorAll("fieldset input[type=checkbox]")].every((c) => !c.checked));
  ok("all-of-the-above clears every option", clearedAll);
  ok("interest selection tracked", (await events(p)).includes("demo_request_interest_selected"));
  await ctx.close();
}

/* --- 5. keyboard-only completion ------------------------------------- */
{
  const [ctx, p] = await newPage();
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.keyboard.press("Tab"); // skip link
  // Walk to the first input, then type through the form without a mouse.
  for (let i = 0; i < 12; i++) {
    const id = await p.evaluate(() => document.activeElement?.id ?? "");
    if (id.endsWith("-name")) break;
    await p.keyboard.press("Tab");
  }
  ok("keyboard reaches the first field", (await p.evaluate(() => document.activeElement?.id ?? "")).endsWith("-name"));
  for (const v of ["Sam Visitor", "sam@example-visitor.com", "Example Visitor Co", "example-visitor.com", "CMO", "Saudi Arabia"]) {
    await p.keyboard.type(v);
    await p.keyboard.press("Tab");
  }
  // First chip is now focused; toggle it with the keyboard.
  await p.keyboard.press("Space");
  await p.waitForTimeout(150);
  ok("chip toggles with the keyboard", await p.locator("fieldset input[type=checkbox]").first().isChecked());
  const focusRing = await p.evaluate(() => {
    const el = document.activeElement.closest("label");
    return el ? getComputedStyle(el).outlineStyle !== "none" : false;
  });
  ok("focused chip shows a ring", focusRing);

  // Tab to the submit button and activate it.
  for (let i = 0; i < 14; i++) {
    const t = await p.evaluate(() => (document.activeElement?.textContent ?? "").trim());
    if (/Send request/.test(t)) break;
    await p.keyboard.press("Tab");
  }
  await p.keyboard.press("Enter");
  await p.waitForSelector("text=/You.re on the list/", { timeout: 8000 });
  ok("keyboard-only submission reaches success", true);
  const moved = await p.evaluate(() => document.activeElement?.tagName ?? "");
  ok("focus moves to the success panel", moved === "DIV", moved);
  await ctx.close();
}

/* --- 6. mock success and failure -------------------------------------- */
{
  const [ctx, p] = await newPage();
  await p.goto(URL, { waitUntil: "networkidle" });
  await fillValid(p, "fail.test");
  await p.getByRole("button", { name: /Send request/ }).click();
  await p.waitForSelector("form [role=alert]:not([hidden])", { timeout: 8000 });
  ok("mock failure surfaces a message", (await p.locator("form [role=alert]").innerText()).length > 0);
  ok("form is still there after a failure", (await p.locator("form").count()) === 1);
  ok("values survive a failure", (await field(p, "company").inputValue()) === "Example Visitor Co");
  ok("submission error tracked", (await events(p)).filter((e) => e === "demo_request_error").length === 1);

  await field(p, "website").fill("example-visitor.com");
  await p.getByRole("button", { name: /Send request/ }).click();
  await p.waitForSelector("text=/You.re on the list/", { timeout: 8000 });
  ok("retry after failure succeeds", true);
  const ev = await events(p);
  ok("full event sequence fired",
    ["demo_request_view", "demo_request_started", "demo_request_submitted", "demo_request_error", "demo_request_success"]
      .every((e) => ev.includes(e)), ev.join(" → "));
  const exits = p.locator("main a, body > div a").filter({ hasText: /Back to Malaky|View pricing/ });
  ok("success offers both exits",
    (await p.locator("a", { hasText: "Back to Malaky" }).count()) >= 1 &&
    (await p.locator("a", { hasText: "View pricing" }).count()) === 1,
    `${await exits.count()} exit links`);
  await ctx.close();
}

/* --- 7. browser back --------------------------------------------------- */
{
  const [ctx, p] = await newPage();
  await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await p.locator("header a", { hasText: "Request a private demo" }).first().click();
  await p.waitForURL("**/request-demo");
  ok("header CTA navigates to the route", p.url().endsWith("/concept-v2/request-demo"));
  await p.goBack();
  await p.waitForTimeout(600);
  ok("browser back returns to the homepage", p.url().endsWith("/concept-v2"));
  ok("no errors across navigation", p.__errors.length === 0, p.__errors.join(" | "));
  await ctx.close();
}

/* --- 8. every CTA on both pages ---------------------------------------- */
{
  const [ctx, p] = await newPage();
  for (const [path, label] of [["/concept-v2", "homepage"], ["/concept-v2/pricing", "pricing"]]) {
    await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
    const links = await p.evaluate(() => [...document.querySelectorAll("a")].map((a) => ({
      text: (a.textContent || "").replace(/\s+/g, " ").trim(), href: a.getAttribute("href"),
    })));
    const demo = links.filter((l) => /Request a private demo/i.test(l.text));
    ok(`${label}: every demo CTA points at the route`,
      demo.length > 0 && demo.every((l) => l.href === "/concept-v2/request-demo"),
      `${demo.length} CTAs → ${[...new Set(demo.map((l) => l.href))].join(", ")}`);
    const dead = links.filter((l) => (l.href || "").includes("#request-demo"));
    ok(`${label}: no #request-demo links remain`, dead.length === 0,
      dead.map((l) => `${l.text} → ${l.href}`).join(", "));
  }
  // The brand demo's own conversion CTA.
  await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await p.locator("#brand-demo").scrollIntoViewIfNeeded();
  /* Unrecognised on purpose: the conversion block belongs to the
     illustrative path, and the Malaky customers are authored profiles now. */
  await p.fill("#company-url", "acmetrading.com");
  await p.getByRole("button", { name: /Show me/ }).click();
  await p.waitForSelector("text=Want Malaky to actually learn your company?", { timeout: 15000 });
  const href = await p.locator("#brand-demo a", { hasText: "Request a private demo" }).getAttribute("href");
  ok("brand demo CTA points at the route", href === "/concept-v2/request-demo", String(href));
  await ctx.close();
}

/* --- 9. reduced motion --------------------------------------------------- */
{
  const [ctx, p] = await newPage(1440, { reducedMotion: "reduce" });
  await p.goto(URL, { waitUntil: "networkidle" });
  await fillValid(p);
  await p.getByRole("button", { name: /Send request/ }).click();
  await p.waitForSelector("text=/You.re on the list/", { timeout: 8000 });
  ok("reduced motion completes the flow", true);
  ok("reduced motion: no errors", p.__errors.length === 0, p.__errors.join(" | "));
  await ctx.close();
}

/* --- 10. labels and landmarks --------------------------------------------- */
{
  const [ctx, p] = await newPage();
  await p.goto(URL, { waitUntil: "networkidle" });
  const unlabelled = await p.evaluate(() =>
    [...document.querySelectorAll("input:not([type=checkbox]), textarea")]
      .filter((el) => !document.querySelector(`label[for="${el.id}"]`) && !el.getAttribute("aria-label")).length);
  ok("every text field has a real label", unlabelled === 0, `${unlabelled} unlabelled`);
  const checkboxLabels = await p.evaluate(() =>
    [...document.querySelectorAll("fieldset input[type=checkbox]")].filter((c) => !c.closest("label")).length);
  ok("every checkbox sits inside its label", checkboxLabels === 0);
  ok("interests are a fieldset with a legend",
    (await p.locator("fieldset legend").innerText()).includes("What would you most like"));
  ok("one h1 on the page", (await p.locator("h1").count()) === 1);
  ok("simplified header: no primary nav", (await p.locator("header nav").count()) === 0);
  ok("simplified header: back link present",
    (await p.locator("header a", { hasText: "Back to Malaky" }).count()) === 1);
  await ctx.close();
}

await b.close();
console.log(fail ? `\n${fail} FAILURE(S)` : "\nall checks passed");
process.exit(fail ? 1 : 0);
