/* Engineering Brain Bank — Supabase public client config.
   Anon/publishable key is safe in the front end; RLS protects data.
   NEVER put the service_role key here. */
window.EBB_SUPABASE = {
  url: "https://jcybycszuxlzkfjsmxjp.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeWJ5Y3N6dXhsemtmanNteGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MzcxMTksImV4cCI6MjEwNjExMzExOX0.2eigOFb-Zc1kkNZJ8vfTif2fdoHIEWc9SPmZ2FmIcY0",
};

/* File warehouse: GitHub materials/ (hybrid). Catalog rows use source=github. */
window.EBB_FILES = {
  githubRawBase: "https://raw.githubusercontent.com/Remmy1-AI/engineering-brain-bank/main/",
};
