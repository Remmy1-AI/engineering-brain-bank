/* Presign a Cloudflare R2 PUT for Admin (auth) or forms inbox (anon). */
import {
  buildObjectKey,
  corsPreflight,
  json,
  mintUploadTicket,
  r2Env,
  signPutUrl,
  objectUrl,
  verifySupabaseUser,
} from "../lib/r2.js";

export const config = { runtime: "edge" };

const MAX_BYTES = 50 * 1024 * 1024;

export default async function handler(req) {
  if (req.method === "OPTIONS") return corsPreflight();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const env = r2Env();
  if (!env.configured) {
    return json(
      {
        error:
          "R2 is not configured yet. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_BASE_URL in Vercel env.",
        code: "r2_not_configured",
      },
      503
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (_) {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const fileName = body?.fileName || body?.filename || "";
  const contentType = body?.contentType || body?.content_type || "application/octet-stream";
  const size = Number(body?.size || 0);
  const wantPrefix = String(body?.prefix || "").toLowerCase();

  if (!fileName) return json({ error: "fileName is required" }, 400);
  if (size > MAX_BYTES) {
    return json({ error: "File too large (max 50 MB)." }, 413);
  }

  const user = await verifySupabaseUser(req.headers.get("authorization"));
  let prefix = "inbox";
  if (user) {
    prefix = wantPrefix === "inbox" ? "inbox" : "uploads";
  } else if (wantPrefix && wantPrefix !== "inbox") {
    return json({ error: "Sign in required for non-inbox uploads." }, 401);
  }

  const key = buildObjectKey(prefix, fileName);
  try {
    const [uploadUrl, ticket] = await Promise.all([
      signPutUrl(key, contentType, 600),
      mintUploadTicket(key, 900),
    ]);
    return json({
      ok: true,
      key,
      ticket,
      /** @deprecated Prefer same-origin /api/r2-put with ticket (no bucket CORS). */
      uploadUrl,
      publicUrl: objectUrl(key),
      source: "r2",
      contentType,
      prefix,
      expiresIn: 900,
      proxy: true,
    });
  } catch (err) {
    console.error("[r2-presign]", err);
    return json({ error: err.message || "Could not create upload URL" }, 500);
  }
}
