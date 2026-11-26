/**
 * Verify Supabase Auth hook requests (Standard Webhooks, HMAC-SHA256).
 *
 * Signing secret, in order:
 *   1. BOYE_SUPABASE_AUTH_HOOK_SECRET / SUPABASE_AUTH_HOOK_SECRET ("v1,whsec_<base64>")
 *   2. Derived from BOYE_BULKCLIX_API_KEY, so no extra Vercel env var is required.
 *      Supabase must hold the matching "v1,whsec_<base64>" value (see deriveHookSecret).
 *
 * Fails closed: no signing secret means every POST is rejected.
 */

const TOLERANCE_SECONDS = 5 * 60;
const DERIVE_PREFIX = "brainbank-sms-hook:v1:";

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64(bytes) {
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

/** SHA-256(prefix + apiKey) as the raw signing key. */
export async function deriveSigningKeyBytes(apiKey) {
  const data = new TextEncoder().encode(DERIVE_PREFIX + apiKey);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
}

/** "v1,whsec_<base64>" string to store in Supabase hook_send_sms_secrets. */
export async function deriveHookSecret(apiKey) {
  return `v1,whsec_${bytesToB64(await deriveSigningKeyBytes(apiKey))}`;
}

async function resolveSigningKeyBytes() {
  const explicit = (
    process.env.BOYE_SUPABASE_AUTH_HOOK_SECRET ||
    process.env.SUPABASE_AUTH_HOOK_SECRET ||
    ""
  ).trim();
  if (explicit) {
    const raw = explicit.replace(/^v1,/, "").replace(/^whsec_/, "");
    try {
      return b64ToBytes(raw);
    } catch (_) {
      return null;
    }
  }
  const apiKey = (
    process.env.BOYE_BULKCLIX_API_KEY ||
    process.env.BULKCLIX_API_KEY ||
    ""
  ).trim();
  if (!apiKey) return null;
  return deriveSigningKeyBytes(apiKey);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * @returns {Promise<{ok: true} | {ok: false, reason: string}>}
 */
export async function verifyHookRequest(headers, rawBody) {
  const keyBytes = await resolveSigningKeyBytes();
  if (!keyBytes) return { ok: false, reason: "no_signing_secret" };

  const id = headers.get("webhook-id") || "";
  const timestamp = headers.get("webhook-timestamp") || "";
  const signatureHeader = headers.get("webhook-signature") || "";
  if (!id || !timestamp || !signatureHeader) {
    return { ok: false, reason: "missing_signature_headers" };
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "bad_timestamp" };
  const age = Math.abs(Math.floor(Date.now() / 1000) - ts);
  if (age > TOLERANCE_SECONDS) return { ok: false, reason: "stale_timestamp" };

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${id}.${timestamp}.${rawBody}`)
  );
  const expected = bytesToB64(new Uint8Array(signed));

  const candidates = signatureHeader
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("v1,"))
    .map((part) => part.slice(3));
  const ok = candidates.some((sig) => timingSafeEqual(sig, expected));
  return ok ? { ok: true } : { ok: false, reason: "bad_signature" };
}
