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

```bash
npx expo start --android
```

## Auth (mock → Supabase)

Without env, the app uses a **local stub**:

- Profile → Send code → enter **`123456`**, or tap **Stub sign-in (dev)**
- Guest: Browse + Open work; Download prompts sign-in
- Signed-in: Continue on Home, Download saves to Library

For live Supabase phone OTP, copy `.env.example` → `.env` and set:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

Enable Phone provider in the Supabase project. Do **not** put `service_role` in the app.

## Tabs

| Tab | Behavior |
| --- | --- |
| Home | Search, departments, recently added; **Continue** only when signed in |
| Browse | Department → level filter → course → materials by type |
| Library | Guest empty state; signed-in mock downloads shelf |
| Profile | Phone OTP UI (Supabase-ready) · by Korle Boye · ENGINEER WITH KB links |

## Catalog

`data/mockCatalog.ts` mirrors web shapes from `js/data.js` (departments, levels, materialTypes, courses, materials). Wire live Supabase catalog later without changing the static site.

## Brand

Near-black `#050505`, gold `#FFB800`, Syne + DM Sans, crest mark. Splash: **Brain Bank** centered, **by Korle Boye** at bottom center with space above.

## Out of scope (v1)

AI tutor, in-app student uploads, iOS App Store build, in-app QR scanner tab (owner QR → https://boye.study).
