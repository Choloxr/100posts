-- 100posts MVP: phone store Instagram generator
-- Run in Supabase SQL Editor or via supabase db push

-- Profiles (mirror auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Brand (one row per user for MVP)
create table if not exists public.brand_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  store_name text not null,
  primary_color text not null default '#0f172a',
  secondary_color text not null default '#6366f1',
  tone text not null default 'modern'
    check (tone in ('modern', 'luxury', 'minimalist', 'bold', 'tech', 'playful')),
  visual_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brand_settings_user_id_idx on public.brand_settings (user_id);

alter table public.brand_settings enable row level security;

create policy "brand_select_own"
  on public.brand_settings for select
  using (auth.uid() = user_id);

create policy "brand_insert_own"
  on public.brand_settings for insert
  with check (auth.uid() = user_id);

create policy "brand_update_own"
  on public.brand_settings for update
  using (auth.uid() = user_id);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  price text not null,
  specs text,
  image_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists products_user_id_idx on public.products (user_id);

alter table public.products enable row level security;

create policy "products_select_own"
  on public.products for select
  using (auth.uid() = user_id);

create policy "products_insert_own"
  on public.products for insert
  with check (auth.uid() = user_id);

create policy "products_update_own"
  on public.products for update
  using (auth.uid() = user_id);

create policy "products_delete_own"
  on public.products for delete
  using (auth.uid() = user_id);

-- Generation runs
create table if not exists public.generation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'error')),
  error_message text,
  mode_keys text[] not null default array['apple_clean', 'minimal_tech', 'premium_black']::text[],
  created_at timestamptz not null default now()
);

create index if not exists generation_runs_user_id_idx on public.generation_runs (user_id);
create index if not exists generation_runs_product_id_idx on public.generation_runs (product_id);

alter table public.generation_runs enable row level security;

create policy "runs_select_own"
  on public.generation_runs for select
  using (auth.uid() = user_id);

create policy "runs_insert_own"
  on public.generation_runs for insert
  with check (auth.uid() = user_id);

create policy "runs_update_own"
  on public.generation_runs for update
  using (auth.uid() = user_id);

-- Outputs per variant
create table if not exists public.generation_outputs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.generation_runs (id) on delete cascade,
  variant_index int not null,
  mode_key text not null,
  caption text not null,
  cta text not null,
  cover_path text,
  carousel_paths jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (run_id, variant_index)
);

create index if not exists generation_outputs_run_id_idx on public.generation_outputs (run_id);

alter table public.generation_outputs enable row level security;

create policy "outputs_select_own"
  on public.generation_outputs for select
  using (
    exists (
      select 1 from public.generation_runs r
      where r.id = generation_outputs.run_id and r.user_id = auth.uid()
    )
  );

create policy "outputs_insert_own"
  on public.generation_outputs for insert
  with check (
    exists (
      select 1 from public.generation_runs r
      where r.id = generation_outputs.run_id and r.user_id = auth.uid()
    )
  );

create policy "outputs_update_own"
  on public.generation_outputs for update
  using (
    exists (
      select 1 from public.generation_runs r
      where r.id = generation_outputs.run_id and r.user_id = auth.uid()
    )
  );

-- New user -> profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage buckets (create in Dashboard if SQL not supported for buckets)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('generated-assets', 'generated-assets', false)
on conflict (id) do nothing;

-- Storage RLS policies
create policy "product_images_select_own"
  on storage.objects for select
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product_images_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product_images_update_own"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "generated_select_own"
  on storage.objects for select
  using (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "generated_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "generated_update_own"
  on storage.objects for update
  using (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "generated_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
