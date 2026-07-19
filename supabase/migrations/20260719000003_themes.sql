-- 調査テーマとツリー状の調査メモ

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  summary text not null default '',
  status text not null default 'open'
    check (status in ('open', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint themes_title_length check (char_length(title) between 1 and 120),
  constraint themes_summary_length check (char_length(summary) <= 2000)
);

create index themes_user_updated_idx
  on public.themes (user_id, updated_at desc);

create trigger themes_set_updated_at
  before update on public.themes
  for each row
  execute function public.set_updated_at();

create table public.theme_nodes (
  id uuid primary key default gen_random_uuid(),
  theme_id uuid not null references public.themes (id) on delete cascade,
  parent_id uuid references public.theme_nodes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint theme_nodes_title_length check (char_length(title) between 1 and 120),
  constraint theme_nodes_body_length check (char_length(body) <= 50000)
);

create index theme_nodes_theme_parent_idx
  on public.theme_nodes (theme_id, parent_id, sort_order, created_at);

create trigger theme_nodes_set_updated_at
  before update on public.theme_nodes
  for each row
  execute function public.set_updated_at();

-- 親ノードは同じテーマに属すること
create or replace function public.theme_nodes_same_theme()
returns trigger
language plpgsql
as $$
declare
  parent_theme uuid;
begin
  if new.parent_id is null then
    return new;
  end if;

  select theme_id into parent_theme
  from public.theme_nodes
  where id = new.parent_id;

  if parent_theme is null then
    raise exception 'parent node not found';
  end if;

  if parent_theme <> new.theme_id then
    raise exception 'parent node must belong to the same theme';
  end if;

  return new;
end;
$$;

create trigger theme_nodes_check_parent_theme
  before insert or update on public.theme_nodes
  for each row
  execute function public.theme_nodes_same_theme();

-- テーマ更新時刻をノード変更時も進める
create or replace function public.touch_theme_on_node_change()
returns trigger
language plpgsql
as $$
begin
  update public.themes
  set updated_at = now()
  where id = coalesce(new.theme_id, old.theme_id);
  return coalesce(new, old);
end;
$$;

create trigger theme_nodes_touch_theme
  after insert or update or delete on public.theme_nodes
  for each row
  execute function public.touch_theme_on_node_change();

alter table public.themes enable row level security;
alter table public.theme_nodes enable row level security;

create policy "Users manage own themes"
  on public.themes
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own theme nodes"
  on public.theme_nodes
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
