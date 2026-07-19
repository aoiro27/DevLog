-- 調査完了テーマと日次ログの連携用
alter table public.entries
  add column if not exists source_theme_id uuid references public.themes (id) on delete set null;

create unique index if not exists entries_user_source_theme_uidx
  on public.entries (user_id, source_theme_id)
  where source_theme_id is not null;
