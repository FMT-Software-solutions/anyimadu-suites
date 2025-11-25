alter table public.suites add column if not exists gallery_urls text[] not null default '{}'::text[];

drop table if exists public.suite_images cascade;

alter table public.suites disable row level security;
