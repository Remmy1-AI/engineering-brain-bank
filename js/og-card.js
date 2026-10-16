/* Engineering Brain Bank — AceWithBoye share card (from-scratch layout)
   Left: Boye in a cool blueprint panel (inset, not edge-pinned)
   Right: mist accent + oversized course code + name + brand */
(function () {
  "use strict";

  const W = 1200;
  const H = 630;
  const LEFT = 540;
  const BG = "#080a0e";
  const PANEL = "#0b0e14";
  const MIST = "#78c8dc";
  const WHITE = "#f8fafc";
  const MUTE = "#828c96";
  const FOOT = "#555f69";

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
  let _blueprint = null;
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
    if (_boye && _wordmark && _blueprint) return;
    if (_loading) return _loading;
    _loading = Promise.all([
      loadImage(assetUrl("./assets/og/boye-cutout.png")),
      loadImage(assetUrl("./assets/og/ace-wordmark.png")),
      loadImage(assetUrl("./assets/og/blueprint-left-clean.png")).catch(() =>
        loadImage(assetUrl("./assets/og/blueprint-from-svg.png"))
      ),
    ]).then(([boye, wordmark, blueprint]) => {
      _boye = boye;
      _wordmark = wordmark;
      _blueprint = blueprint;
    });
    return _loading;
  }

  function wrapLines(ctx, text, maxWidth, maxLines) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = "";
    for (const word of words) {
      const test = cur ? cur + " " + word : word;
      if (ctx.measureText(test).width <= maxWidth) cur = test;
      else {
        if (cur) lines.push(cur);
        cur = word;
        if (lines.length >= maxLines) break;
      }
    }
    if (cur && lines.length < maxLines) lines.push(cur);
    return lines.length ? lines : [String(text || "").slice(0, 36)];
  }

  function splitCodeName(title) {
    const raw = String(title || "").trim();
    const m = raw.match(/^([A-Za-z]{1,6}\s*\d{2,4})\s*[—–-]\s*(.+)$/);
    if (m) return { code: m[1].replace(/\s+/g, " ").trim(), name: m[2].trim() };
    const parts = raw.split(/\s*[—–-]\s*/);
    if (parts.length >= 2 && parts[0].length <= 16) {
      return { code: parts[0].trim(), name: parts.slice(1).join(" — ").trim() };
    }
    return { code: raw.slice(0, 18) || "EBB", name: raw };
  }

  /**
   * @param {{ typeLabel?: string, type?: string, title: string, footer?: string }} opts
   */
  async function renderCard(opts) {
    await ensureAssets();
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // Base
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Left panel
    ctx.fillStyle = PANEL;
    ctx.fillRect(0, 0, LEFT, H);

    // Blueprint inside left panel only
    if (_blueprint) {
      ctx.save();
      ctx.globalAlpha = 0.32;
      ctx.drawImage(_blueprint, 0, 0, LEFT, H);
      ctx.restore();
    }

    // Soft left vignette
    const vig = ctx.createLinearGradient(0, 0, LEFT, 0);
    vig.addColorStop(0, "rgba(0,0,0,0.35)");
    vig.addColorStop(0.2, "rgba(0,0,0,0)");
    vig.addColorStop(0.8, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.25)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, LEFT, H);

    // Boye — centered in left panel, not flush to edge
    let bh = H * 0.93;
    let bw = (_boye.naturalWidth / _boye.naturalHeight) * bh;
    const maxBw = LEFT * 0.78;
    if (bw > maxBw) {
      const s = maxBw / bw;
      bw *= s;
      bh *= s;
    }
    let bx = (LEFT - bw) / 2;
    if (bx < 40) bx = 40;
    const by = H - bh;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(bx + bw / 2, H - 8, bw * 0.36, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(_boye, bx, by, bw, bh);

    // Seam hairline
    ctx.strokeStyle = "rgba(120,200,220,0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(LEFT, 56);
    ctx.lineTo(LEFT, H - 56);
    ctx.stroke();

    const typeLabel =
      opts.typeLabel ||
      TYPE_LABELS[opts.type] ||
      (opts.type ? String(opts.type) : "Material");
    const { code, name } = splitCodeName(opts.title || "Engineering Brain Bank");
    const footer = opts.footer || "Engineering Brain Bank · KB4GESA";

    // Giant mist watermark
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = MIST;
    ctx.font = "800 150px Inter, system-ui, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(code, LEFT + 20, 200);
    ctx.restore();

    // Right stack
    const tx = LEFT + 56;
    const maxTextW = W - tx - 48;
    ctx.textBaseline = "top";
    ctx.font = "700 15px ui-monospace, SFMono-Regular, Menlo, monospace";
    const nameLines = (() => {
      ctx.font = "500 27px Inter, system-ui, sans-serif";
      return wrapLines(ctx, name, maxTextW, 3);
    })();

    const stackH = 26 + 22 + 84 + nameLines.length * 34;
    let y = (H - stackH) / 2 - 10;

    ctx.fillStyle = MIST;
    ctx.font = "700 15px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(String(typeLabel).toUpperCase(), tx, y);
    y += 26;
    ctx.fillRect(tx, y, 56, 3);
    y += 22;

    ctx.fillStyle = WHITE;
    ctx.font = "800 68px Inter, system-ui, sans-serif";
    ctx.fillText(code, tx, y);
    y += 84;

    ctx.fillStyle = MUTE;
    ctx.font = "500 27px Inter, system-ui, sans-serif";
    nameLines.forEach((line) => {
      ctx.fillText(line, tx, y);
      y += 34;
    });

    // Brand
    const wh = 38;
    const wr = wh / _wordmark.naturalHeight;
    const ww = _wordmark.naturalWidth * wr;
    ctx.drawImage(_wordmark, tx, H - 78, ww, wh);

    ctx.fillStyle = FOOT;
    ctx.font = "500 13px Inter, system-ui, sans-serif";
    ctx.textBaseline = "bottom";
    ctx.fillText(footer, tx, H - 24);

    return canvas;
  }

  async function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => {
      canvas.toBlob(
        (b) => resolve(b),
        type || "image/jpeg",
        quality == null ? 0.9 : quality
      );
    });
  }

  function cleanCardTitle(title, courseCode) {
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
    return s.replace(/\s+/g, " ").trim();
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

  async function buildMaterialCard(m, course) {
    const typeId = m.type || m.material_type || "shared";
    const typeLabel = TYPE_LABELS[typeId] || "Material";
    const code = (course && course.code) || m.course_code || "";
    const courseName = course && course.name ? course.name : "";
    const fileTitle = cleanCardTitle(m.title || m.fileName || "", code);

    let title;
    // Prefer course name when the file title is dump/temp junk
    if (code && courseName && (!fileTitle || titleLooksDump(m.title || ""))) {
      title = code + " — " + courseName;
    } else if (code && courseName) title = code + " — " + courseName;
    else if (code && fileTitle) title = code + " — " + fileTitle;
    else title = fileTitle || courseName || code || "Engineering Brain Bank";

    const canvas = await renderCard({ typeLabel, title, type: typeId });
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    const safe =
      String(code || "ebb")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "ebb";
    const file = new File([blob], `acewithboye-${safe}.jpg`, {
      type: "image/jpeg",
    });
    return {
      blob,
      file,
      dataUrl: canvas.toDataURL("image/jpeg", 0.92),
      title,
      typeLabel,
      canvas,
    };
  }

  window.EBBOgCard = {
    renderCard,
    buildMaterialCard,
    TYPE_LABELS,
    ensureAssets,
  };
})();
