import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:3000/concept-v2", { waitUntil: "networkidle" });
const t = await p.locator("body").innerText();
for (const frag of ["correct the same thing twice", "language toggle", "Different rhythm"]) {
  const line = t.split("\n").find((l) => l.includes(frag));
  console.log(JSON.stringify(line));
  console.log("  codepoints around apostrophe:", [...(line||"")].filter(c=>c==="'"||c==="’").map(c=>c.charCodeAt(0)));
}
await b.close();
