-- タイトル・タグ・検索

alter table public.entries
  add column if not exists title text;

update public.entries
set title = coalesce(
  nullif(trim(topic), ''),
  nullif(left(regexp_replace(body, E'\\s+', ' ', 'g'), 40), ''),
  '無題'
)
where title is null or title = '';

alter table public.entries
  alter column title set not null;

alter table public.entries
  drop constraint if exists entries_title_length;

alter table public.entries
  add constraint entries_title_length
  check (char_length(title) between 1 and 120);

alter table public.entries
  add column if not exists tags text[] not null default '{}';

update public.entries
set tags = array[trim(topic)]
where topic is not null
  and trim(topic) <> ''
  and (tags = '{}' or tags is null);

alter table public.entries
  drop constraint if exists entries_topic_length;

alter table public.entries
  drop column if exists topic;

create extension if not exists pg_trgm;

create index if not exists entries_title_trgm_idx
  on public.entries using gin (title gin_trgm_ops);

create index if not exists entries_body_trgm_idx
  on public.entries using gin (body gin_trgm_ops);

create index if not exists entries_tags_gin_idx
  on public.entries using gin (tags);

create or replace function public.search_my_entries(
  search_query text default null,
  tag_filter text default null
)
returns setof public.entries
language sql
stable
security invoker
set search_path = public
as $$
  select e.*
  from public.entries e
  where e.user_id = auth.uid()
    and (
      search_query is null
      or length(trim(search_query)) = 0
      or e.title ilike '%' || trim(search_query) || '%'
      or e.body ilike '%' || trim(search_query) || '%'
      or exists (
        select 1
        from unnest(e.tags) as tag_item
        where tag_item ilike '%' || trim(search_query) || '%'
      )
    )
    and (
      tag_filter is null
      or length(trim(tag_filter)) = 0
      or trim(tag_filter) = any (e.tags)
    )
  order by e.logged_on desc, e.created_at desc
  limit 500;
$$;

grant execute on function public.search_my_entries(text, text) to authenticated;
