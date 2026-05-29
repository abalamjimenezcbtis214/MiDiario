# My Dearest Diary

Diario digital privado con estética pastel. React + Vite + TypeScript + Supabase (Auth y PostgreSQL).

## Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS 4
- **Backend:** Supabase (Auth, `profiles`, `diary_entries`, RLS)

## Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com) (para deploy)

## Instalación local

```bash
git clone <tu-repositorio>
cd midiario
npm install
```

## Configurar Supabase

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor** y ejecuta el script completo:

   `supabase/migrations/001_initial_schema.sql`

3. En **Authentication → Providers**, habilita **Email** (contraseña).
4. Opcional: desactiva “Confirm email” en Auth si quieres entrar al instante en desarrollo.

## Variables de entorno

Copia la plantilla y rellena los valores desde **Project Settings → API**:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | Project URL (ej. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Clave **anon / public** (nunca uses `service_role` en el frontend) |

Ejemplo `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_public_key
```

> **Seguridad:** `.env.local` está en `.gitignore`. No subas claves al repositorio ni las pegues en issues públicos.

## Desarrollo

```bash
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`).

## Build de producción

```bash
npm run build
```

Genera la carpeta `dist/`. Vercel la usa automáticamente con el preset de Vite.

## Deploy en Vercel

1. Importa el repositorio en Vercel.
2. Framework preset: **Vite** (detectado automáticamente).
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`
6. En **Settings → Environment Variables**, agrega para **Production** (y Preview si quieres):

   | Name | Value |
   |------|--------|
   | `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
   | `VITE_SUPABASE_ANON_KEY` | Anon / public key |

7. Redeploy tras guardar las variables.

### Supabase en producción

- Usa la misma URL y anon key del proyecto que ejecutó el SQL.
- En **Authentication → URL Configuration**, añade la URL de Vercel (ej. `https://tu-app.vercel.app`) en **Site URL** y **Redirect URLs** si usas confirmación por email o magic links.

## Arquitectura de la app

- Sin React Router: navegación por `useState` en `App.tsx`.
- Sin sesión → solo `AuthView` (login/registro).
- Con sesión → `Navigation` + vistas (Home, Entradas, Calendario, Perfil, About).
- Datos del diario vía `useDiaryEntries()`; perfil vía tabla `profiles`.

## Checklist manual (antes de dar por bueno el deploy)

Marca cada ítem en staging/producción:

- [ ] **Registro:** crear cuenta con email y contraseña
- [ ] **Login:** iniciar sesión con usuario existente
- [ ] **Crear entrada:** mood + texto → aparece en lista
- [ ] **Editar entrada:** cambiar mood/texto → se guarda
- [ ] **Borrar entrada:** confirmar → desaparece de lista
- [ ] **Inicio:** última entrada y estadísticas coinciden con datos reales
- [ ] **Calendario:** moods por día; cambiar mes con flechas
- [ ] **Perfil:** email, nombre, emoji, stats y hora favorita
- [ ] **Editar perfil:** guardar `display_name` y `avatar_emoji` en Supabase
- [ ] **Cerrar sesión:** vuelve a pantalla de login; no se ve el diario sin sesión

## Seguridad (revisión FASE 8)

- El cliente solo usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- No hay `service_role` ni secretos de servidor en el código frontend.
- RLS en `profiles` y `diary_entries` limita acceso por `auth.uid()`.

## Estructura relevante

```
src/
  app/App.tsx              # Gate de sesión
  app/components/          # Vistas (Home, Entries, Calendar, Profile, Auth)
  contexts/AuthContext.tsx
  hooks/useAuth.ts
  hooks/useDiaryEntries.ts
  lib/supabase/client.ts
  lib/diary/entryUtils.ts
supabase/migrations/001_initial_schema.sql
```

## Licencia

Proyecto privado — uso personal/educativo según tu repositorio.
