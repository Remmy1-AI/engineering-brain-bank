/* Engineering Brain Bank — AceWithBoye share card (canvas)
   Custom layout: Boye hero ON TOP over engineering drawings,
   course/file details in a gold-ruled band below. */
(function () {
  "use strict";

  const W = 1200;
  const H = 630;
  const GOLD = "#FFB800";
  const WHITE = "#FFFFFF";
  const BG = "#050507";
  const HERO_H = 360;

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

  function titleLines(ctx, title, maxWidth) {
    const raw = String(title || "").trim();
    const split = raw.split(/\s*[—–-]\s*/);
    if (split.length >= 2 && split[0].length <= 18) {
      const first = split[0] + " —";
      const rest = split.slice(1).join(" — ");
      if (ctx.measureText(first + " " + rest).width <= maxWidth) {
        return [first + " " + rest];
      }
      const lines = [first];
      const words = rest.split(/\s+/);
      let cur = "";
      for (const word of words) {
        const test = cur ? cur + " " + word : word;
        if (ctx.measureText(test).width <= maxWidth) cur = test;
        else {
          if (cur) lines.push(cur);
          cur = word;
          if (lines.length >= 2) break;
        }
      }
      if (cur && lines.length < 2) lines.push(cur);
      return lines.slice(0, 2);
    }
    if (ctx.measureText(raw).width <= maxWidth) return [raw];
    const words = raw.split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = "";
    for (const word of words) {
      const test = cur ? cur + " " + word : word;
      if (ctx.measureText(test).width <= maxWidth) cur = test;
      else {
        if (cur) lines.push(cur);
        cur = word;
        if (lines.length >= 2) break;
      }
    }
    if (cur && lines.length < 2) lines.push(cur);
    return lines.length ? lines : [raw.slice(0, 40)];
  }

  function drawGoldGlow(ctx, cx, cy) {
    const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 320);
    g.addColorStop(0, "rgba(255,184,0,0.22)");
    g.addColorStop(0.45, "rgba(255,184,0,0.06)");
    g.addColorStop(1, "rgba(255,184,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, HERO_H + 40);
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

    // Engineering drawings across the hero zone
    if (_blueprint) {
      ctx.save();
      ctx.globalAlpha = 0.42;
      // mirror-tile across width
      const bpW = Math.ceil(W / 2);
      ctx.drawImage(_blueprint, 0, 0, bpW, HERO_H + 40);
      ctx.save();
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(_blueprint, 0, 0, bpW, HERO_H + 40);
      ctx.restore();
      ctx.restore();
    }

    drawGoldGlow(ctx, W / 2, HERO_H * 0.55);

    // Boye — large, centered on TOP, tucked into the gold rule
    const bw = 460;
    const bh = (_boye.naturalHeight / _boye.naturalWidth) * bw;
    const bx = (W - bw) / 2;
    const by = HERO_H - bh + 36;
    // soft ground shadow
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(W / 2, HERO_H + 6, bw * 0.38, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(_boye, bx, by, bw, bh);

    // AceWithBoye wordmark — top left
    const wh = 34;
    const wr = wh / _wordmark.naturalHeight;
    const ww = _wordmark.naturalWidth * wr;
    ctx.drawImage(_wordmark, 36, 22, ww, wh);

    // Bottom info band
    ctx.fillStyle = "rgba(8,8,10,0.98)";
    ctx.fillRect(0, HERO_H, W, H - HERO_H);
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, HERO_H, W, 4);

    // Corner bracket
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W - 34, HERO_H + 14);
    ctx.lineTo(W - 14, HERO_H + 14);
    ctx.lineTo(W - 14, HERO_H + 34);
    ctx.stroke();

    const typeLabel =
      opts.typeLabel ||
      TYPE_LABELS[opts.type] ||
      (opts.type ? String(opts.type) : "Material");
    const title = opts.title || "Engineering Brain Bank";
    const footer = opts.footer || "Engineering Brain Bank · KB4GESA";

    const pad = 44;
    let y = HERO_H + 22;

    ctx.textBaseline = "top";
    ctx.fillStyle = GOLD;
    ctx.font = "600 22px Inter, system-ui, sans-serif";
    ctx.fillText(typeLabel, pad, y);
    const typeW = ctx.measureText(typeLabel).width;
    ctx.fillRect(pad, y + 26, Math.max(40, typeW), 2);
    y += 40;

    ctx.fillStyle = WHITE;
    ctx.font = "italic 800 42px Inter, system-ui, sans-serif";
    const lines = titleLines(ctx, title, W - pad * 2 - 160);
    lines.forEach((line) => {
      ctx.fillText(line, pad, y);
      y += 48;
    });

    ctx.fillStyle = "rgba(180,180,180,0.95)";
    ctx.font = "500 15px Inter, system-ui, sans-serif";
    ctx.textBaseline = "bottom";
    const fw = ctx.measureText(footer).width;
    ctx.fillText(footer, W - fw - 36, H - 22);

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

  async function buildMaterialCard(m, course) {
    const typeId = m.type || m.material_type || "shared";
    const typeLabel = TYPE_LABELS[typeId] || "Material";
    const code = (course && course.code) || m.course_code || "";
    const courseName = course && course.name ? course.name : "";
    const fileTitle = (m.title || m.fileName || "").trim();

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
