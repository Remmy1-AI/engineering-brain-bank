-- Public contribution inbox for forms.boye.study
-- Students may upload files under materials/inbox/* as unpublished rows.
-- Owner reviews/publishes from Admin (authenticated).

-- Allow common student file types on the materials bucket (images + pdf/office)
update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
where id = 'materials';

-- Anon may insert catalog rows only into the review inbox (never published)
drop policy if exists "anon_insert_inbox_materials" on public.materials;
create policy "anon_insert_inbox_materials"
  on public.materials for insert
  to anon
  with check (
    published = false
    and coalesce(source, 'storage') in ('storage', 'r2')
    and file_path like 'inbox/%'
  );

-- Anon may upload bytes only under inbox/
drop policy if exists "anon_upload_inbox_storage" on storage.objects;
create policy "anon_upload_inbox_storage"
  on storage.objects for insert
  to anon
  with check (
    bucket_id = 'materials'
    and name like 'inbox/%'
  );
