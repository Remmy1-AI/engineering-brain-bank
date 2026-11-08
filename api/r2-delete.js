/* Delete an R2 object (Admin only). */
import {
  corsPreflight,
  deleteObject,
  json,
  r2Env,
  verifySupabaseUser,
} from "../lib/r2.js";

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method === "OPTIONS") return corsPreflight();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const env = r2Env();
  if (!env.configured) {
    return json({ error: "R2 is not configured", code: "r2_not_configured" }, 503);
  }

  const user = await verifySupabaseUser(req.headers.get("authorization"));
  if (!user) return json({ error: "Sign in required" }, 401);

  let body;
  try {
    body = await req.json();
  } catch (_) {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const key = String(body?.key || body?.file_path || "").replace(/^\/+/, "");
  if (!key || key.includes("..")) return json({ error: "Invalid key" }, 400);

  try {
    await deleteObject(key);
    return json({ ok: true, key });
  } catch (err) {
    console.error("[r2-delete]", err);
    return json({ error: err.message || "Delete failed" }, 500);
  }
}
