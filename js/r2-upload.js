/* Client helper: presign → PUT to Cloudflare R2. */
(function () {
  "use strict";

  async function presign(file, { prefix, accessToken } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = "Bearer " + accessToken;
    const res = await fetch("/api/r2-presign", {
      method: "POST",
      headers,
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        prefix: prefix || "inbox",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || "Could not start R2 upload");
      err.code = data.code || res.status;
      throw err;
    }
    return data;
  }

  async function putFile(uploadUrl, file, contentType, onProgress) {
    onProgress && onProgress(0.55, "Uploading to R2…");
    // Prefer XHR for progress when available
    if (typeof XMLHttpRequest !== "undefined" && onProgress) {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", contentType || file.type || "application/octet-stream");
        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          const ratio = 0.55 + (e.loaded / e.total) * 0.35;
          onProgress(ratio, "Uploading to R2…");
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error("R2 upload failed (" + xhr.status + ")"));
        };
        xhr.onerror = () => reject(new Error("Network error during R2 upload"));
        xhr.send(file);
      });
      return;
    }
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": contentType || file.type || "application/octet-stream",
      },
    });
    if (!res.ok) throw new Error("R2 upload failed (" + res.status + ")");
  }

  /**
   * Upload a File to R2.
   * @returns {{ key:string, publicUrl:string, source:'r2', contentType:string }}
   */
  async function uploadFile(file, opts) {
    if (!file) throw new Error("No file");
    const onProgress = opts && opts.onProgress;
    onProgress && onProgress(0.35, "Requesting upload slot…");
    const signed = await presign(file, opts || {});
    await putFile(signed.uploadUrl, file, signed.contentType, onProgress);
    onProgress && onProgress(0.92, "Saving details…");
    return {
      key: signed.key,
      publicUrl: signed.publicUrl,
      source: "r2",
      contentType: signed.contentType || file.type || "application/octet-stream",
    };
  }

  async function deleteObject(key, accessToken) {
    if (!key) return;
    const headers = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = "Bearer " + accessToken;
    const res = await fetch("/api/r2-delete", {
      method: "POST",
      headers,
      body: JSON.stringify({ key }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "R2 delete failed");
    }
  }

  window.EBBR2 = { uploadFile, deleteObject, presign };
})();
