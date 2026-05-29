-- My Dearest Diary — esquema inicial
-- Ejecutar en Supabase SQL Editor (proyecto vacío o sin estas tablas).

-- -----------------------------------------------------------------------------
-- Tablas
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_emoji text not null default '🌸',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mood text not null,
  mood_label text,
  content text not null,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index diary_entries_user_id_idx on public.diary_entries (user_id);

create index diary_entries_user_id_entry_date_idx
  on public.diary_entries (user_id, entry_date desc);

-- -----------------------------------------------------------------------------
-- Funciones
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_emoji)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(split_part(coalesce(new.email, ''), '@', 1)), ''),
      'Diarista'
    ),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'avatar_emoji'), ''), '🌸')
  );
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Triggers: updated_at
-- -----------------------------------------------------------------------------

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger diary_entries_set_updated_at
  before update on public.diary_entries
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Trigger: perfil al registrarse en auth.users
-- -----------------------------------------------------------------------------

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;

alter table public.diary_entries enable row level security;

-- profiles: ver y actualizar solo el propio; insertar solo el propio
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- diary_entries: CRUD solo sobre entradas propias
create policy "Users can view own diary entries"
  on public.diary_entries
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own diary entries"
  on public.diary_entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own diary entries"
  on public.diary_entries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own diary entries"
  on public.diary_entries
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Permisos para el rol authenticated (cliente con JWT de sesión)
-- -----------------------------------------------------------------------------

grant select, insert, update on table public.profiles to authenticated;

grant select, insert, update, delete on table public.diary_entries to authenticated;
