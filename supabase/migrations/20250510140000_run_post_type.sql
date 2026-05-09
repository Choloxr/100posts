-- Optional post type label for run detail UI (set on new generations from /products/new).
alter table public.generation_runs
  add column if not exists post_type text;
