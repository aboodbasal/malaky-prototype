/**
 * Samples the orbit across a full revolution and reports how far the cards
 * actually travel, so the shared centre can be judged against real extents
 * rather than one frozen frame.
 */
import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

for (const width of [1440, 1280, 1080]) {
  const ctx = await browser.newContext({ viewport: { width, height: 940 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const r = await page.evaluate(async () => {
    const stage = document.querySelector("section[aria-labelledby='hero-title'] [role='group']");
    const viewport = stage.closest("div").parentElement; // .stage -> .viewport
    const cards = [...stage.children];
    const acc = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
    const peak = {};

    // A full revolution is 29s. Anything shorter samples an arc, not the
    // cycle, and reports peaks for whichever cards happened to swing forward.
    const label = (c) => {
      const img = c.querySelector("img");
      return img
        ? img.getAttribute("src").split("/").pop()
        : (c.textContent || "").replace(/\s+/g, " ").trim().slice(0, 20);
    };
    const deadline = performance.now() + 30_000;
    while (performance.now() < deadline) {
      await new Promise((res) => requestAnimationFrame(res));
      for (const c of cards) {
        const b = c.getBoundingClientRect();
        if (b.width === 0) continue;
        acc.left = Math.min(acc.left, b.left);
        acc.right = Math.max(acc.right, b.right);
        acc.top = Math.min(acc.top, b.top);
        acc.bottom = Math.max(acc.bottom, b.bottom);
        const k = label(c);
        peak[k] = Math.max(peak[k] ?? 0, Math.round(b.width));
      }
    }

    const v = viewport.getBoundingClientRect();
    const copy = document.querySelector("section[aria-labelledby='hero-title'] h1").getBoundingClientRect();
    return { peak, acc, v: { l: v.left, r: v.right, t: v.top, b: v.bottom, w: v.width, h: v.height }, copyRight: copy.right };
  });

  const { acc, v } = r;
  console.log(`\n@${width}  viewport ${Math.round(v.w)}x${Math.round(v.h)} at x ${Math.round(v.l)}..${Math.round(v.r)}`);
  console.log(`  cards x ${Math.round(acc.left)}..${Math.round(acc.right)}   (page 0..${width}, headline ends ${Math.round(r.copyRight)})`);
  console.log(`  cards y ${Math.round(acc.top)}..${Math.round(acc.bottom)}   (viewport y ${Math.round(v.t)}..${Math.round(v.b)})`);
  console.log(`  slack: left ${Math.round(acc.left - v.l)}  right ${Math.round(v.r - acc.right)}  ` +
              `top ${Math.round(acc.top - v.t)}  bottom ${Math.round(v.b - acc.bottom)}`);
  console.log(`  page bleed: left ${Math.round(acc.left)}  right ${Math.round(width - acc.right)}`);
  console.log("  peak painted width per card:");
  for (const [k, w] of Object.entries(r.peak).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(w).padStart(4)}px  ${k}`);
  }

  await ctx.close();
}
await browser.close();
