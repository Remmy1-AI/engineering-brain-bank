/* Client helper: same-origin R2 upload (server proxies to R2 — no bucket CORS). */
(function () {
  "use strict";

  /** Keep under Vercel request body limits. */
  const PART_SIZE = 3 * 1024 * 1024;

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

  async function putViaProxy(signed, file, accessToken, onProgress) {
    const contentType = signed.contentType || file.type || "application/octet-stream";
    const q =
      "key=" +
      encodeURIComponent(signed.key) +
      "&ticket=" +
      encodeURIComponent(signed.ticket || "") +
      "&contentType=" +
      encodeURIComponent(contentType);

    if (file.size <= PART_SIZE) {
      onProgress && onProgress(0.55, "Uploading…");
      const res = await fetch("/api/r2-put?" + q + "&action=put", {
        method: "POST",
        headers: authHeaders(accessToken, {
          "Content-Type": contentType,
          "X-EBB-Content-Type": contentType,
        }),
        body: file,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed (" + res.status + ")");
      onProgress && onProgress(0.9, "Uploaded");
      return;
    }

    onProgress && onProgress(0.4, "Starting upload…");
    const initRes = await fetch("/api/r2-put?" + q + "&action=init", {
      method: "POST",
      headers: authHeaders(accessToken),
    });
    const initData = await initRes.json().catch(() => ({}));
    if (!initRes.ok) throw new Error(initData.error || "Could not start chunked upload");
    const uploadId = initData.uploadId;
    const totalParts = Math.ceil(file.size / PART_SIZE);

    try {
      for (let i = 0; i < totalParts; i++) {
        const start = i * PART_SIZE;
        const end = Math.min(file.size, start + PART_SIZE);
        const blob = file.slice(start, end);
        const partNumber = i + 1;
        const partRes = await fetch(
          "/api/r2-put?" +
            q +
            "&action=part&uploadId=" +
            encodeURIComponent(uploadId) +
            "&partNumber=" +
            partNumber,
          {
            method: "POST",
            headers: authHeaders(accessToken, {
              "Content-Type": "application/octet-stream",
            }),
            body: blob,
          }
        );
        const partData = await partRes.json().catch(() => ({}));
        if (!partRes.ok) {
          throw new Error(partData.error || "Part " + partNumber + " failed");
        }
        const ratio = 0.4 + (partNumber / totalParts) * 0.45;
        onProgress && onProgress(ratio, "Uploading… " + partNumber + "/" + totalParts);
      }

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
      onProgress && onProgress(0.92, "Uploaded");
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

  /**
   * Upload a File to R2 via same-origin proxy.
   * @returns {{ key:string, publicUrl:string, source:'r2', contentType:string }}
   */
  async function uploadFile(file, opts) {
    if (!file) throw new Error("No file");
    const onProgress = opts && opts.onProgress;
    const accessToken = opts && opts.accessToken;
    onProgress && onProgress(0.35, "Requesting upload slot…");
    const signed = await presign(file, opts || {});
    if (!signed.ticket) {
      if (signed.uploadUrl) {
        await putDirect(signed.uploadUrl, file, signed.contentType, onProgress);
      } else {
        throw new Error("Upload slot missing ticket");
      }
    } else {
      await putViaProxy(signed, file, accessToken, onProgress);
    }
    onProgress && onProgress(0.92, "Saving details…");
    return {
      key: signed.key,
      publicUrl: signed.publicUrl,
      source: "r2",
      contentType: signed.contentType || file.type || "application/octet-stream",
    };
  }

  async function putDirect(uploadUrl, file, contentType, onProgress) {
    onProgress && onProgress(0.55, "Uploading to R2…");
    if (typeof XMLHttpRequest !== "undefined" && onProgress) {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", contentType || file.type || "application/octet-stream");
        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          onProgress(0.55 + (e.loaded / e.total) * 0.35, "Uploading to R2…");
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
      headers: { "Content-Type": contentType || file.type || "application/octet-stream" },
    });
    if (!res.ok) throw new Error("R2 upload failed (" + res.status + ")");
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
