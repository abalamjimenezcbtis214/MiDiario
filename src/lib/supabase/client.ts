import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const SUPABASE_ENV_KEYS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
] as const;

function getMissingSupabaseEnvVars(): string[] {
  const missing: string[] = [];

  if (!import.meta.env.VITE_SUPABASE_URL?.trim()) {
    missing.push("VITE_SUPABASE_URL");
  }
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()) {
    missing.push("VITE_SUPABASE_ANON_KEY");
  }

  return missing;
}

const missingEnvVars = getMissingSupabaseEnvVars();

if (missingEnvVars.length > 0) {
  console.error(
    `[My Dearest Diary] Configuración de Supabase incompleta. Variables faltantes: ${missingEnvVars.join(", ")}.\n` +
      `Copia .env.example a .env (o .env.local) y completa los valores en ` +
      `Supabase → Project Settings → API (Project URL y anon/public key).`,
  );
}

export const isSupabaseConfigured = missingEnvVars.length === 0;

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    )
  : null;

/** Cliente tipado; lanza si faltan variables de entorno (uso en fases posteriores). */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      `[My Dearest Diary] Supabase no está configurado. Faltan: ${SUPABASE_ENV_KEYS.filter((key) => {
        const value = import.meta.env[key];
        return typeof value !== "string" || !value.trim();
      }).join(", ")}`,
    );
  }
  return supabase;
}
