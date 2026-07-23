-- ============================================================================
-- Msimanga Family Archive — initial schema
-- People, profiles/roles, Row Level Security, media storage.
-- Apply by pasting into the Supabase dashboard → SQL Editor → Run.
-- Safe to re-run (idempotent).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('viewer', 'contributor', 'editor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.gender as enum ('male', 'female', 'unknown');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user, carrying their role
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role         public.user_role not null default 'viewer',
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- people — every individual in the family archive
-- Dates are free text on purpose, to hold uncertain/partial historical dates
-- (e.g. "26 Apr 1859", "c. 1900", "n/a").
-- ---------------------------------------------------------------------------
create table if not exists public.people (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  full_name         text not null,
  gender            public.gender not null default 'unknown',
  honorific         text,                       -- e.g. "eldest son", "last-born"
  house             text,                       -- founding branch / house label

  father_id         uuid references public.people(id) on delete set null,
  mother_id         uuid references public.people(id) on delete set null,
  father_name       text,                       -- fallback when not a linked person
  mother_name       text,
  spouse            text,                       -- marriage / spouse summary (free text)
  spouse_id         uuid references public.people(id) on delete set null,
  married_in        boolean not null default false, -- joined the clan by marriage

  birth_date        text, birth_place        text,
  death_date        text, death_place        text,
  burial_date       text, burial_place       text,
  marriage_date     text, marriage_place     text,

  bio               text,
  image_path        text,                       -- object path in the 'media' bucket
  is_living         boolean not null default false,
  sort_order        int,                        -- ordering among siblings

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references auth.users(id) on delete set null,
  updated_by        uuid references auth.users(id) on delete set null
);

create index if not exists people_father_id_idx on public.people (father_id);
create index if not exists people_mother_id_idx on public.people (mother_id);
create index if not exists people_spouse_id_idx on public.people (spouse_id);
create index if not exists people_house_idx     on public.people (house);
create index if not exists people_full_name_idx on public.people (full_name);

-- ---------------------------------------------------------------------------
-- Helpers & triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists people_set_updated_at on public.people;
create trigger people_set_updated_at
  before update on public.people
  for each row execute function public.set_updated_at();

-- Role lookups (security definer so RLS on profiles doesn't recurse)
create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_editor()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('editor', 'admin'), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

-- Auto-create a profile whenever a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.people   enable row level security;
alter table public.profiles enable row level security;

-- people: anyone may read; only editors/admins may write; only admins delete
drop policy if exists people_read   on public.people;
drop policy if exists people_insert on public.people;
drop policy if exists people_update on public.people;
drop policy if exists people_delete on public.people;

create policy people_read   on public.people for select using (true);
create policy people_insert on public.people for insert with check (public.is_editor());
create policy people_update on public.people for update using (public.is_editor()) with check (public.is_editor());
create policy people_delete on public.people for delete using (public.is_admin());

-- profiles: a user reads their own; admins read all & manage roles
drop policy if exists profiles_read   on public.profiles;
drop policy if exists profiles_update on public.profiles;

create policy profiles_read   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Media storage bucket (public read, editor write)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_read   on storage.objects;
drop policy if exists media_insert on storage.objects;
drop policy if exists media_update on storage.objects;
drop policy if exists media_delete on storage.objects;

create policy media_read   on storage.objects for select using (bucket_id = 'media');
create policy media_insert on storage.objects for insert with check (bucket_id = 'media' and public.is_editor());
create policy media_update on storage.objects for update using (bucket_id = 'media' and public.is_editor());
create policy media_delete on storage.objects for delete using (bucket_id = 'media' and public.is_admin());
