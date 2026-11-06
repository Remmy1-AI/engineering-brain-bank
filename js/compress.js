/* Client-side shrink for forms.boye.study uploads.
   Images → resized JPEG. Other types pass through with progress only. */
(function () {
  "use strict";

  const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;
  const MAX_EDGE = 1920;
  const JPEG_QUALITY = 0.72;
  const TARGET_IMAGE_BYTES = 1.5 * 1024 * 1024;

  function isImageFile(file) {
    if (!file) return false;
    if ((file.type || "").startsWith("image/")) return true;
    return IMAGE_EXT.test(file.name || "");
  }

  function formatBytes(n) {
    n = Number(n) || 0;
    if (n >= 1048576) return (n / 1048576).toFixed(1) + " MB";
    if (n >= 1024) return Math.max(1, Math.round(n / 1024)) + " KB";
    return n + " B";
  }

  function loadImageElement(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read image"));
      };
      img.src = url;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), type, quality);
    });
  }

  async function compressImage(file, onProgress) {
    onProgress && onProgress(0.15, "Shrinking image…");
    const img = await loadImageElement(file);
    let { width: w, height: h } = img;
    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);

    onProgress && onProgress(0.45, "Encoding…");
    let quality = JPEG_QUALITY;
    let blob = await canvasToBlob(canvas, "image/jpeg", quality);
    while (blob && blob.size > TARGET_IMAGE_BYTES && quality > 0.45) {
      quality -= 0.08;
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
    }
    if (!blob) throw new Error("Image compression failed");

    const base = String(file.name || "photo").replace(/\.[^.]+$/, "");
    const out = new File([blob], `${base}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
    onProgress && onProgress(0.7, "Ready to upload");
    return {
      file: out,
      originalBytes: file.size,
      compressedBytes: out.size,
      compressed: out.size < file.size * 0.95,
      note: `Image optimized ${formatBytes(file.size)} → ${formatBytes(out.size)}`,
    };
  }

  /**
   * @param {File} file
   * @param {(ratio:number, label:string)=>void} [onProgress]
   */
  async function prepareUploadFile(file, onProgress) {
    if (!file) throw new Error("No file");
    if (isImageFile(file) && file.size > 400 * 1024) {
      try {
        return await compressImage(file, onProgress);
      } catch (err) {
        console.warn("[compress]", err);
      }
    }
    onProgress && onProgress(0.2, "Preparing upload…");
    return {
      file,
      originalBytes: file.size,
      compressedBytes: file.size,
      compressed: false,
      note:
        file.size > 8 * 1024 * 1024
          ? `Large file (${formatBytes(file.size)}) — upload may take a bit on mobile data.`
          : `File size ${formatBytes(file.size)}`,
    };
  }

  window.EBBCompress = {
    prepareUploadFile,
    isImageFile,
    formatBytes,
  };
})();
