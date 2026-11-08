/* KB'S BRAIN BANK — Supabase public client config.
   Anon/publishable key is safe in the front end; RLS protects data.
   NEVER put the service_role key here. */
window.EBB_SUPABASE = {
  url: "https://jcybycszuxlzkfjsmxjp.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeWJ5Y3N6dXhsemtmanNteGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MzcxMTksImV4cCI6MjEwNjExMzExOX0.2eigOFb-Zc1kkNZJ8vfTif2fdoHIEWc9SPmZ2FmIcY0",
};

/* File warehouse hybrid:
   - Existing library: GitHub materials/ (source=github)
   - New Admin / forms uploads: Cloudflare R2 (source=r2)
   Set r2PublicBase to the bucket public URL (same as Vercel R2_PUBLIC_BASE_URL). */
window.EBB_FILES = {
  githubRawBase: "https://raw.githubusercontent.com/Remmy1-AI/engineering-brain-bank/main/",
  /* Proxied reads via /api/r2-file?key=… (bucket can stay private) */
  r2PublicBase: "https://boye.study/api/r2-file",
};
