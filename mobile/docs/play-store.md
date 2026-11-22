# Brain Bank — Play Store path (prep)

**App name:** Brain Bank  
**Package:** `study.boye.brainbank`  
**Privacy policy:** https://boye.study (or dedicated privacy page when ready)

## Before first AAB

1. Expo / EAS project linked (`eas init` if needed); set `extra.eas.projectId` in `app.json` / `app.config.js`
2. EAS secrets (client-safe only):
   - `EXPO_PUBLIC_SUPABASE_URL` ← from `BOYE_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` ← from `BOYE_SUPABASE_ANON_KEY`
3. Do **not** put service role, DB password, access token, or BulkClix key in EAS public env
4. Android keystore via EAS credentials
5. Play Console: create app for `study.boye.brainbank` (new listing or existing draft)

## Listing pack

- App icon + adaptive icon (already under `assets/images/`)
- Feature graphic 1024×500
- Phone screenshots (use Project `media/bb2_*.png` as starters)
- Short + full description
- Content rating questionnaire
- Target audience / store presence countries

## Ship order

1. `eas build -p android --profile preview` → internal sideload smoke (OTP + catalog)
2. `eas build -p android --profile production` → AAB
3. `eas submit -p android --profile production` → Play **internal** track (draft)
4. Closed testing → production when OTP SMS (BulkClix) is verified on device

## OTP dependency

Live SMS requires BulkClix + Supabase Send SMS Hook (see `bulkclix-otp.md`). Catalog + anon auth wiring can ship to internal testing before SMS is green; mark “SMS pending” in release notes if needed.
