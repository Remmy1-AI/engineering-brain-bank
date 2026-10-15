/* Engineering Brain Bank — AceWithBoye share / Open Graph card (canvas) */
(function () {
  "use strict";

  const W = 1200;
  const H = 630;
  const GOLD = "#FFB800";
  const WHITE = "#FFFFFF";
  const BG = "#080808";

  const TYPE_LABELS = {
    slides: "Course Slides",
    notes: "Lecture Notes",
    "past-questions": "Past Questions",
    tutorials: "Tutorials",
    videos: "Videos",
    shared: "Shared Material",
  };

  let _boye = null;
  let _wordmark = null;
  let _loading = null;

  function assetUrl(path) {
    try {
      return new URL(path, window.location.href).href;
    } catch (_) {
      return path;
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load " + src));
      img.src = src;
    });
  }

  async function ensureAssets() {
    if (_boye && _wordmark) return;
    if (_loading) return _loading;
    _loading = Promise.all([
      loadImage(assetUrl("./assets/og/boye-cutout.png")),
      loadImage(assetUrl("./assets/og/ace-wordmark.png")),
    ]).then(([boye, wordmark]) => {
      _boye = boye;
      _wordmark = wordmark;
    });
    return _loading;
  }

  function wrapText(ctx, text, maxWidth, maxLines) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = "";
    for (const word of words) {
      const test = cur ? cur + " " + word : word;
      if (ctx.measureText(test).width <= maxWidth) {
        cur = test;
      } else {
        if (cur) lines.push(cur);
        cur = word;
        if (lines.length >= maxLines) break;
      }
    }
    if (cur && lines.length < maxLines) lines.push(cur);
    if (words.length && lines.length === maxLines) {
      // ellipsis if truncated
      let last = lines[maxLines - 1];
      while (last.length > 3 && ctx.measureText(last + "…").width > maxWidth) {
        last = last.slice(0, -1);
      }
      if (String(text).split(/\s+/).length > words.slice(0, lines.join(" ").split(/\s+/).length).length) {
        lines[maxLines - 1] = last.replace(/\s+$/, "") + "…";
      }
    }
    return lines.length ? lines : [String(text || "").slice(0, 40)];
  }

  function drawGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    // faint blueprint rings
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 2;
    [
      [920, 180, 110],
      [1080, 420, 70],
      [760, 520, 55],
    ].forEach(([cx, cy, r]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  /**
   * @param {{ typeLabel?: string, type?: string, title: string, footer?: string }} opts
   * @returns {Promise<HTMLCanvasElement>}
   */
  async function renderCard(opts) {
    await ensureAssets();
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    drawGrid(ctx);

    // Boye — left, bottom-aligned, slight bleed left (match mockup)
    const bh = H * 0.98;
    const br = bh / _boye.naturalHeight;
    const bw = _boye.naturalWidth * br;
    const bx = -bw * 0.06;
    const by = H - bh;
    ctx.drawImage(_boye, bx, by, bw, bh);

    const typeLabel =
      opts.typeLabel ||
      TYPE_LABELS[opts.type] ||
      (opts.type ? String(opts.type) : "Material");
    const title = opts.title || "Engineering Brain Bank";
    const footer = opts.footer || "Engineering Brain Bank • KB4GESA";

    const tx = Math.round(W * 0.42);
    const maxTextW = W - tx - 48;

    // Type label + gold underline
    ctx.fillStyle = GOLD;
    ctx.font = "600 28px Inter, system-ui, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(typeLabel, tx, 88);
    const typeW = ctx.measureText(typeLabel).width;
    ctx.fillRect(tx, 126, Math.max(40, typeW), 3);

    // Title (italic weight)
    ctx.fillStyle = WHITE;
    ctx.font = "italic 800 52px Inter, system-ui, sans-serif";
    const lines = wrapText(ctx, title, maxTextW, 3);
    let ty = 150;
    lines.forEach((line) => {
      ctx.fillText(line, tx, ty);
      ty += 62;
    });

    // AceWithBoye wordmark
    const wh = 50;
    const wr = wh / _wordmark.naturalHeight;
    const ww = _wordmark.naturalWidth * wr;
    ctx.drawImage(_wordmark, tx, ty + 20, ww, wh);

    // Footer bottom-right
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "500 18px Inter, system-ui, sans-serif";
    ctx.textBaseline = "bottom";
    const fw = ctx.measureText(footer).width;
    ctx.fillText(footer, W - fw - 36, H - 28);

    return canvas;
  }

  async function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), type || "image/jpeg", quality == null ? 0.9 : quality);
    });
  }

  /**
   * Build a shareable AceWithBoye card for a material (or course-like payload).
   * @returns {Promise<{ blob: Blob, file: File, dataUrl: string, title: string, typeLabel: string }>}
   */
  async function buildMaterialCard(m, course) {
    const typeId = m.type || m.material_type || "shared";
    const typeLabel = TYPE_LABELS[typeId] || "Material";
    const code = (course && course.code) || m.course_code || "";
    const name = (m.title || m.fileName || "").trim();
    const courseName = course && course.name ? course.name : "";
    let title;
    if (code && name) title = code + " – " + name;
    else if (code && courseName) title = code + " – " + courseName;
    else title = name || courseName || code || "Engineering Brain Bank";

    const canvas = await renderCard({ typeLabel, title, type: typeId });
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    const safe = String(code || "ebb")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "ebb";
    const file = new File([blob], `acewithboye-${safe}.jpg`, { type: "image/jpeg" });
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    return { blob, file, dataUrl, title, typeLabel, canvas };
  }

  window.EBBOgCard = {
    renderCard,
    buildMaterialCard,
    TYPE_LABELS,
    ensureAssets,
  };
})();
