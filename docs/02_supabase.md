VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY


Quedó creado supabase/migrations/001_initial_schema.sql. Resumen de lo que incluye:

Tablas
public.profiles: columnas que pediste, con avatar_emoji por defecto 🌸.
public.diary_entries: columnas que pediste, con id vía gen_random_uuid() y entry_date por defecto current_date.
RLS y políticas
RLS activado en ambas tablas.
profiles: SELECT, INSERT y UPDATE solo si auth.uid() = id (sin borrado de perfil).
diary_entries: SELECT, INSERT, UPDATE y DELETE solo si auth.uid() = user_id.
Triggers
on_auth_user_created: tras insert en auth.users, crea fila en profiles (security definer). Usa display_name de metadata, parte local del email o 'Diarista'; avatar_emoji desde metadata o 🌸.
profiles_set_updated_at y diary_entries_set_updated_at: actualizan updated_at en cada UPDATE.
Extra (útil en producción, sin tocar React)
Índices en user_id y (user_id, entry_date desc) para listados y calendario.
GRANT a authenticated para que el cliente con JWT pueda usar las políticas.
Cómo ejecutarlo
Abre el SQL Editor en tu proyecto Supabase.
Pega y ejecuta el contenido del archivo (en un proyecto nuevo, de una sola vez).
Si las tablas ya existen, habrá que borrarlas o adaptar el script antes de volver a ejecutarlo.
No se modificó ningún archivo React. Cuando quieras, el siguiente paso puede ser el cliente Supabase y AuthView en la app.

