-- Markdown 向けに本文上限を緩和
alter table public.entries
  drop constraint if exists entries_body_length;

alter table public.entries
  add constraint entries_body_length
  check (char_length(body) between 1 and 50000);

-- クリップボード画像用の Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'entry-images',
  'entry-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 自分のフォルダ（{user_id}/...）だけ操作可能
create policy "Users can upload own entry images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'entry-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own entry images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'entry-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'entry-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own entry images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'entry-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Public can read entry images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'entry-images');
