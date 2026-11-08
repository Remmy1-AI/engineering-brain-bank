-- Allow materials.source = 'r2' for Cloudflare R2 uploads.
-- Existing GitHub rows stay source=github. Safe to re-run.

alter table public.materials drop constraint if exists materials_source_check;

alter table public.materials
  add constraint materials_source_check
  check (source in ('storage', 'github', 'external', 'r2'));

comment on column public.materials.source is
  'storage = legacy Supabase Storage; github = repo materials/; external = external_url; r2 = Cloudflare R2';
