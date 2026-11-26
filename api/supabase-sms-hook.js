/**
 * Supabase Auth → Send SMS Hook.
 * Receives the OTP Supabase generated and delivers it via BulkClix SMS
 * with approved sender display name "Brain Bank".
 *
 * Secrets (server / Vercel / Cloud Agent only — never in Expo):
 *   BOYE_BULKCLIX_API_KEY          required
 *   BOYE_BULKCLIX_SENDER_ID        optional UUID override
 *   BOYE_SUPABASE_AUTH_HOOK_SECRET optional override ("v1,whsec_<base64>"); otherwise the
 *                                  signing secret is derived from BOYE_BULKCLIX_API_KEY
 *
 * Every POST must carry a valid Supabase (Standard Webhooks) signature.
 * Dashboard: Authentication → Hooks → Send SMS → this HTTPS URL.
 * Mobile still calls supabase.auth.signInWithOtp / verifyOtp (anon key only).
 */
import { bulkclixEnv, sendBulkclixSms } from "../lib/bulkclix.js";
import { verifyHookRequest } from "../lib/sms-hook-auth.js";

export const config = { runtime: "edge" };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function extractPhoneAndOtp(payload) {
  // Supabase Send SMS Hook shapes vary slightly by version
  const phone =
    payload?.user?.phone ||
    payload?.sms?.phone ||
    payload?.phone ||
    payload?.record?.phone ||
    "";
  const otp =
    payload?.sms?.otp ||
    payload?.otp ||
    payload?.token ||
    payload?.record?.otp ||
    "";
  return { phone: String(phone || ""), otp: String(otp || "") };
}

export default async function handler(req) {
  if (req.method === "GET") {
    const env = bulkclixEnv();
    return json({
      ok: true,
      service: "supabase-sms-hook",
      sender: "Brain Bank",
      bulkclix: env.configured ? "configured" : "missing_api_key",
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const rawBody = await req.text();
  const verified = await verifyHookRequest(req.headers, rawBody);
  if (!verified.ok) {
    return json(
      { error: "Unauthorized" },
      verified.reason === "no_signing_secret" ? 503 : 401
    );
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (_) {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { phone, otp } = extractPhoneAndOtp(payload);
  if (!phone || !otp) {
    return json({ error: "phone and otp required" }, 400);
  }

  const message = `Your Brain Bank verification code is ${otp}. It expires soon. Do not share this code.`;
  const result = await sendBulkclixSms({ phone, message });

  if (!result.ok) {
    return json(
      {
        error: result.error || "SMS send failed",
        code: result.code || "send_failed",
      },
      result.code === "bulkclix_not_configured" ? 503 : 502
    );
  }

  // Supabase hooks expect 200 to treat SMS as delivered
  return json({ ok: true });
}
