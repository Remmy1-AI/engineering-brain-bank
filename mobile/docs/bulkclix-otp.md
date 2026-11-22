# Brain Bank — BulkClix SMS OTP (integration point)

**Sender / display name:** `Brain Bank`  
**Auth model:** Supabase Phone OTP (app) + BulkClix SMS delivery (server)

## Secrets (never in the Expo client or git)

| Name | Where | Role |
| --- | --- | --- |
| `BOYE_BULKCLIX_API_KEY` | Cloud Agents Secrets + Vercel | BulkClix `x-api-key` |
| `BOYE_BULKCLIX_SENDER_ID` | optional | Approved sender UUID (else resolve by name “Brain Bank”) |
| `BOYE_SUPABASE_AUTH_HOOK_SECRET` | optional / recommended | Shared secret for the Send SMS Hook |
| `BOYE_SUPABASE_URL` / `BOYE_SUPABASE_ANON_KEY` | Cloud Agents + EAS `EXPO_PUBLIC_*` | Client Supabase |
| `BOYE_SUPABASE_SERVICE_ROLE_KEY` | server only | Never ship in APK / Expo |

If a BulkClix key was ever pasted in chat, **rotate it** in the BulkClix dashboard and store only the new value in Cloud Agents Secrets / Vercel. Do not paste keys into chat, commits, or `.env` files that get committed.

## Flow

1. App (anon key): `supabase.auth.signInWithOtp({ phone })`
2. Supabase Auth generates the OTP and calls **Send SMS Hook** → `POST /api/supabase-sms-hook`
3. Hook reads `BOYE_BULKCLIX_API_KEY` and sends SMS via BulkClix `POST /sms-api/send` from sender **Brain Bank**
4. App: `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`

## Dashboard checklist

1. Supabase → Authentication → Providers → **Phone** enabled  
2. Supabase → Authentication → Hooks → **Send SMS** → URL `https://boye.study/api/supabase-sms-hook` (or preview URL while testing)  
3. BulkClix → approve sender ID named **Brain Bank** (or set `BOYE_BULKCLIX_SENDER_ID`)  
4. Vercel project env: same `BOYE_BULKCLIX_*` names (and hook secret if used)  
5. Cloud Agents Secrets: inject `BOYE_BULKCLIX_API_KEY` into agents that need to test the hook

## Out of scope for the mobile binary

- BulkClix API key  
- Service role key  
- DB password / access token  

The app only needs `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` (mapped from `BOYE_*` at build/start via `app.config.js`).
