/* Stream / redirect an R2 object for Watch + Download (no public bucket required). */
import { json, r2Env, signGetUrl } from "../lib/r2.js";

export const config = { runtime: "edge" };

function allowedKey(key) {
  const k = String(key || "").replace(/^\/+/, "");
  if (!k || k.includes("..") || k.includes("\\")) return "";
  if (!(k.startsWith("uploads/") || k.startsWith("inbox/"))) return "";
  return k;
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Range",
      },
    });
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return json({ error: "Method not allowed" }, 405);
  }

  const env = r2Env();
  if (!env.configured) {
    return json({ error: "R2 is not configured", code: "r2_not_configured" }, 503);
  }

  const url = new URL(req.url);
  const key = allowedKey(url.searchParams.get("key") || "");
  if (!key) return json({ error: "Invalid or missing key" }, 400);

  const wantDownload = url.searchParams.get("download") === "1";
  const filename = wantDownload
    ? url.searchParams.get("name") || key.split("/").pop() || "download"
    : "";

  try {
    const signed = await signGetUrl(key, 3600, wantDownload ? { filename } : {});
    // 302 so browsers / video players hit R2 directly (Range friendly).
    // download=1 signs Content-Disposition: attachment so it lands in Downloads.
    return Response.redirect(signed, 302);
  } catch (err) {
    console.error("[r2-file]", err);
    return json({ error: err.message || "Could not fetch file" }, 500);
  }
}
