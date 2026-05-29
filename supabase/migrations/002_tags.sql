-- My Dearest Diary — etiquetas (tags) en entradas
-- Ejecutar en Supabase SQL Editor DESPUÉS de 001_initial_schema.sql.
-- No modifica tablas existentes; solo agrega tags y diary_entry_tags.

-- -----------------------------------------------------------------------------
-- Tablas
-- -----------------------------------------------------------------------------

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_name_not_empty check (char_length(trim(name)) > 0)
);

create table public.diary_entry_tags (
  entry_id uuid not null references public.diary_entries (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, tag_id)
);

-- Nombre único por usuario (insensible a mayúsculas/minúsculas)
create unique index tags_user_id_name_lower_idx
  on public.tags (user_id, lower(trim(name)));

create index tags_user_id_idx on public.tags (user_id);

create index diary_entry_tags_entry_id_idx on public.diary_entry_tags (entry_id);

create index diary_entry_tags_tag_id_idx on public.diary_entry_tags (tag_id);

-- -----------------------------------------------------------------------------
-- Trigger: updated_at en tags (reutiliza public.set_updated_at de 001)
-- -----------------------------------------------------------------------------

create trigger tags_set_updated_at
  before update on public.tags
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.tags enable row level security;

alter table public.diary_entry_tags enable row level security;

-- tags: CRUD solo sobre etiquetas propias
create policy "Users can view own tags"
  on public.tags
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own tags"
  on public.tags
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own tags"
  on public.tags
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own tags"
  on public.tags
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- diary_entry_tags: solo si la entrada y el tag pertenecen al usuario
create policy "Users can view own entry tag links"
  on public.diary_entry_tags
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.diary_entries e
      where e.id = entry_id
        and e.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.tags t
      where t.id = tag_id
        and t.user_id = auth.uid()
    )
  );

create policy "Users can insert own entry tag links"
  on public.diary_entry_tags
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.diary_entries e
      where e.id = entry_id
        and e.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.tags t
      where t.id = tag_id
        and t.user_id = auth.uid()
    )
  );

create policy "Users can delete own entry tag links"
  on public.diary_entry_tags
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.diary_entries e
      where e.id = entry_id
        and e.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.tags t
      where t.id = tag_id
        and t.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- Permisos para el rol authenticated
-- -----------------------------------------------------------------------------

grant select, insert, update, delete on table public.tags to authenticated;

grant select, insert, delete on table public.diary_entry_tags to authenticated;
