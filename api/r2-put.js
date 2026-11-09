/* Same-origin R2 upload proxy — browser never needs bucket CORS.
   Node runtime (60s) so large PDFs can finish assembling. */
import {
  abortStagedUpload,
  newUploadId,
  partStagingKey,
  putObject,
  r2Env,
  stitchParts,
  verifyUploadTicket,
  verifySupabaseUser,
} from "../lib/r2.js";

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

const MAX_PART = 3.5 * 1024 * 1024;

function allowKey(key, user) {
  const k = String(key || "").replace(/^\/+/, "");
  if (!k || k.includes("..")) return false;
  if (user) return k.startsWith("inbox/") || k.startsWith("uploads/");
  return k.startsWith("inbox/");
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-EBB-Key, X-EBB-Ticket, X-EBB-Content-Type"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function send(res, status, data) {
  setCors(res);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });

  const env = r2Env();
  if (!env.configured) {
    return send(res, 503, { error: "R2 is not configured", code: "r2_not_configured" });
  }

  const url = new URL(req.url || "/", "http://localhost");
  const action = String(url.searchParams.get("action") || "put").toLowerCase();
  const key = String(url.searchParams.get("key") || req.headers["x-ebb-key"] || "").replace(
    /^\/+/,
    ""
  );
  const ticket = String(url.searchParams.get("ticket") || req.headers["x-ebb-ticket"] || "");
  const contentType =
    url.searchParams.get("contentType") ||
    req.headers["x-ebb-content-type"] ||
    "application/octet-stream";

  const user = await verifySupabaseUser(req.headers.authorization || "");
  if (!allowKey(key, user)) return send(res, 403, { error: "Invalid key" });
  if (!(await verifyUploadTicket(ticket, key))) {
    return send(res, 403, { error: "Upload ticket expired or invalid. Request a new slot." });
  }

  try {
    if (action === "init") {
      return send(res, 200, { ok: true, key, uploadId: newUploadId() });
    }

    if (action === "part") {
      const uploadId = String(url.searchParams.get("uploadId") || "");
      const partNumber = Number(url.searchParams.get("partNumber") || 0);
      if (!uploadId || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 64) {
        return send(res, 400, { error: "uploadId and partNumber required" });
      }
      const body = await readBody(req);
      if (!body.byteLength) return send(res, 400, { error: "Empty part" });
      if (body.byteLength > MAX_PART) return send(res, 413, { error: "Part too large" });
      await putObject(partStagingKey(key, uploadId, partNumber), body, "application/octet-stream");
      return send(res, 200, { ok: true, partNumber, bytes: body.byteLength });
    }

    if (action === "complete") {
      const uploadId = String(url.searchParams.get("uploadId") || "");
      let partCount = Number(url.searchParams.get("partCount") || 0);
      let ct = contentType;
      const raw = await readBody(req);
      if (raw.byteLength) {
        try {
          const body = JSON.parse(raw.toString("utf8"));
          if (body?.partCount) partCount = Number(body.partCount);
          if (body?.contentType) ct = String(body.contentType);
        } catch (_) {}
      }
      if (!uploadId || !Number.isInteger(partCount) || partCount < 1 || partCount > 64) {
        return send(res, 400, { error: "uploadId and partCount required" });
      }
      await stitchParts(key, uploadId, partCount, ct);
      return send(res, 200, { ok: true, key });
    }

    if (action === "abort") {
      const uploadId = String(url.searchParams.get("uploadId") || "");
      const partCount = Number(url.searchParams.get("partCount") || 32);
      if (uploadId) await abortStagedUpload(key, uploadId, partCount);
      return send(res, 200, { ok: true });
    }

    const body = await readBody(req);
    if (!body.byteLength) return send(res, 400, { error: "Empty body" });
    if (body.byteLength > MAX_PART) {
      return send(res, 413, {
        error: "File too large for single put — use multipart",
        code: "use_multipart",
      });
    }
    const ct =
      url.searchParams.get("contentType") ||
      req.headers["x-ebb-content-type"] ||
      (String(req.headers["content-type"] || "").startsWith("multipart/")
        ? "application/octet-stream"
        : req.headers["content-type"]) ||
      "application/octet-stream";
    await putObject(key, body, ct);
    return send(res, 200, { ok: true, key, bytes: body.byteLength });
  } catch (err) {
    console.error("[r2-put]", err);
    return send(res, 500, { error: err.message || "Upload failed" });
  }
}
