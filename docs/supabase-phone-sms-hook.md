# Supabase Phone + BulkClix Send SMS Hook

**Hook URL (production):** `https://boye.study/api/supabase-sms-hook`  
**Sender display name:** Brain Bank  
**Server env (Vercel):** `BOYE_BULKCLIX_API_KEY` (required), optional `BOYE_BULKCLIX_SENDER_ID`, optional `BOYE_SUPABASE_AUTH_HOOK_SECRET`

Never put BulkClix or service_role keys in the Expo app.

## Prefer API (already available)

With a Management API token that has `auth_config_write`, Phone + hook can be set via:

`PATCH /v1/projects/{ref}/config/auth`

```json
{
  "external_phone_enabled": true,
  "hook_send_sms_enabled": true,
  "hook_send_sms_uri": "https://boye.study/api/supabase-sms-hook"
}
```

Only enable the hook **after** `GET https://boye.study/api/supabase-sms-hook` returns **200** and Vercel has `BOYE_BULKCLIX_API_KEY`.

## Dashboard clicks (if API cannot write)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → select the **Boye** project  
2. **Authentication** → **Providers** → **Phone**  
   - Toggle **Enable Phone provider** → **On** → Save  
3. **Authentication** → **Hooks** (or **Auth Hooks**) → **Send SMS**  
   - Enable **Send SMS Hook**  
   - HTTPS endpoint: `https://boye.study/api/supabase-sms-hook`  
   - Generate / paste hook secret if prompted → also set the same value in Vercel as `BOYE_SUPABASE_AUTH_HOOK_SECRET` (or `SUPABASE_AUTH_HOOK_SECRET`)  
   - Save  
4. Confirm built-in Twilio fields can stay empty when the Send SMS Hook is enabled (hook replaces default SMS send)  
5. Vercel → Project → **Settings** → **Environment Variables** → add `BOYE_BULKCLIX_API_KEY` for **Production** (and Preview if testing PR previews) → Redeploy  

## Verify

```bash
curl -sS https://boye.study/api/supabase-sms-hook
# expect JSON with "bulkclix":"configured" once the Vercel env is set
```

Then on a real device: app `signInWithOtp` → SMS from **Brain Bank** → `verifyOtp`.

## Notes

- Vercel env var changes only apply to **new** deployments. After adding or rotating `BOYE_BULKCLIX_API_KEY`, redeploy Production (or merge any commit to `main`).
- Enable the hook with the Management API once the `GET` above reports `"bulkclix":"configured"`:
  `PATCH /v1/projects/{ref}/config/auth` with `hook_send_sms_enabled: true` and `hook_send_sms_uri`.
- Dry-run check without a real phone: `POST` the hook with an empty body and expect `400`; a `503` with `bulkclix_not_configured` means the env var has not reached the deployment.
