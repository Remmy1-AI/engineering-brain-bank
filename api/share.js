/* Share landing for WhatsApp / iMessage / Telegram.
   Clean URLs: /s/ae-196/engineering-workshop-practice~12e5ee
   Legacy: /s?m=<uuid>
*/

const SUPABASE_URL = "https://jcybycszuxlzkfjsmxjp.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeWJ5Y3N6dXhsemtmanNteGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MzcxMTksImV4cCI6MjEwNjExMzExOX0.2eigOFb-Zc1kkNZJ8vfTif2fdoHIEWc9SPmZ2FmIcY0";

const TYPE_LABELS = {
  slides: "Course Slides",
  notes: "Lecture Notes",
  "past-questions": "Past Questions",
  tutorials: "Tutorials",
  videos: "Videos",
  shared: "Shared Material",
};

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "material";
}

function courseSlug(code) {
  const raw = String(code || "gen").trim().toLowerCase().replace(/\s+/g, "");
  const m = raw.match(/^([a-z]+)(\d+)/i);
  if (m) return `${m[1]}-${m[2]}`;
  return slugify(raw);
}

function courseNameFromPath(filePath, fallback) {
  const parts = String(filePath || "").replace(/\\/g, "/").split("/");
  const folder = parts.length >= 3 ? parts[2] : "";
  if (!folder) return fallback || "Course";
  const m = folder.match(/^[A-Za-z]+-\d{2,4}-(.+)$/);
  if (m) {
    return m[1]
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return folder.replace(/[-_]+/g, " ");
}

async function sb(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchMaterialById(id) {
  if (!id) return null;
  const rows = await sb(
    `materials?id=eq.${encodeURIComponent(id)}` +
      `&select=id,title,course_code,material_type,file_path,file_name,published&limit=1`
  );
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function fetchMaterialBySlug(course, slug, shortId) {
  // Prefer short id when present (unique, still human URL)
  if (shortId && shortId.length >= 4) {
    const rows = await sb(
      `materials?id=like.${encodeURIComponent(shortId)}*` +
        `&published=eq.true` +
        `&select=id,title,course_code,material_type,file_path,file_name,published&limit=20`
    );
    if (Array.isArray(rows) && rows.length) {
      const hit =
        rows.find((r) => slugify(r.title || r.file_name) === slug) ||
        rows.find((r) => courseSlug(r.course_code) === course) ||
        rows[0];
      return hit;
    }
  }

  // Fallback: match course + title slug among published
  const rows = await sb(
    `materials?published=eq.true` +
      `&select=id,title,course_code,material_type,file_path,file_name,published` +
      `&limit=2000`
  );
  if (!Array.isArray(rows)) return null;
  const matches = rows.filter((r) => {
    if (course && courseSlug(r.course_code) !== course) return false;
    return slugify(r.title || r.file_name) === slug;
  });
  return matches[0] || null;
}

function parseSlugPath(pathParam) {
  // "engineering-workshop-practice~12e5ee" or "engineering-workshop-practice"
  const raw = decodeURIComponent(String(pathParam || "")).replace(/^\/+|\/+$/g, "");
  const m = raw.match(/^(.*)~([a-f0-9]{6,12})$/i);
  if (m) return { slug: slugify(m[1]), shortId: m[2].toLowerCase() };
  return { slug: slugify(raw), shortId: "" };
}

function isCrawler(ua) {
  const u = (ua || "").toLowerCase();
  return /whatsapp|facebookexternalhit|facebot|twitterbot|slackbot|telegrambot|discordbot|linkedinbot|skypeuripreview|embedly|quora link preview|pinterest|vkshare|redditbot|applebot|googlebot|bingbot|yandex|duckduckbot|baiduspider|preview|bot|crawler|spider/i.test(
    u
  );
}

module.exports = async function handler(req, res) {
  const host =
    (req.headers["x-forwarded-host"] || req.headers.host || "boye.study")
      .split(",")[0]
      .trim();
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const origin = `${proto}://${host}`;

  const q = req.query || {};
  let id = q.m || q.id || "";
  const courseParam = (q.course || "").toLowerCase();
  const pathParam = q.slug || q.path || "";

  let typeId = q.type || "shared";
  let code = (q.code || "").trim();
  let name = (q.name || "").trim();
  let title = (q.title || "").trim();
  let label = (q.label || "").trim();
  let row = null;

  try {
    if (id) {
      row = await fetchMaterialById(id);
    } else if (courseParam && pathParam) {
      const { slug, shortId } = parseSlugPath(pathParam);
      row = await fetchMaterialBySlug(courseParam, slug, shortId);
      if (row) id = row.id;
    }
  } catch (_) {
    /* fall through */
  }

  if (row) {
    typeId = row.material_type || typeId;
    code = (row.course_code || code || "EBB").trim();
    title = (row.title || row.file_name || title || "").trim();
    name = courseNameFromPath(row.file_path, title) || title || code;
  }

  if (!code) code = "EBB";
  if (!name) name = title || "Engineering Brain Bank";
  if (!label) label = TYPE_LABELS[typeId] || "Material";

  const ogTitle = `${code} — ${name}`;
  const ogDesc = `${label} · AceWithBoye · Engineering Brain Bank · KB4GESA`;
  const ogImage =
    `${origin}/api/og?` +
    new URLSearchParams({
      type: typeId,
      label,
      code,
      name: name.slice(0, 120),
    }).toString();

  const prettyPath =
    row && row.id
      ? `/s/${courseSlug(code)}/${slugify(title)}~${String(row.id).slice(0, 6)}`
      : "/resources.html";
  const humanUrl = id
    ? `${origin}/share.html?m=${encodeURIComponent(id)}`
    : `${origin}/resources.html`;
  const canonicalShare = `${origin}${prettyPath}`;

  const ua = req.headers["user-agent"] || "";
  const crawler = isCrawler(ua);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(ogTitle)} | AceWithBoye</title>
  <meta name="description" content="${escapeHtml(ogDesc)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="AceWithBoye · Engineering Brain Bank" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDesc)}" />
  <meta property="og:url" content="${escapeHtml(canonicalShare)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(ogDesc)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  ${crawler ? "" : `<meta http-equiv="refresh" content="0;url=${escapeHtml(humanUrl)}" />`}
  <link rel="canonical" href="${escapeHtml(canonicalShare)}" />
  <style>
    body{margin:0;font-family:Inter,system-ui,sans-serif;background:#080a0e;color:#f8fafc;
      display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
    a{color:#78c8dc}
    .box{max-width:420px;text-align:center}
    img{width:100%;border-radius:12px;margin:0 0 1rem}
  </style>
</head>
<body>
  <div class="box">
    <img src="${escapeHtml(ogImage)}" alt="${escapeHtml(ogTitle)}" width="1200" height="630" />
    <p><strong>${escapeHtml(ogTitle)}</strong></p>
    <p>${escapeHtml(ogDesc)}</p>
    <p><a href="${escapeHtml(humanUrl)}">Open on boye.study</a></p>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=86400"
  );
  res.statusCode = 200;
  res.end(html);
};
