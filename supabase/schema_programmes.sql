-- Programmes (departments) editable from Owner Admin.
-- Safe to re-run. Public can read; only authenticated owner can write.

create table if not exists public.programmes (
  id text primary key,
  name text not null,
  short_name text,
  code text,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists programmes_sort_idx
  on public.programmes (sort_order, name);

do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'set_updated_at'
  ) then
    drop trigger if exists programmes_set_updated_at on public.programmes;
    create trigger programmes_set_updated_at
      before update on public.programmes
      for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.programmes enable row level security;

drop policy if exists "anon_select_programmes" on public.programmes;
create policy "anon_select_programmes"
  on public.programmes for select
  to anon, authenticated
  using (true);

drop policy if exists "auth_insert_programmes" on public.programmes;
create policy "auth_insert_programmes"
  on public.programmes for insert
  to authenticated
  with check (true);

drop policy if exists "auth_update_programmes" on public.programmes;
create policy "auth_update_programmes"
  on public.programmes for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "auth_delete_programmes" on public.programmes;
create policy "auth_delete_programmes"
  on public.programmes for delete
  to authenticated
  using (true);

-- Materials.department must accept any programme id (no fixed enum)
alter table public.materials drop constraint if exists materials_department_check;

-- Seed built-in programmes (including Materials Engineering)
insert into public.programmes (id, name, short_name, code, sort_order) values
  ('civil', 'Civil Engineering', 'Civil', 'CE', 10),
  ('electrical', 'Electrical Engineering', 'Electrical', 'EE', 20),
  ('mechanical', 'Mechanical Engineering', 'Mechanical', 'ME', 30),
  ('computer', 'Computer Engineering', 'Computer', 'COE', 40),
  ('chemical', 'Chemical Engineering', 'Chemical', 'CHE', 50),
  ('industrial', 'Industrial Engineering', 'Industrial', 'IE', 60),
  ('materials', 'Materials Engineering', 'Materials', 'METE', 70),
  ('agricultural', 'Agricultural Engineering', 'Agricultural', 'AE', 80),
  ('general', 'General / Shared', 'General', 'GEN', 90)
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  code = excluded.code,
  sort_order = excluded.sort_order;

comment on table public.programmes is
  'Engineering programmes / departments. Owner adds new ones from Admin.';
