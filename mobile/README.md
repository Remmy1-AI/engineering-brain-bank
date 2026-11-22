# Brain Bank (Expo · Android first)

Mobile MVP for **KB'S BRAIN BANK** under **ENGINEER WITH KB**. Guests browse and open materials; phone OTP unlocks downloads and Continue / Library.

Live web (unchanged): https://boye.study

## Run

```bash
cd mobile
npm install
npx expo start
```

Then press `a` for Android emulator, scan the QR with Expo Go on a device, or `w` for web preview.

Cloud Agents with `BOYE_SUPABASE_URL` + `BOYE_SUPABASE_ANON_KEY` inject automatically via `app.config.js` (no committed secrets).

## Auth (Supabase Phone + BulkClix SMS)

When URL + anon are configured, the app uses live `signInWithOtp` / `verifyOtp`.

SMS delivery is **server-side**: Supabase Send SMS Hook → `/api/supabase-sms-hook` → BulkClix, sender display name **Brain Bank**. See [`docs/bulkclix-otp.md`](./docs/bulkclix-otp.md).

Without env, local stub OTP **`123456`** still works for UI demos.

Never put `service_role` or BulkClix keys in the app binary.

## Catalog

`CatalogProvider` loads published materials from Supabase (anon RLS) and hydrates courses/departments like the web app. Falls back to `data/mockCatalog.ts` if unset or empty.

## Play Store

Package `study.boye.brainbank`. Prep notes: [`docs/play-store.md`](./docs/play-store.md).

## Tabs

| Tab | Behavior |
| --- | --- |
| Home | Search, courses, trending; **Continue** when signed in |
| Browse | Department → level filter → course → materials |
| Downloads | Guest empty; signed-in offline shelf |
| Profile | Phone OTP · by Korle Boye · ENGINEER WITH KB |

## Out of scope (v1)

AI tutor, in-app student uploads, iOS App Store build, in-app QR scanner tab.
