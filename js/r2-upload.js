/* Client helper: upload to R2 with real byte progress.
   1) Try direct presigned PUT (best when bucket CORS is set)
   2) Fall back to same-origin /api/r2-put chunks (no CORS needed) */
(function () {
  "use strict";

  const PART_SIZE = 3 * 1024 * 1024;

  function formatBytes(n) {
    n = Number(n) || 0;
    if (n >= 1073741824) return (n / 1073741824).toFixed(2) + " GB";
    if (n >= 1048576) return (n / 1048576).toFixed(1) + " MB";
    if (n >= 1024) return Math.max(1, Math.round(n / 1024)) + " KB";
    return n + " B";
  }

  function progressLabel(loaded, total) {
    const pct = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
    return pct + "% · " + formatBytes(loaded) + " / " + formatBytes(total);
  }

  function emitProgress(onProgress, loaded, total, phase) {
    if (!onProgress) return;
    const ratio = total ? Math.min(0.95, loaded / total) : 0;
    onProgress(ratio, (phase ? phase + " · " : "") + progressLabel(loaded, total), {
      loaded,
      total,
      percent: total ? Math.round((loaded / total) * 100) : 0,
    });
  }

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

  function authHeaders(accessToken, extra) {
    const headers = Object.assign({}, extra || {});
    if (accessToken) headers.Authorization = "Bearer " + accessToken;
    return headers;
  }

  function xhrPut(url, body, contentType, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      if (contentType) xhr.setRequestHeader("Content-Type", contentType);
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        onProgress && onProgress(e.loaded, e.total);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error("R2 upload failed (" + xhr.status + ")"));
      };
      xhr.onerror = () => reject(new Error("Network error during R2 upload"));
      xhr.send(body);
    });
  }

  async function putDirect(signed, file, onProgress) {
    const contentType = signed.contentType || file.type || "application/octet-stream";
    if (!signed.uploadUrl) throw new Error("Missing upload URL");
    await xhrPut(signed.uploadUrl, file, contentType, (loaded, total) => {
      emitProgress(onProgress, loaded, total, "Uploading");
    });
  }

  async function putViaProxy(signed, file, accessToken, onProgress) {
    const contentType = signed.contentType || file.type || "application/octet-stream";
    const total = file.size || 0;
    const q =
      "key=" +
      encodeURIComponent(signed.key) +
      "&ticket=" +
      encodeURIComponent(signed.ticket || "") +
      "&contentType=" +
      encodeURIComponent(contentType);

    if (total <= PART_SIZE) {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/r2-put?" + q + "&action=put", true);
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.setRequestHeader("X-EBB-Content-Type", contentType);
        if (accessToken) xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          emitProgress(onProgress, e.loaded, e.total, "Uploading");
        };
        xhr.onload = () => {
          let data = {};
          try {
            data = JSON.parse(xhr.responseText || "{}");
          } catch (_) {}
          if (xhr.status >= 200 && xhr.status < 300) resolve(data);
          else reject(new Error(data.error || "Upload failed (" + xhr.status + ")"));
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });
      emitProgress(onProgress, total, total, "Uploaded");
      return;
    }

    onProgress && onProgress(0.05, "Starting upload…", { loaded: 0, total, percent: 0 });
    const initRes = await fetch("/api/r2-put?" + q + "&action=init", {
      method: "POST",
      headers: authHeaders(accessToken),
    });
    const initData = await initRes.json().catch(() => ({}));
    if (!initRes.ok) throw new Error(initData.error || "Could not start chunked upload");
    const uploadId = initData.uploadId;
    const totalParts = Math.ceil(total / PART_SIZE);
    let uploaded = 0;

    try {
      for (let i = 0; i < totalParts; i++) {
        const start = i * PART_SIZE;
        const end = Math.min(total, start + PART_SIZE);
        const blob = file.slice(start, end);
        const partNumber = i + 1;
        const partBytes = end - start;

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(
            "POST",
            "/api/r2-put?" +
              q +
              "&action=part&uploadId=" +
              encodeURIComponent(uploadId) +
              "&partNumber=" +
              partNumber,
            true
          );
          xhr.setRequestHeader("Content-Type", "application/octet-stream");
          if (accessToken) xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
          xhr.upload.onprogress = (e) => {
            if (!e.lengthComputable) return;
            emitProgress(onProgress, uploaded + e.loaded, total, "Uploading");
          };
          xhr.onload = () => {
            let data = {};
            try {
              data = JSON.parse(xhr.responseText || "{}");
            } catch (_) {}
            if (xhr.status >= 200 && xhr.status < 300) resolve(data);
            else reject(new Error(data.error || "Part " + partNumber + " failed"));
          };
          xhr.onerror = () => reject(new Error("Network error on part " + partNumber));
          xhr.send(blob);
        });

        uploaded += partBytes;
        emitProgress(onProgress, uploaded, total, "Uploading");
      }

      onProgress &&
        onProgress(0.96, "Finalizing on server… · " + formatBytes(total), {
          loaded: total,
          total,
          percent: 96,
        });
      const doneRes = await fetch(
        "/api/r2-put?" +
          q +
          "&action=complete&uploadId=" +
          encodeURIComponent(uploadId) +
          "&partCount=" +
          totalParts,
        {
          method: "POST",
          headers: authHeaders(accessToken, { "Content-Type": "application/json" }),
          body: JSON.stringify({ partCount: totalParts, contentType }),
        }
      );
      const doneData = await doneRes.json().catch(() => ({}));
      if (!doneRes.ok) throw new Error(doneData.error || "Could not finish upload");
      emitProgress(onProgress, total, total, "Uploaded");
    } catch (err) {
      try {
        await fetch(
          "/api/r2-put?" +
            q +
            "&action=abort&uploadId=" +
            encodeURIComponent(uploadId) +
            "&partCount=" +
            totalParts,
          { method: "POST", headers: authHeaders(accessToken) }
        );
      } catch (_) {}
      throw err;
    }
  }

  function looksLikeCorsFailure(err) {
    const msg = String(err && err.message ? err.message : err || "");
    return /network error|failed to fetch|cors|load failed/i.test(msg);
  }

  /**
   * @returns {{ key:string, publicUrl:string, source:'r2', contentType:string }}
   */
  async function uploadFile(file, opts) {
    if (!file) throw new Error("No file");
    const onProgress = opts && opts.onProgress;
    const accessToken = opts && opts.accessToken;
    onProgress && onProgress(0.02, "Requesting upload slot…", { loaded: 0, total: file.size, percent: 0 });
    const signed = await presign(file, opts || {});

    // Prefer direct R2 PUT when CORS allows (real byte progress, fastest).
    if (signed.uploadUrl) {
      try {
        await putDirect(signed, file, onProgress);
        onProgress && onProgress(0.98, "Saving details…", { loaded: file.size, total: file.size, percent: 98 });
        return {
          key: signed.key,
          publicUrl: signed.publicUrl,
          source: "r2",
          contentType: signed.contentType || file.type || "application/octet-stream",
        };
      } catch (err) {
        if (!signed.ticket || !looksLikeCorsFailure(err)) throw err;
        console.warn("[EBBR2] Direct R2 PUT blocked; using same-origin proxy", err);
      }
    }

    if (!signed.ticket) throw new Error("Upload slot missing ticket");
    await putViaProxy(signed, file, accessToken, onProgress);
    onProgress && onProgress(0.98, "Saving details…", { loaded: file.size, total: file.size, percent: 98 });
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

  window.EBBR2 = { uploadFile, deleteObject, presign, formatBytes };
})();
