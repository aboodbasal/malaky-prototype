/**
 * Guards the two rules that govern real-company screenshots:
 *   1. nothing is stretched — rendered ratio must equal the file's own ratio;
 *   2. nothing is nested inside platform chrome this concept draws itself.
 */
import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

for (const width of [1440, 390]) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 500 ? 844 : 900 },
    deviceScaleFactor: 1,
    isMobile: width < 500,
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 110));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1600);

  const report = await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('img[src*="/brand/real-posts/"]')];
    // Lazy images further along the gallery rail have not been fetched yet;
    // decode them all so every one can be measured, not just the visible few.
    await Promise.all(
      imgs.map((img) => {
        img.loading = "eager";
        return img.decode().catch(() => {});
      }),
    );

    // Class names this concept uses when it draws a platform for itself.
    const CHROME = /posts-module__[^\s]*__(shell|platformBar|account|body|caption|engagement|mailHead|reelWrap)/;
    return imgs.map((img) => {
      const r = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      let chromeAncestor = null;
      for (let el = img.parentElement; el; el = el.parentElement) {
        if (CHROME.test(String(el.className))) {
          chromeAncestor = String(el.className);
          break;
        }
        if (el.tagName === "ARTICLE") chromeAncestor = "<article> post shell";
      }
      return {
        src: img.getAttribute("src").split("/").pop(),
        natural: img.naturalWidth / img.naturalHeight,
        // The layout box, not the painted box. Orbit cards sit under a 3D
        // rotation, so getBoundingClientRect returns the axis-aligned bounds
        // of the projected quad — a property of the camera, not of the image.
        rendered: img.offsetWidth / img.offsetHeight,
        w: img.offsetWidth,
        h: img.offsetHeight,
        objectFit: cs.objectFit,
        decoded: img.complete && img.naturalWidth > 0,
        // The hero mounts both the orbit and the mobile stack and hides the
        // one the breakpoint does not want; a hidden card has no box to measure.
        laidOut: img.offsetWidth > 0 && img.offsetHeight > 0 && r.width > 0,
        chromeAncestor,
        inHero: !!img.closest("section[aria-labelledby='hero-title']"),
        inGallery: !!img.closest("#real-brands"),
      };
    });
  });

  check(`@${width} real screenshots present`, report.length > 0, `${report.length} rendered`);

  check(`@${width} every screenshot decoded`, report.every((r) => r.decoded),
    `${report.filter((r) => r.decoded).length}/${report.length}`);

  for (const r of report) {
    check(`@${width} ${r.src} no platform chrome around it`, !r.chromeAncestor, r.chromeAncestor ?? "none");
    check(`@${width} ${r.src} not cropped`, r.objectFit === "fill", `object-fit: ${r.objectFit}`);
    if (!r.laidOut) {
      console.log(`SKIP  @${width} ${r.src} ratio — hidden at this breakpoint`);
      continue;
    }
    const drift = Math.abs(r.rendered - r.natural) / r.natural;
    check(
      `@${width} ${r.src} not stretched`,
      drift < 0.005,
      `${r.w}x${r.h}, ratio ${r.rendered.toFixed(4)} vs file ${r.natural.toFixed(4)} (${(drift * 100).toFixed(3)}% drift)`,
    );
  }

  const gallery = new Set(report.filter((r) => r.inGallery).map((r) => r.src));
  const hero = new Set(report.filter((r) => r.inHero).map((r) => r.src));
  check(`@${width} gallery carries all five brands`, gallery.size === 5, [...gallery].join(", "));
  check(`@${width} hero carries three real posts`, hero.size === 3, [...hero].join(", "));

  await ctx.close();
}

await browser.close();
console.log(failures ? `\n${failures} FAILURE(S)` : "\nall checks passed");
process.exit(failures ? 1 : 0);
