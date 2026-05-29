import { useMemo } from "react";
import { Heart, Loader2, Plus, Sparkles, Star } from "lucide-react";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import { getDiaryStats } from "@/lib/diary/entryUtils";

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const { entries, loading, error } = useDiaryEntries();

  const stats = useMemo(() => getDiaryStats(entries), [entries]);
  const hasEntries = stats.totalEntries > 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2
            className="text-3xl md:text-5xl mb-2"
            style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
          >
            Bienvenida de nuevo ✨
          </h2>
          <p className="text-muted-foreground">¿Cómo te sientes hoy?</p>
        </div>
        <div className="text-5xl md:text-7xl animate-bounce">🌸</div>
      </div>

      <button
        type="button"
        onClick={() => onNavigate("entries")}
        className="w-full py-6 bg-gradient-to-r from-[#c9a6d4] via-[#dfc4e8] to-[#f5c4d0] text-white rounded-3xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
        <span className="text-xl" style={{ fontFamily: "var(--font-script)" }}>
          Empieza a escribir
        </span>
      </button>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
          <Loader2 className="w-5 h-5 text-[#c9a6d4] animate-spin" />
          <span className="text-sm">Cargando tu diario...</span>
        </div>
      )}

      {error && !loading && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-[#f5c4d0]/30 border border-[#f5c4d0]/50 text-sm"
        >
          {error}
        </div>
      )}

      {!loading && !error && !hasEntries && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-4 right-4 text-4xl opacity-30">🦋</div>
          <div className="text-5xl mb-4">📖</div>
          <h3
            className="text-2xl mb-2"
            style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
          >
            Aún no hay entradas
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Tu diario te espera. Cuando escribas la primera página, aquí verás tu
            última entrada y tus estadísticas.
          </p>
        </div>
      )}

      {!loading && !error && hasEntries && stats.latestEntry && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#c9a6d4]/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-4 right-4 text-4xl">🦋</div>
          <div className="absolute bottom-4 left-4 text-3xl opacity-50">🌷</div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#c9a6d4] to-[#f5c4d0] rounded-full flex items-center justify-center text-2xl">
              {stats.latestEntry.mood}
            </div>
            <div>
              <h3
                className="text-xl"
                style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
              >
                Última entrada
              </h3>
              <p className="text-sm text-muted-foreground">
                {stats.latestEntry.formattedDate}
              </p>
            </div>
          </div>

          <p className="text-foreground leading-relaxed mb-4">
            {stats.latestEntry.preview}
          </p>

          <button
            type="button"
            onClick={() => onNavigate("entries")}
            className="text-[#c9a6d4] hover:text-[#dfc4e8] transition-colors"
          >
            Leer más →
          </button>
        </div>
      )}

      {!loading && !error && hasEntries && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#f5c4d0]/30 to-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[#f5c4d0]/40 text-center">
            <div className="text-3xl mb-2">📝</div>
            <div
              className="text-3xl mb-1"
              style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
            >
              {stats.totalEntries}
            </div>
            <div className="text-sm text-muted-foreground">Entradas totales</div>
          </div>

          <div className="bg-gradient-to-br from-[#b8d8d0]/30 to-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[#b8d8d0]/40 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div
              className="text-3xl mb-1"
              style={{ fontFamily: "var(--font-script)", color: "#b8d8d0" }}
            >
              {stats.writingStreak}
            </div>
            <div className="text-sm text-muted-foreground">Días seguidos</div>
          </div>

          <div className="bg-gradient-to-br from-[#dfc4e8]/30 to-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[#dfc4e8]/40 text-center">
            <div className="text-3xl mb-2">💜</div>
            <div
              className="text-3xl mb-1"
              style={{ fontFamily: "var(--font-script)", color: "#dfc4e8" }}
            >
              {stats.frequentMood ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground">Estado frecuente</div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-[#f5e8d8] to-[#f5e8ec] rounded-3xl p-8 border border-[#c9a6d4]/20 relative">
        <div className="absolute top-4 right-4 text-5xl opacity-30">👼</div>
        <h3
          className="text-2xl mb-3"
          style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
        >
          Pensamiento del día
        </h3>
        <p className="text-foreground italic">
          "Tus sentimientos son válidos. Este espacio es tuyo para expresarte
          libremente y sin juicios. Cada palabra que escribes es un paso hacia
          conocerte mejor."
        </p>
        <div className="flex gap-2 mt-4 justify-end">
          <Heart className="w-5 h-5 text-[#f5c4d0]" fill="#f5c4d0" />
          <Star className="w-5 h-5 text-[#dfc4e8]" fill="#dfc4e8" />
          <Sparkles className="w-5 h-5 text-[#b8d8d0]" fill="#b8d8d0" />
        </div>
      </div>
    </div>
  );
}
