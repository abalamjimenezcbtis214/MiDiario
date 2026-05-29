import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export type AuthResult = {
  error: string | null;
  successMessage: string | null;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: "Supabase no está configurado. Revisa tu archivo .env.local.",
        successMessage: null,
      };
    }

    const { error } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    return {
      error: error?.message ?? null,
      successMessage: error ? null : "¡Bienvenida de nuevo! ✨",
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: "Supabase no está configurado. Revisa tu archivo .env.local.",
        successMessage: null,
      };
    }

    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      return { error: error.message, successMessage: null };
    }

    if (data.session) {
      return {
        error: null,
        successMessage: "¡Cuenta creada! Ya puedes escribir en tu diario 💜",
      };
    }

    return {
      error: null,
      successMessage:
        "Cuenta creada. Revisa tu correo para confirmar el registro si tu proyecto lo requiere.",
    };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return {
        error: "Supabase no está configurado.",
        successMessage: null,
      };
    }

    const { error } = await getSupabase().auth.signOut();

    return {
      error: error?.message ?? null,
      successMessage: error ? null : null,
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, loading, signIn, signUp, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
