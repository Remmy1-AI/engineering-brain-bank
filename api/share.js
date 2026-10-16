/* Share landing for WhatsApp / iMessage / Telegram.
   Clean URLs: /s/ae-196/engineering-workshop-practice~12e5ee
   Legacy: /s?m=<uuid>
*/

const SUPABASE_URL = "https://jcybycszuxlzkfjsmxjp.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeWJ5Y3N6dXhsemtmanNteGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MzcxMTksImV4cCI6MjEwNjExMzExOX0.2eigOFb-Zc1kkNZJ8vfTif2fdoHIEWc9SPmZ2FmIcY0";

const ASSET_V = "20261016a4";

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
  return (
    String(s || "")
      .toLowerCase()
      .trim()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "material"
  );
}

function courseSlug(code) {
  const raw = String(code || "gen").trim().toLowerCase().replace(/\s+/g, "");
  const m = raw.match(/^([a-z]+)(\d+)/i);
  if (m) return `${m[1]}-${m[2]}`;
  return slugify(raw);
}

function cleanShareTitle(title, courseCode) {
  let s = String(title || "").trim();
  s = s.replace(/^~\$/, "");
  s = s.replace(/^tmp[_-]?\d+[-_]?/i, "");
  s = s.replace(/^\(\d+\)\s*/, "");
  s = s.replace(/^[-_\s.]+/, "");
  s = s.replace(/_+/g, " ");
  s = s.replace(/\b\d{8,}\b/g, "");
  s = s.replace(/\s*[-–—]?\s*\(?copy\)?\b/gi, "");
  s = s.replace(/\(bookfi\)/gi, "");
  if (courseCode) {
    const spaced = String(courseCode).trim();
    const compact = spaced.replace(/\s+/g, "");
    const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    s = s.replace(new RegExp("^" + esc(spaced) + "[\\s:_-]+", "i"), "");
    s = s.replace(new RegExp("^" + esc(compact) + "[\\s:_-]+", "i"), "");
  }
  s = s.replace(/\s+/g, " ").trim();
  return s || String(title || "").trim() || "material";
}

