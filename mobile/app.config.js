/**
 * Expo config — injects client-safe Supabase settings from env at build/start time.
 *
 * Prefers EXPO_PUBLIC_* (EAS / local .env). Falls back to BOYE_* Cloud Agent secrets
 * so agents can run without writing values into the repo.
 *
 * NEVER put service_role, access token, DB password, or Bulkclix keys here.
 */
const appJson = require('./app.json');

function readPublicSupabase() {
  const url = (
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.BOYE_SUPABASE_URL ||
    ''
  ).trim();
  const anonKey = (
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.BOYE_SUPABASE_ANON_KEY ||
    ''
  ).trim();
  return { url, anonKey };
}

module.exports = () => {
  const { url, anonKey } = readPublicSupabase();
  const base = appJson.expo;

  return {
    ...appJson,
    expo: {
      ...base,
      extra: {
        ...(base.extra || {}),
        supabaseUrl: url || '',
        supabaseAnonKey: anonKey || '',
        eas: {
          ...(base.extra && base.extra.eas ? base.extra.eas : {}),
          projectId: (base.extra && base.extra.eas && base.extra.eas.projectId) || undefined,
        },
      },
    },
  };
};
