import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/* Confirms the WebP encode changed nothing but the container: same pixel
   dimensions, same content within a tight per-channel tolerance. */
const ROOT = "public/brand/real-posts";
for (const dir of readdirSync(ROOT)) {
  const d = join(ROOT, dir);
  if (!statSync(d).isDirectory()) continue;
  for (const f of readdirSync(d).filter((n) => n.endsWith(".png"))) {
    const png = join(d, f);
    const webp = png.replace(/\.png$/, ".webp");
    const a = await sharp(png).raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(webp).raw().toBuffer({ resolveWithObject: true });
    const sameDims = a.info.width === b.info.width && a.info.height === b.info.height;
    let max = 0, sum = 0;
    for (let i = 0; i < a.data.length; i++) {
      const d2 = Math.abs(a.data[i] - b.data[i]);
      if (d2 > max) max = d2;
      sum += d2;
    }
    console.log(
      `${f.padEnd(46)} dims ${a.info.width}x${a.info.height} ${sameDims ? "MATCH" : "MISMATCH"}` +
      `  maxChannelDelta ${max}  meanDelta ${(sum / a.data.length).toFixed(3)}`,
    );
  }
}
