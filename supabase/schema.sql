-- ============================================================
-- Engineering Brain Bank — Supabase schema (paste into SQL editor)
-- Backend: Auth + Postgres + Storage. Front end uses anon key only.
-- NEVER put the service_role key in client code or this repo.
-- ============================================================

-- Allowed upload MIME types (client + admin enforce; document here):
--   application/pdf
--   application/vnd.ms-powerpoint
--   application/vnd.openxmlformats-officedocument.presentationml.presentation
--   application/msword
--   application/vnd.openxmlformats-officedocument.wordprocessingml.document
--   text/plain
--   text/markdown
--   text/x-markdown
-- Extensions: .pdf .ppt .pptx .doc .docx .txt .md  (NO video)

create extension if not exists "pgcrypto";

-- ---------- materials ----------
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  course_code text,
  department text check (department in (
    'civil','electrical','mechanical','computer','chemical','industrial'
  )),
  level text,
  material_type text check (material_type in (
    'slides','notes','past-questions','shared'
  )),
  file_path text not null,
  file_name text not null,
  mime_type text,
  file_size bigint,
  download_count int not null default 0,
  share_count int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  uploaded_by uuid references auth.users(id) on delete set null
);

create index if not exists materials_published_idx on public.materials (published, created_at desc);
create index if not exists materials_course_code_idx on public.materials (course_code);
create index if not exists materials_department_idx on public.materials (department);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists materials_set_updated_at on public.materials;
create trigger materials_set_updated_at
  before update on public.materials
  for each row execute function public.set_updated_at();

-- ---------- page_views (all-time visit log; admin counts rows) ----------
create table if not exists public.page_views (
  id bigserial primary key,
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);

-- ---------- RLS ----------
alter table public.materials enable row level security;
alter table public.page_views enable row level security;

-- Anon can read published materials
drop policy if exists "anon_select_published_materials" on public.materials;
create policy "anon_select_published_materials"
  on public.materials for select
  to anon, authenticated
  using (published = true);

-- Authenticated owner: full CRUD (solo admin — any signed-in user)
drop policy if exists "auth_select_all_materials" on public.materials;
create policy "auth_select_all_materials"
  on public.materials for select
  to authenticated
  using (true);

drop policy if exists "auth_insert_materials" on public.materials;
create policy "auth_insert_materials"
  on public.materials for insert
  to authenticated
  with check (true);

drop policy if exists "auth_update_materials" on public.materials;
create policy "auth_update_materials"
  on public.materials for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "auth_delete_materials" on public.materials;
create policy "auth_delete_materials"
  on public.materials for delete
  to authenticated
  using (true);

-- Anon/auth may insert page views (prefer RPC below)
drop policy if exists "anon_insert_page_views" on public.page_views;
create policy "anon_insert_page_views"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

-- Authenticated can count / read page views for dashboard
drop policy if exists "auth_select_page_views" on public.page_views;
create policy "auth_select_page_views"
  on public.page_views for select
  to authenticated
  using (true);

-- ---------- RPCs (SECURITY DEFINER) ----------
create or replace function public.increment_download(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.materials
  set download_count = download_count + 1,
      updated_at = now()
  where id = p_id and published = true;
end;
$$;

create or replace function public.increment_share(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.materials
  set share_count = share_count + 1,
      updated_at = now()
  where id = p_id and published = true;
end;
$$;

create or replace function public.record_page_view(p_path text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.page_views (path)
  values (coalesce(nullif(trim(p_path), ''), '/'));
end;
$$;

grant execute on function public.increment_download(uuid) to anon, authenticated;
grant execute on function public.increment_share(uuid) to anon, authenticated;
grant execute on function public.record_page_view(text) to anon, authenticated;

-- Dashboard aggregates for authenticated owner
create or replace function public.admin_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  select json_build_object(
    'visits', (select count(*)::bigint from public.page_views),
    'downloads', (select coalesce(sum(download_count), 0)::bigint from public.materials),
    'shares', (select coalesce(sum(share_count), 0)::bigint from public.materials),
    'materials', (select count(*)::bigint from public.materials)
  ) into result;
  return result;
end;
$$;

grant execute on function public.admin_stats() to authenticated;

-- ---------- Storage bucket: materials ----------
-- Public read of objects is OK; RLS on materials table gates which rows appear in the library.
-- Public URL pattern:
--   {SUPABASE_URL}/storage/v1/object/public/materials/{file_path}
-- Or via JS: supabase.storage.from('materials').getPublicUrl(file_path)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'materials',
  'materials',
  true,
  52428800, -- 50 MB
  array[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/x-markdown'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read
drop policy if exists "public_read_materials_storage" on storage.objects;
create policy "public_read_materials_storage"
  on storage.objects for select
  to public
  using (bucket_id = 'materials');

-- Authenticated upload / update / delete under materials/
drop policy if exists "auth_upload_materials_storage" on storage.objects;
create policy "auth_upload_materials_storage"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'materials');

drop policy if exists "auth_update_materials_storage" on storage.objects;
create policy "auth_update_materials_storage"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'materials')
  with check (bucket_id = 'materials');

drop policy if exists "auth_delete_materials_storage" on storage.objects;
create policy "auth_delete_materials_storage"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'materials');
