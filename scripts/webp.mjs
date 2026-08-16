import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "public/brand/real-posts";
const rows = [];

for (const dir of readdirSync(ROOT)) {
  const dirPath = join(ROOT, dir);
  if (!statSync(dirPath).isDirectory()) continue;
  for (const file of readdirSync(dirPath)) {
    if (!file.endsWith(".png")) continue;
    const src = join(dirPath, file);
    const out = src.replace(/\.png$/, ".webp");
    const meta = await sharp(src).metadata();
    // Lossless-quality settings: q=92 near-lossless keeps platform UI text
    // crisp. No resize, no crop, no colour transform.
    const info = await sharp(src).webp({ quality: 92, effort: 6 }).toFile(out);
    rows.push({
      file: src.replace(ROOT + "/", ""),
      w: meta.width, h: meta.height,
      png: statSync(src).size, webp: info.size,
    });
  }
}

let tp = 0, tw = 0;
for (const r of rows.sort((a,b)=>a.file.localeCompare(b.file))) {
  tp += r.png; tw += r.webp;
  const k = (n) => (n/1024).toFixed(0).padStart(5) + " KB";
  console.log(`${r.file.padEnd(58)} ${String(r.w).padStart(4)}x${String(r.h).padStart(4)}  PNG ${k(r.png)}  WebP ${k(r.webp)}  -${(100-100*r.webp/r.png).toFixed(1)}%`);
}
console.log(`\nTOTAL  PNG ${(tp/1024/1024).toFixed(2)} MB -> WebP ${(tw/1024/1024).toFixed(2)} MB  (-${(100-100*tw/tp).toFixed(1)}%)`);
