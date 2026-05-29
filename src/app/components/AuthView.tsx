import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "signin" | "signup";

export function AuthView() {
  const { signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.successMessage) {
      setSuccessMessage(result.successMessage);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fef8f5] via-[#f5e8ec] to-[#f5e8d8] p-6">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1
            className="text-3xl mb-4"
            style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
          >
            Supabase no configurado
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Crea un archivo <code className="text-[#c9a6d4]">.env.local</code>{" "}
            con <code className="text-[#c9a6d4]">VITE_SUPABASE_URL</code> y{" "}
            <code className="text-[#c9a6d4]">VITE_SUPABASE_ANON_KEY</code>{" "}
            (copia desde <code className="text-[#c9a6d4]">.env.example</code>) y
            reinicia el servidor de desarrollo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fef8f5] via-[#f5e8ec] to-[#f5e8d8] p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-8 right-8 text-8xl opacity-10 pointer-events-none animate-pulse">
        ✨
      </div>
      <div className="absolute bottom-12 left-1/4 text-7xl opacity-10 pointer-events-none">
        🦋
      </div>
      <div className="absolute top-1/3 right-1/4 text-6xl opacity-10 pointer-events-none">
        🌸
      </div>

      <div className="max-w-md w-full bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg relative">
        <div className="absolute top-6 right-6 text-4xl">💌</div>

        <div className="text-center mb-8">
          <h1
            className="text-4xl md:text-5xl mb-2"
            style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
          >
            My Dearest Diary
          </h1>
          <p className="text-muted-foreground">
            {mode === "signin"
              ? "Tu espacio seguro te espera ✨"
              : "Crea tu diario privado 💜"}
          </p>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-[#f5e8ec]/50 rounded-2xl">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className={`flex-1 py-2 rounded-xl text-sm transition-all ${
              mode === "signin"
                ? "bg-gradient-to-r from-[#c9a6d4] to-[#dfc4e8] text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 py-2 rounded-xl text-sm transition-all ${
              mode === "signup"
                ? "bg-gradient-to-r from-[#c9a6d4] to-[#dfc4e8] text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-email"
              className="block mb-2 text-sm text-foreground"
            >
              Correo electrónico
            </label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              disabled={loading}
              className="h-11 bg-white/80 border-2 border-[#c9a6d4]/20 rounded-2xl focus-visible:border-[#c9a6d4]"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block mb-2 text-sm text-foreground"
            >
              Contraseña
            </label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
              className="h-11 bg-white/80 border-2 border-[#c9a6d4]/20 rounded-2xl focus-visible:border-[#c9a6d4]"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-2xl bg-[#f5c4d0]/30 border border-[#f5c4d0]/50 text-sm text-foreground"
            >
              {error}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="p-3 rounded-2xl bg-[#b8d8d0]/30 border border-[#b8d8d0]/50 text-sm text-foreground flex items-start gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#b8d8d0] shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#c9a6d4] via-[#dfc4e8] to-[#f5c4d0] text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Un momento...</span>
              </>
            ) : (
              <span style={{ fontFamily: "var(--font-script)", fontSize: "20px" }}>
                {mode === "signin" ? "Entrar al diario" : "Crear mi diario"}
              </span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Solo tú puedes ver tus entradas. Tu diario es privado 🔒
        </p>
      </div>
    </div>
  );
}
