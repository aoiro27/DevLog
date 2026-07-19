-- DevLog: daily micro learning outputs
create extension if not exists "pgcrypto";

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  topic text,
  logged_on date not null default ((timezone('Asia/Tokyo', now()))::date),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entries_body_length check (char_length(body) between 1 and 1000),
  constraint entries_topic_length check (topic is null or char_length(topic) between 1 and 40)
);

create index entries_user_logged_on_idx
  on public.entries (user_id, logged_on desc, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger entries_set_updated_at
  before update on public.entries
  for each row
  execute function public.set_updated_at();

alter table public.entries enable row level security;

create policy "Users can read own entries"
  on public.entries
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.entries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.entries
  for delete
  to authenticated
  using (auth.uid() = user_id);
