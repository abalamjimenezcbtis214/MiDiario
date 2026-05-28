import { useState } from "react";
import { Save, ArrowLeft } from "lucide-react";
import { Textarea } from "./ui/textarea";

interface EntriesViewProps {
  onNavigate: (view: string) => void;
}

export function EntriesView({ onNavigate }: EntriesViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [entryText, setEntryText] = useState("");

  const moods = [
    { emoji: "😊", label: "Feliz" },
    { emoji: "😢", label: "Triste" },
    { emoji: "😴", label: "Cansado" },
    { emoji: "😍", label: "Enamorado" },
    { emoji: "😡", label: "Enojado" },
    { emoji: "🤔", label: "Pensativo" },
    { emoji: "😌", label: "Tranquilo" },
    { emoji: "🥳", label: "Emocionado" },
  ];

  const entries = [
    { id: 1, date: "28 de abril, 2026", mood: "😊", preview: "Hoy fue un día increíble. Desperté con mucha energía..." },
    { id: 2, date: "27 de abril, 2026", mood: "😌", preview: "Me tomé el día para descansar y reflexionar sobre..." },
    { id: 3, date: "26 de abril, 2026", mood: "🥳", preview: "¡Aprobé mi examen final! Estoy tan orgullosa de mí..." },
  ];

  if (isCreating) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <button
          onClick={() => setIsCreating(false)}
          className="flex items-center gap-2 text-[#c9a6d4] hover:text-[#dfc4e8] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a entradas
        </button>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg relative">
          <div className="absolute top-6 right-6 text-4xl">
            🌸
          </div>

          <h2 className="text-4xl mb-6" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
            Nueva Entrada
          </h2>

          <div className="mb-6">
            <label className="block mb-3 text-foreground">
              ¿Cómo te sientes hoy?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {moods.map((mood) => (
                <button
                  key={mood.emoji}
                  onClick={() => setSelectedMood(mood.emoji)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    selectedMood === mood.emoji
                      ? 'border-[#c9a6d4] bg-[#c9a6d4]/10 scale-105'
                      : 'border-transparent bg-[#f5e8ec]/50 hover:bg-[#f5e8ec]'
                  }`}
                >
                  <div className="text-3xl mb-1">{mood.emoji}</div>
                  <div className="text-xs text-muted-foreground">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-3 text-foreground">
              Escribe tus pensamientos...
            </label>
            <Textarea
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              placeholder="Querido diario, hoy..."
              className="min-h-[300px] bg-white/80 border-2 border-[#c9a6d4]/20 rounded-2xl p-4 resize-none focus:border-[#c9a6d4] transition-colors"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
          </div>

          <button className="w-full py-4 bg-gradient-to-r from-[#c9a6d4] to-[#dfc4e8] text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3">
            <Save className="w-5 h-5" />
            Guardar entrada
          </button>

          <div className="absolute bottom-6 right-8 text-6xl opacity-10">
            ✨
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl md:text-5xl" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
          Mis Entradas
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-[#c9a6d4] to-[#dfc4e8] text-white rounded-2xl shadow-md hover:shadow-lg transition-all text-sm md:text-base"
        >
          + Nueva entrada
        </button>
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#c9a6d4]/20 shadow-md hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-3xl">
              {index === 0 ? "🦋" : index === 1 ? "🌷" : "🌼"}
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#c9a6d4] to-[#f5c4d0] rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                {entry.mood}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
                    {entry.date}
                  </h3>
                </div>
                <p className="text-foreground leading-relaxed">
                  {entry.preview}
                </p>
                <button className="mt-3 text-[#c9a6d4] hover:text-[#dfc4e8] transition-colors text-sm">
                  Leer completo →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
