/* Shared Cloudflare R2 (S3-compatible) helpers for Vercel API routes. */
import { AwsClient } from "aws4fetch";

export function r2Env() {
  const accountId = process.env.R2_ACCOUNT_ID || "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
  const bucket = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || "";
  const publicBase = String(
    process.env.R2_PUBLIC_BASE_URL || process.env.R2_PUBLIC_URL || ""
  ).replace(/\/$/, "");
  const configured = !!(accountId && accessKeyId && secretAccessKey && bucket && publicBase);
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBase, configured };
}

export function r2Client() {
  const env = r2Env();
  if (!env.configured) return null;
  return {
    env,
    aws: new AwsClient({
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
      service: "s3",
      region: "auto",
    }),
  };
}

export function objectUrl(key) {
  const { publicBase } = r2Env();
  const k = String(key || "").replace(/^\/+/, "");
  if (!publicBase || !k) return "";
  return `${publicBase}/${k.split("/").map(encodeURIComponent).join("/")}`;
}

export function endpointForKey(key) {
  const { accountId, bucket } = r2Env();
  const k = String(key || "").replace(/^\/+/, "");
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${k
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export async function signPutUrl(key, contentType, expiresSec = 600) {
  const client = r2Client();
  if (!client) throw new Error("R2 is not configured");
  const url = new URL(endpointForKey(key));
  url.searchParams.set("X-Amz-Expires", String(expiresSec));
  const signed = await client.aws.sign(
    new Request(url.toString(), {
      method: "PUT",
      headers: contentType ? { "Content-Type": contentType } : {},
    }),
    { aws: { signQuery: true } }
  );
  return signed.url;
}

export async function deleteObject(key) {
  const client = r2Client();
  if (!client) throw new Error("R2 is not configured");
  const res = await client.aws.fetch(endpointForKey(key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => "");
    throw new Error(`R2 delete failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

export function corsPreflight() {
  return json({ ok: true }, 204);
}

/** Verify Supabase access token via Auth API (no JWT secret needed). */
export async function verifySupabaseUser(authHeader) {
  const token = String(authHeader || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  // Anon key is already public in the front end; env override still preferred.
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://jcybycszuxlzkfjsmxjp.supabase.co";
  const anon =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeWJ5Y3N6dXhsemtmanNteGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MzcxMTksImV4cCI6MjEwNjExMzExOX0.2eigOFb-Zc1kkNZJ8vfTif2fdoHIEWc9SPmZ2FmIcY0";
  if (!url || !anon) return null;
  const res = await fetch(`${String(url).replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anon,
    },
  });
  if (!res.ok) return null;
  const user = await res.json().catch(() => null);
  return user && user.id ? user : null;
}

export function safeFileName(name) {
  return String(name || "file")
    .replace(/[^\w.\-()+ ]+/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180) || "file";
}

export function buildObjectKey(prefix, fileName) {
  const safe = safeFileName(fileName);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const base = String(prefix || "uploads").replace(/^\/+|\/+$/g, "") || "uploads";
  return `${base}/${id}-${safe}`;
}
