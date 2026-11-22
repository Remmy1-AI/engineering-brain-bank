/**
 * Server-only BulkClix SMS helpers.
 * Reads BOYE_BULKCLIX_API_KEY from env. Never import this from the Expo client.
 * Display / approved sender name: "Brain Bank".
 */

const BULKCLIX_BASE = "https://api.bulkclix.com/api/v1";
const SENDER_DISPLAY_NAME = "Brain Bank";

let cachedSenderId = null;

export function bulkclixEnv() {
  const apiKey = (
    process.env.BOYE_BULKCLIX_API_KEY ||
    process.env.BULKCLIX_API_KEY ||
    ""
  ).trim();
  const senderId = (
    process.env.BOYE_BULKCLIX_SENDER_ID ||
    process.env.BULKCLIX_SENDER_ID ||
    ""
  ).trim();
  return {
    apiKey,
    senderId,
    senderName: SENDER_DISPLAY_NAME,
    configured: Boolean(apiKey),
  };
}

function headers(apiKey) {
  return {
    "x-api-key": apiKey,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

/** Normalize to local Ghana style when possible (BulkClix accepts 024… or 233…). */
export function normalizeBulkclixPhone(phone) {
  const raw = String(phone || "").replace(/\s+/g, "");
  if (!raw) return "";
  if (raw.startsWith("+233") && raw.length >= 13) return `0${raw.slice(4)}`;
  if (raw.startsWith("233") && raw.length >= 12) return `0${raw.slice(3)}`;
  if (raw.startsWith("+")) return raw.slice(1);
  return raw;
}

/**
 * Resolve approved sender UUID for display name "Brain Bank".
 * Prefers BOYE_BULKCLIX_SENDER_ID when set.
 */
export async function resolveBrainBankSenderId(apiKey, preferredId) {
  if (preferredId) return preferredId;
  if (cachedSenderId) return cachedSenderId;

  const res = await fetch(`${BULKCLIX_BASE}/sms-api/senderIds`, {
    method: "GET",
    headers: headers(apiKey),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`BulkClix senderIds failed (${res.status})${text ? "" : ""}`);
  }
  const body = await res.json();
  const list = Array.isArray(body?.data) ? body.data : [];
  const want = SENDER_DISPLAY_NAME.toLowerCase().replace(/\s+/g, "");
  const match = list.find((s) => {
    const name = String(s?.name || "")
      .toLowerCase()
      .replace(/\s+/g, "");
    const status = String(s?.status || "").toLowerCase();
    return name === want || name === "brainbank";
  });
  const approved =
    match && String(match.status || "").toLowerCase() === "approved"
      ? match
      : list.find((s) => {
          const name = String(s?.name || "")
            .toLowerCase()
            .replace(/\s+/g, "");
          return (
            (name === want || name === "brainbank") &&
            String(s?.status || "").toLowerCase() === "approved"
          );
        }) || match;

  if (!approved?.id) {
    throw new Error(
      `No BulkClix sender ID named "${SENDER_DISPLAY_NAME}". Set BOYE_BULKCLIX_SENDER_ID or approve that sender.`
    );
  }
  cachedSenderId = String(approved.id);
  return cachedSenderId;
}

/**
 * Send a plain SMS (used by Supabase Send SMS Hook — Supabase owns the OTP digits).
 * Does not log message body or API key.
 */
export async function sendBulkclixSms({ phone, message }) {
  const env = bulkclixEnv();
  if (!env.configured) {
    return { ok: false, error: "BOYE_BULKCLIX_API_KEY missing", code: "bulkclix_not_configured" };
  }
  const recipient = normalizeBulkclixPhone(phone);
  if (!recipient) {
    return { ok: false, error: "Phone required", code: "bad_phone" };
  }
  if (!message || !String(message).trim()) {
    return { ok: false, error: "Message required", code: "bad_message" };
  }

  let sender_id;
  try {
    sender_id = await resolveBrainBankSenderId(env.apiKey, env.senderId || null);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Sender resolve failed",
      code: "sender_resolve_failed",
    };
  }

  const res = await fetch(`${BULKCLIX_BASE}/sms-api/send`, {
    method: "POST",
    headers: headers(env.apiKey),
    body: JSON.stringify({
      sender_id,
      message: String(message),
      recipients: [recipient],
    }),
  });

  if (!res.ok) {
    // Do not echo provider body (may include account details)
    return { ok: false, error: `BulkClix send failed (${res.status})`, code: "send_failed", status: res.status };
  }

  const data = await res.json().catch(() => ({}));
  return {
    ok: true,
    campaignId: data?.data?.campaignId || null,
    senderName: SENDER_DISPLAY_NAME,
  };
}

/**
 * Optional BulkClix-native OTP (generates its own code). Prefer Supabase OTP + sendBulkclixSms
 * so Auth stays on Supabase Phone. Kept for ops/docs / future edge paths.
 */
export async function sendBulkclixOtp({ phone, length = 6, expiry = 5 }) {
  const env = bulkclixEnv();
  if (!env.configured) {
    return { ok: false, error: "BOYE_BULKCLIX_API_KEY missing", code: "bulkclix_not_configured" };
  }
  const phoneNumber = normalizeBulkclixPhone(phone);
  let senderId;
  try {
    senderId = await resolveBrainBankSenderId(env.apiKey, env.senderId || null);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Sender resolve failed",
      code: "sender_resolve_failed",
    };
  }

  const res = await fetch(`${BULKCLIX_BASE}/sms-api/otp/send`, {
    method: "POST",
    headers: headers(env.apiKey),
    body: JSON.stringify({
      phoneNumber,
      senderId,
      message: `Your Brain Bank code is <%otp_code%>. It expires in ${expiry} minutes.`,
      length,
      expiry,
    }),
  });
  if (!res.ok) {
    return { ok: false, error: `BulkClix OTP send failed (${res.status})`, code: "otp_send_failed", status: res.status };
  }
  const data = await res.json().catch(() => ({}));
  return {
    ok: true,
    requestId: data?.data?.otp?.requestId || null,
    // never return otp digits even if provider echoes them
  };
}
