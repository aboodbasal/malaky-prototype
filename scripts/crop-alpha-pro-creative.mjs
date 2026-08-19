/**
 * Extracts Alpha Pro MENA's own campaign artwork from the post they supplied.
 *
 * The source is their finished Free AI Assessment post, held whole in
 * public/brand/real-posts/alpha-pro-mena/. What this writes are crops of the
 * creative inside it:
 *
 *   assessment-creative.png  the campaign artwork on its own, lifted out of
 *                            the post chrome — their layout, their type,
 *                            their mark, untouched.
 *   assessment-render.png    the holographic dashboard render from the right
 *                            of that artwork, for the Arabic adaptation to be
 *                            built on their imagery rather than on a drawn
 *                            stand-in.
 *
 * Both are reframed and nothing else: not recoloured, not retouched, not
 * relettered, not generated. Bounds were measured off the file by scanning
 * for the dark card against the light post background.
 *
 *   node scripts/crop-alpha-pro-creative.mjs
 */
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const SRC = "/brand/real-posts/alpha-pro-mena/alpha-pro-linkedin-ai-assessment.png";

const CROPS = [
  /* The creative, edge to edge: logo, headline, the four deliverables and the
     market band they sign off with. */
  { out: "assessment-creative.png", x: 155, y: 413, w: 806, h: 724 },
  /* The same creative on a square canvas, for a feed that wants 1:1.

     Their artwork is 806x724, so a square crop would cut a column off each
     side — including one of the four things they say the assessment covers.
     Letterboxing instead keeps every element they published; the bands above
     and below are filled with the ground colour sampled from the artwork's own
     corner, so nothing is added to the design that was not already in it. */
  { out: "assessment-creative-square.png", x: 155, y: 413, w: 806, h: 724, square: true },
  /* The render alone: the screen and the ring, clear of their headline.

     The bound on the left matters — their "Assessment" lettering ends at
     x=610 in the source, so the crop starts past it. Their type is never
     carried into a composition that sets type of our own. */
  { out: "assessment-render.png", x: 635, y: 443, w: 320, h: 400 },
];

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage();
await p.goto("http://localhost:3000/concept-v2");

for (const crop of CROPS) {
  const dataUrl = await p.evaluate(async ({ src, crop }) => {
    const img = new Image();
    img.src = src;
    await img.decode();

    const c = document.createElement("canvas");
    const size = crop.square ? Math.max(crop.w, crop.h) : 0;
    c.width = crop.square ? size : crop.w;
    c.height = crop.square ? size : crop.h;
    const ctx = c.getContext("2d");

    if (crop.square) {
      /* The ground the artwork already sits on, read from its own corner. */
      const probe = document.createElement("canvas");
      probe.width = probe.height = 1;
      probe.getContext("2d").drawImage(img, crop.x + 3, crop.y + 3, 1, 1, 0, 0, 1, 1);
      const [r, g, b] = probe.getContext("2d").getImageData(0, 0, 1, 1).data;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(0, 0, size, size);
    }

    const dx = crop.square ? Math.round((c.width - crop.w) / 2) : 0;
    const dy = crop.square ? Math.round((c.height - crop.h) / 2) : 0;
    ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, dx, dy, crop.w, crop.h);
    return c.toDataURL("image/png");
  }, { src: SRC, crop });
  writeFileSync(
    `public/brand/customers/alpha-pro/${crop.out}`,
    Buffer.from(dataUrl.split(",")[1], "base64"),
  );
  console.log(`wrote ${crop.out}`);
}

await b.close();
