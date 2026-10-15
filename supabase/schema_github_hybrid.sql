-- ============================================================
-- Engineering Brain Bank — GitHub hybrid materials catalog
-- Files live in GitHub materials/; Supabase stores metadata + URLs.
-- Apply via SQL editor or Management API. Safe to re-run.
-- ============================================================

-- Drop tight checks so AE/ME/MATH/extras + videos/tutorials can land
alter table public.materials drop constraint if exists materials_department_check;
alter table public.materials drop constraint if exists materials_material_type_check;

alter table public.materials
  add column if not exists source text not null default 'storage';

alter table public.materials
  add column if not exists external_url text;

alter table public.materials
  add column if not exists download_url text;

-- Prefer github | storage | external
update public.materials
set source = coalesce(nullif(source, ''), 'storage')
where source is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'materials_source_check'
  ) then
    alter table public.materials
      add constraint materials_source_check
      check (source in ('storage', 'github', 'external'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'materials_material_type_check'
  ) then
    alter table public.materials
      add constraint materials_material_type_check
      check (material_type is null or material_type in (
        'slides','notes','past-questions','shared','tutorials','videos'
      ));
  end if;
end $$;

create unique index if not exists materials_file_path_uidx
  on public.materials (file_path);

create index if not exists materials_source_idx
  on public.materials (source);

create index if not exists materials_type_idx
  on public.materials (material_type);

comment on column public.materials.source is
  'storage = Supabase Storage object; github = repo materials/ path; external = external_url';
comment on column public.materials.file_path is
  'Storage object key OR repo-relative path (e.g. materials/year-1/.../file.pdf)';
comment on column public.materials.external_url is
  'Optional absolute URL override (Drive, CDN, etc.)';