function courseNameFromPath(filePath, fallback) {
  const parts = String(filePath || "").replace(/\\/g, "/").split("/");
  const folder = parts.length >= 3 ? parts[2] : "";
  if (!folder) return fallback || "Course";
  // extras-MME-365-Thermodynamics → Thermodynamics
  let m = folder.match(/^[A-Za-z]+-\d{2,4}-(.+)$/);
  if (m) {
    return m[1]
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  m = folder.match(/^extras-[A-Za-z]+-\d{2,4}-(.+)$/i);
  if (m) {
    return m[1]
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return folder.replace(/[-_]+/g, " ");
}

function titleLooksDump(title) {
  const t = String(title || "");
  return (
    /^~\$/.test(t) ||
    /^tmp[_-]?\d+/i.test(t) ||
    /^_/.test(t) ||
    /\b\d{8,}\b/.test(t) ||
    /_ebook_/i.test(t) ||
    t.length > 70
  );
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

/** UUID columns can't LIKE — range-match the first segment (8 hex chars). */
function uuidPrefixRange(shortId) {
  const hex = String(shortId || "")
    .toLowerCase()
    .replace(/[^a-f0-9]/g, "");
  if (hex.length < 6) return null;
  const prefix = hex.slice(0, 8).padEnd(8, "0");
  return {
    gte: `${prefix}-0000-0000-0000-000000000000`,
    lte: `${prefix}-ffff-ffff-ffff-ffffffffffff`,
  };
}

async function fetchMaterialBySlug(course, slug, shortId) {
  if (shortId && shortId.length >= 6) {
    const range = uuidPrefixRange(shortId);
    if (range) {
      const rows = await sb(
        `materials?id=gte.${encodeURIComponent(range.gte)}` +
          `&id=lte.${encodeURIComponent(range.lte)}` +
          `&select=id,title,course_code,material_type,file_path,file_name,published&limit=20`
      );
      if (Array.isArray(rows) && rows.length) {
        return (
          rows.find((r) =>
            String(r.id).toLowerCase().startsWith(shortId.toLowerCase())
          ) || rows[0]
        );
      }
    }
  }

  const rows = await sb(
    `materials?published=eq.true` +
      `&select=id,title,course_code,material_type,file_path,file_name,published` +
      `&limit=2000`
  );
  if (!Array.isArray(rows)) return null;
  const matches = rows.filter((r) => {
    if (course && courseSlug(r.course_code) !== course) return false;
    const cleaned = slugify(cleanShareTitle(r.title || r.file_name, r.course_code));
    return cleaned === slug || slugify(r.title || r.file_name) === slug;
  });
  return matches[0] || null;
}

function parseSlugPath(pathParam) {
  const raw = decodeURIComponent(String(pathParam || "")).replace(/^\/+|\/+$/g, "");
  const m = raw.match(/^(.*)~([a-f0-9]{6,12})$/i);
  if (m) return { slug: slugify(m[1]), shortId: m[2].toLowerCase() };
  return { slug: slugify(raw), shortId: "" };
}

function humanShareHtml(origin, bootstrap, og) {
  const bootJson = JSON.stringify(bootstrap).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="${origin}/assets/favicon/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="32x32" href="${origin}/assets/favicon/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="${origin}/assets/favicon/apple-touch-icon.png" />
  <title>${escapeHtml(og.title)} | AceWithBoye</title>
  <meta name="description" content="${escapeHtml(og.desc)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="AceWithBoye · Engineering Brain Bank" />
  <meta property="og:title" content="${escapeHtml(og.title)}" />
  <meta property="og:description" content="${escapeHtml(og.desc)}" />
  <meta property="og:url" content="${escapeHtml(og.url)}" />
  <meta property="og:image" content="${escapeHtml(og.image)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(og.image)}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(og.title)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(og.title)}" />
  <meta name="twitter:description" content="${escapeHtml(og.desc)}" />
  <meta name="twitter:image" content="${escapeHtml(og.image)}" />
  <link rel="canonical" href="${escapeHtml(og.url)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${origin}/css/styles.css?v=${ASSET_V}" />
</head>
<body data-page="share">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" id="site-header"></header>
  <main class="main" id="main">
    <section class="section">
      <div class="container" id="share-root">
        <div class="empty-state">Loading shared material…</div>
      </div>
    </section>
  </main>
  <footer class="site-footer" id="site-footer"></footer>
  <script>window.__EBB_SHARE__=${bootJson};</script>
  <script src="${origin}/js/data.js?v=${ASSET_V}"></script>
  <script src="${origin}/js/supabase-config.js?v=${ASSET_V}"></script>
  <script src="${origin}/js/ebb-api.js?v=${ASSET_V}"></script>
  <script src="${origin}/js/og-card.js?v=${ASSET_V}"></script>
  <script src="${origin}/js/app.js?v=${ASSET_V}"></script>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "boye.study")
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
  let parsed = { slug: "", shortId: "" };

  try {
    if (id) {
      row = await fetchMaterialById(id);
    } else if (courseParam && pathParam) {
      parsed = parseSlugPath(pathParam);
      row = await fetchMaterialBySlug(courseParam, parsed.slug, parsed.shortId);
      if (row) id = row.id;
    }
  } catch (_) {
    /* fall through */
  }

  if (row) {
    typeId = row.material_type || typeId;
    code = (row.course_code || code || "").trim();
    title = (row.title || row.file_name || title || "").trim();
    const fromPath = courseNameFromPath(row.file_path, "");
    const cleaned = cleanShareTitle(title, code);
    // Prefer real course name for OG card (like AE 196 — Engineering Workshop Practice)
    if (fromPath && (titleLooksDump(title) || cleaned.length < 4 || fromPath.length > cleaned.length)) {
      name = fromPath;
    } else {
      name = fromPath || cleaned || title || code;
    }
  }

  if (!code) code = row ? "EBB" : "EBB";
  if (!name) name = cleanShareTitle(title, code) || "Engineering Brain Bank";
  if (!label) label = TYPE_LABELS[typeId] || "Material";

  // Never market the website name as the OG title when we have a material
  if (row && (!code || code === "EBB") && row.course_code) {
    code = String(row.course_code).trim();
  }
  if (row && (/engineering brain bank/i.test(name) || name === "EBB")) {
    name =
      courseNameFromPath(row.file_path, "") ||
      cleanShareTitle(row.title || row.file_name, code) ||
      code;
  }

  const displayTitle = cleanShareTitle(title, code);
  const slugBase = displayTitle || name || "material";
  const short = row && row.id ? String(row.id).slice(0, 8) : parsed.shortId || "";
  const prettyPath =
    row && row.id
      ? `/s/${courseSlug(code)}/${slugify(slugBase)}~${short}`
      : courseParam && pathParam
        ? `/s/${courseParam}/${String(pathParam).replace(/^\/+|\/+$/g, "")}`
        : "/resources.html";

  const ogTitle = `${code} — ${name}`;
  const ogDesc = `${label} · AceWithBoye · Engineering Brain Bank · KB4GESA`;
  const ogImage =
    `${origin}/api/og?` +
    new URLSearchParams({
      type: typeId,
      label,
      code,
      name: String(name).slice(0, 120),
    }).toString();
  const canonicalShare = `${origin}${prettyPath}`;

  const og = {
    title: ogTitle,
    desc: ogDesc,
    image: ogImage,
    url: canonicalShare,
  };

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );
  res.statusCode = 200;

  const bootstrap = {
    id: row ? row.id : id || "",
    shortId: short,
    course: courseParam || courseSlug(code),
    slug: parsed.slug || slugify(slugBase),
    prettyPath,
  };
  res.end(humanShareHtml(origin, bootstrap, og));
};
