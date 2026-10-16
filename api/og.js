/* AceWithBoye OG card as JPEG (Node + sharp).
   Small, cacheable file so WhatsApp shows Boye's face quickly. */
import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export const config = { runtime: "nodejs" };

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const TYPE_LABELS = {
  slides: "Course Slides",
  notes: "Lecture Notes",
  "past-questions": "Past Questions",
  tutorials: "Tutorials",
  videos: "Videos",
  shared: "Shared Material",
};

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapName(name, maxChars) {
  const words = String(name || "").split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, "https://boye.study");
    const typeId = url.searchParams.get("type") || "shared";
    const typeLabel =
      url.searchParams.get("label") || TYPE_LABELS[typeId] || "Material";
    const code = (url.searchParams.get("code") || "EBB").trim().slice(0, 18);
    let name = (url.searchParams.get("name") || "Engineering Brain Bank").trim();
    if (name.length > 70) name = name.slice(0, 67) + "…";
    const nameLines = wrapName(name, 28);

    const boyePath = join(root, "assets/og/boye-cutout-og.jpg");
    const markPath = join(root, "assets/og/ace-wordmark-og.png");
    const bpPath = join(root, "assets/og/blueprint-og.png");

    const boyeBuf = readFileSync(boyePath);
    const markBuf = readFileSync(markPath);
    const bpBuf = readFileSync(bpPath);

    const boyeB64 = boyeBuf.toString("base64");
    const markB64 = markBuf.toString("base64");
    const bpB64 = bpBuf.toString("base64");

    const nameSvg = nameLines
      .map(
        (line, i) =>
          `<text x="596" y="${320 + i * 34}" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="500" fill="#828c96">${esc(line)}</text>`
      )
      .join("");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="1200" height="630" fill="#080a0e"/>
  <rect width="540" height="630" fill="#0b0e14"/>
  <image href="data:image/png;base64,${bpB64}" x="0" y="0" width="540" height="630" opacity="0.35"/>
  <image href="data:image/jpeg;base64,${boyeB64}" x="60" y="22" width="420" height="608" preserveAspectRatio="xMidYMax meet"/>
  <rect x="540" y="55" width="1" height="520" fill="rgba(120,200,220,0.35)"/>
  <text x="596" y="240" font-family="Arial, Helvetica, sans-serif" font-size="140" font-weight="800" fill="rgba(120,200,220,0.09)">${esc(code)}</text>
  <text x="596" y="210" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="1.2" fill="#78c8dc">${esc(String(typeLabel).toUpperCase())}</text>
  <rect x="596" y="222" width="56" height="3" fill="#78c8dc"/>
  <text x="596" y="286" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="#f8fafc">${esc(code)}</text>
  ${nameSvg}
  <image href="data:image/png;base64,${markB64}" x="596" y="545" width="220" height="36"/>
  <text x="596" y="600" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#555f69">Engineering Brain Bank · KB4GESA</text>
</svg>`;

    const jpg = await sharp(Buffer.from(svg))
      .jpeg({ quality: 78, mozjpeg: true, progressive: true })
      .toBuffer();

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader(
      "Cache-Control",
      "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
    );
    res.end(jpg);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(
      "OG render failed: " + (err && err.message ? err.message : String(err))
    );
  }
}
