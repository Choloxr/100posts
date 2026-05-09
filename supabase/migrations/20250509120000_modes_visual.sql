-- Modos visuales + memoria de marca (upgrade desde MVP inicial)

alter table public.brand_settings
  add column if not exists visual_profile jsonb not null default '{}'::jsonb;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'generation_runs' and column_name = 'template_keys'
  ) then
    alter table public.generation_runs rename column template_keys to mode_keys;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'generation_outputs' and column_name = 'template_key'
  ) then
    alter table public.generation_outputs rename column template_key to mode_key;
  end if;
end $$;
