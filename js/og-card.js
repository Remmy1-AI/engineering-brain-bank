/* Engineering Brain Bank — AceWithBoye share / Open Graph card (canvas)
   Layout: two halves — Boye centered in LEFT (blueprint behind, not flush),
   text block centered in RIGHT. */
(function () {
  "use strict";

  const W = 1200;
  const H = 630;
  const GOLD = "#FFB800";
  const WHITE = "#FFFFFF";
  const BG = "#000000";

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

  /** Prefer "CODE — Name" as two lines, else wrap. */
  function titleLines(ctx, title, maxWidth) {
    const raw = String(title || "").trim();
    const split = raw.split(/\s*[—–-]\s*/);
    if (split.length >= 2 && split[0].length <= 18) {
      const first = split[0] + " —";
      const rest = split.slice(1).join(" — ");
      const lines = [first];
      // wrap rest if needed
      const words = rest.split(/\s+/);
      let cur = "";
      for (const word of words) {
        const test = cur ? cur + " " + word : word;
        if (ctx.measureText(test).width <= maxWidth) cur = test;
        else {
          if (cur) lines.push(cur);
          cur = word;
          if (lines.length >= 3) break;
        }
      }
      if (cur && lines.length < 3) lines.push(cur);
      return lines.slice(0, 3);
    }
    // generic wrap
    const words = raw.split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = "";
    for (const word of words) {
      const test = cur ? cur + " " + word : word;
      if (ctx.measureText(test).width <= maxWidth) cur = test;
      else {
        if (cur) lines.push(cur);
        cur = word;
        if (lines.length >= 3) break;
      }
    }
    if (cur && lines.length < 3) lines.push(cur);
    return lines.length ? lines : [raw.slice(0, 36)];
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

    // Solid black
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Engineering drawings — LEFT half only, behind Boye
    if (_blueprint) {
      const bpW = Math.round(W * 0.52);
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.drawImage(_blueprint, 0, 0, bpW, H);
      ctx.restore();
    }

    // Boye — centered in LEFT half, breathing room from left edge
    const leftCenter = W / 4;
    const minPad = Math.round(W * 0.05);
    let bh = H * 0.92;
    let br = bh / _boye.naturalHeight;
    let bw = _boye.naturalWidth * br;
    const maxBw = (W / 2) * 0.78;
    if (bw > maxBw) {
      const s = maxBw / bw;
      bw *= s;
      bh *= s;
    }
    let bx = leftCenter - bw / 2;
    if (bx < minPad) bx = minPad;
    // keep inside left half with a little gap to the midline
    if (bx + bw > W / 2 - 8) {
      bw = W / 2 - 8 - bx;
      bh = bw * (_boye.naturalHeight / _boye.naturalWidth);
    }
    const by = H - bh;
    ctx.drawImage(_boye, bx, by, bw, bh);

    const typeLabel =
      opts.typeLabel ||
      TYPE_LABELS[opts.type] ||
      (opts.type ? String(opts.type) : "Material");
    const title = opts.title || "Engineering Brain Bank";
    const footer = opts.footer || "Engineering Brain Bank • KB4GESA";

    // RIGHT half: text column centered inside the half
    const rightLeft = W / 2;
    const rightW = W / 2;
    const colW = rightW * 0.72;
    const colX = rightLeft + (rightW - colW) / 2;

    ctx.textBaseline = "top";
    ctx.fillStyle = GOLD;
    ctx.font = "600 26px Inter, system-ui, sans-serif";
    const typeW = ctx.measureText(typeLabel).width;

    ctx.font = "italic 800 50px Inter, system-ui, sans-serif";
    const lines = titleLines(ctx, title, colW);
    const titleLineH = 58;
    const typeBlockH = 34;
    const gapAfterType = 20;
    const gapBeforeMark = 26;

    const wh = 46;
    const wr = wh / _wordmark.naturalHeight;
    const ww = _wordmark.naturalWidth * wr;

    const blockH =
      typeBlockH + gapAfterType + lines.length * titleLineH + gapBeforeMark + wh;
    let y = (H - blockH) / 2;

    // Type + underline
    ctx.fillStyle = GOLD;
    ctx.font = "600 26px Inter, system-ui, sans-serif";
    ctx.fillText(typeLabel, colX, y);
    ctx.fillRect(colX, y + 30, Math.max(48, typeW), 2.5);
    y += typeBlockH + gapAfterType;

    // Title lines (italic)
    ctx.fillStyle = WHITE;
    ctx.font = "italic 800 50px Inter, system-ui, sans-serif";
    lines.forEach((line) => {
      ctx.fillText(line, colX, y);
      y += titleLineH;
    });

    // AceWithBoye wordmark
    y += gapBeforeMark;
    ctx.drawImage(_wordmark, colX, y, ww, wh);

    // Footer — bottom right corner
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.font = "500 17px Inter, system-ui, sans-serif";
    ctx.textBaseline = "bottom";
    const fw = ctx.measureText(footer).width;
    ctx.fillText(footer, W - fw - 40, H - 28);

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

  /**
   * @returns {Promise<{ blob: Blob, file: File, dataUrl: string, title: string, typeLabel: string }>}
   */
  async function buildMaterialCard(m, course) {
    const typeId = m.type || m.material_type || "shared";
    const typeLabel = TYPE_LABELS[typeId] || "Material";
    const code = (course && course.code) || m.course_code || "";
    const courseName = course && course.name ? course.name : "";
    const fileTitle = (m.title || m.fileName || "").trim();

    // Prefer course-style headline like the mockup; fall back to file title
    let title;
    if (code && courseName) title = code + " — " + courseName;
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
