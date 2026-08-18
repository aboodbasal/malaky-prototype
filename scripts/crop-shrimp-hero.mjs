/**
 * Extracts the sandwich photograph from Shrimp Joint's own published post.
 *
 * The source is their finished Facebook creative, held whole in
 * public/brand/real-posts/shrimp-joint/. What this writes is a crop of the
 * product photography inside it — the hands and the sandwich, above their own
 * "CRISPY Fish" lettering, which is deliberately left out so their type is
 * never mixed with ours.
 *
 * The crop is the customer's own photograph, unretouched: no recolouring, no
 * generation, no compositing. It is only reframed.
 *
 *   node scripts/crop-shrimp-hero.mjs
 */
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

/* Measured against the 1122x1402 source: the creative's image area runs from
   y=345 to y=1195, and their lettering starts around y=880. */
const CROP = { x: 50, y: 350, w: 1022, h: 520 };

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage();
await p.goto("http://localhost:3000/concept-v2");
const dataUrl = await p.evaluate(async (crop) => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = "/brand/real-posts/shrimp-joint/shrimp-joint-facebook-crispy-fish.png";
  await img.decode();
  const c = document.createElement("canvas");
  c.width = crop.w; c.height = crop.h;
  c.getContext("2d").drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  return c.toDataURL("image/png");
}, CROP);
writeFileSync(
  "public/brand/customers/shrimp-joint/crispy-fish-hero.png",
  Buffer.from(dataUrl.split(",")[1], "base64"),
);
await b.close();
console.log(`wrote crispy-fish-hero.png — ${CROP.w}x${CROP.h}`);
