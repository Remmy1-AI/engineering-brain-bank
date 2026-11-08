/* Same-origin R2 upload proxy — browser never talks to R2 (no bucket CORS needed).
   Large files are chunked (<3.5 MB/request) then stitched server-side. */
import {
  abortStagedUpload,
  corsPreflight,
  json,
  newUploadId,
  partStagingKey,
  putObject,
  r2Env,
  stitchParts,
  verifyUploadTicket,
  verifySupabaseUser,
} from "../lib/r2.js";

export const config = { runtime: "edge" };

const MAX_PART = 3.5 * 1024 * 1024;

function allowKey(key, user) {
  const k = String(key || "").replace(/^\/+/, "");
  if (!k || k.includes("..")) return false;
  if (user) return k.startsWith("inbox/") || k.startsWith("uploads/");
  return k.startsWith("inbox/");
}

export default async function handler(req) {
  if (req.method === "OPTIONS") return corsPreflight();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const env = r2Env();
  if (!env.configured) {
    return json({ error: "R2 is not configured", code: "r2_not_configured" }, 503);
  }

  const url = new URL(req.url);
  const action = String(url.searchParams.get("action") || "put").toLowerCase();
  const key = String(url.searchParams.get("key") || req.headers.get("x-ebb-key") || "").replace(
    /^\/+/,
    ""
  );
  const ticket = String(
    url.searchParams.get("ticket") || req.headers.get("x-ebb-ticket") || ""
  );
  const contentType =
    url.searchParams.get("contentType") ||
    req.headers.get("x-ebb-content-type") ||
    "application/octet-stream";

  const user = await verifySupabaseUser(req.headers.get("authorization"));
  if (!allowKey(key, user)) return json({ error: "Invalid key" }, 403);
  if (!(await verifyUploadTicket(ticket, key))) {
    return json({ error: "Upload ticket expired or invalid. Request a new slot." }, 403);
  }

  try {
    if (action === "init") {
      return json({ ok: true, key, uploadId: newUploadId() });
    }

    if (action === "part") {
      const uploadId = String(url.searchParams.get("uploadId") || "");
      const partNumber = Number(url.searchParams.get("partNumber") || 0);
      if (!uploadId || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 64) {
        return json({ error: "uploadId and partNumber required" }, 400);
      }
      const body = await req.arrayBuffer();
      if (!body.byteLength) return json({ error: "Empty part" }, 400);
      if (body.byteLength > MAX_PART) return json({ error: "Part too large" }, 413);
      await putObject(partStagingKey(key, uploadId, partNumber), body, "application/octet-stream");
      return json({ ok: true, partNumber });
    }

    if (action === "complete") {
      const uploadId = String(url.searchParams.get("uploadId") || "");
      let partCount = Number(url.searchParams.get("partCount") || 0);
      let ct = contentType;
      try {
        const body = await req.json();
        if (body?.partCount) partCount = Number(body.partCount);
        if (body?.contentType) ct = String(body.contentType);
      } catch (_) {
        /* query params only */
      }
      if (!uploadId || !Number.isInteger(partCount) || partCount < 1 || partCount > 64) {
        return json({ error: "uploadId and partCount required" }, 400);
      }
      await stitchParts(key, uploadId, partCount, ct);
      return json({ ok: true, key });
    }

    if (action === "abort") {
      const uploadId = String(url.searchParams.get("uploadId") || "");
      const partCount = Number(url.searchParams.get("partCount") || 32);
      if (uploadId) await abortStagedUpload(key, uploadId, partCount);
      return json({ ok: true });
    }

    // Default: single-shot put (small files)
    const body = await req.arrayBuffer();
    if (!body.byteLength) return json({ error: "Empty body" }, 400);
    if (body.byteLength > MAX_PART) {
      return json(
        { error: "File too large for single put — use multipart", code: "use_multipart" },
        413
      );
    }
    // Prefer explicit content type over multipart form defaults
    const ct =
      url.searchParams.get("contentType") ||
      req.headers.get("x-ebb-content-type") ||
      (req.headers.get("content-type")?.startsWith("multipart/")
        ? "application/octet-stream"
        : req.headers.get("content-type")) ||
      "application/octet-stream";
    await putObject(key, body, ct);
    return json({ ok: true, key });
  } catch (err) {
    console.error("[r2-put]", err);
    return json({ error: err.message || "Upload failed" }, 500);
  }
}
