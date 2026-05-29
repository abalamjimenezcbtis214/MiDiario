import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import {
  DIARY_MOODS,
  getMoodLabel,
  toEntryDateString,
  withDisplayFields,
  type DiaryEntryWithDisplay,
} from "@/lib/diary/entryUtils";
import type { DiaryEntry } from "@/lib/supabase/database.types";

interface EntriesViewProps {
  onNavigate: (view: string) => void;
}

const LIST_DECORATIONS = ["🦋", "🌷", "🌼"] as const;

export function EntriesView({ onNavigate }: EntriesViewProps) {
  void onNavigate;

  const {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
  } = useDiaryEntries();

  const displayEntries = useMemo(
    () => entries.map(withDisplayFields),
    [entries],
  );

  const [isCreating, setIsCreating] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<DiaryEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [selectedMood, setSelectedMood] = useState("");
  const [entryDate, setEntryDate] = useState(() => toEntryDateString());
  const [entryText, setEntryText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedMood("");
    setEntryDate(toEntryDateString());
    setEntryText("");
    setFormError(null);
  };

  const openCreate = () => {
    resetForm();
    setExpandedEntry(null);
    setEditingEntry(null);
    setIsCreating(true);
  };

  const closeCreate = () => {
    resetForm();
    setIsCreating(false);
  };

  const openEdit = (entry: DiaryEntry) => {
    setExpandedEntry(null);
    setIsCreating(false);
    setEditingEntry(entry);
    setSelectedMood(entry.mood);
    setEntryDate(entry.entry_date);
    setEntryText(entry.content);
    setFormError(null);
  };

  const closeEdit = () => {
    resetForm();
    setEditingEntry(null);
  };

  const validateForm = (): boolean => {
    if (!selectedMood) {
      setFormError("Selecciona cómo te sientes hoy.");
      return false;
    }
    if (!entryDate.trim()) {
      setFormError("Selecciona la fecha de la entrada.");
      return false;
    }
    if (!entryText.trim()) {
      setFormError("Escribe tus pensamientos antes de guardar.");
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setSaving(true);
    const result = await createEntry({
      mood: selectedMood,
      mood_label: getMoodLabel(selectedMood),
      content: entryText,
      entry_date: entryDate,
    });
    setSaving(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    resetForm();
    setIsCreating(false);
  };

  const handleUpdate = async () => {
    if (!editingEntry || !validateForm()) return;

    setSaving(true);
    const result = await updateEntry(editingEntry.id, {
      mood: selectedMood,
      mood_label: getMoodLabel(selectedMood),
      content: entryText,
      entry_date: entryDate,
    });
    setSaving(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    closeEdit();
  };

  const handleDelete = async (entry: DiaryEntry) => {
    const confirmed = window.confirm(
      "¿Seguro que quieres borrar esta entrada? No se puede deshacer.",
    );
    if (!confirmed) return;

    setDeletingId(entry.id);
    const result = await deleteEntry(entry.id);
    setDeletingId(null);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    if (expandedEntry?.id === entry.id) {
      setExpandedEntry(null);
    }
    if (editingEntry?.id === entry.id) {
      closeEdit();
    }
  };

  const renderMoodPicker = () => (
    <div className="mb-6">
      <label className="block mb-3 text-foreground">¿Cómo te sientes hoy?</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {DIARY_MOODS.map((mood) => (
          <button
            key={mood.emoji}
            type="button"
            onClick={() => setSelectedMood(mood.emoji)}
            className={`p-4 rounded-2xl border-2 transition-all ${
              selectedMood === mood.emoji
                ? "border-[#c9a6d4] bg-[#c9a6d4]/10 scale-105"
                : "border-transparent bg-[#f5e8ec]/50 hover:bg-[#f5e8ec]"
            }`}
          >
            <div className="text-3xl mb-1">{mood.emoji}</div>
            <div className="text-xs text-muted-foreground">{mood.label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderEntryForm = (
    title: string,
    onBack: () => void,
    onSave: () => void,
    saveLabel: string,
  ) => (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-[#c9a6d4] hover:text-[#dfc4e8] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a entradas
      </button>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg relative">
        <div className="absolute top-6 right-6 text-4xl">🌸</div>

        <h2
          className="text-4xl mb-6"
          style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
        >
          {title}
        </h2>

        {renderMoodPicker()}

        <div className="mb-6">
          <label
            htmlFor="entry-date"
            className="block mb-3 text-foreground"
          >
            Fecha de la entrada
          </label>
          <Input
            id="entry-date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            disabled={saving}
            className="h-11 bg-white/80 border-2 border-[#c9a6d4]/20 rounded-2xl focus-visible:border-[#c9a6d4] max-w-xs"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-3 text-foreground">
            Escribe tus pensamientos...
          </label>
          <Textarea
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            placeholder="Querido diario, hoy..."
            disabled={saving}
            className="min-h-[300px] bg-white/80 border-2 border-[#c9a6d4]/20 rounded-2xl p-4 resize-none focus:border-[#c9a6d4] transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>

        {formError && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-2xl bg-[#f5c4d0]/30 border border-[#f5c4d0]/50 text-sm"
          >
            {formError}
          </div>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-[#c9a6d4] to-[#dfc4e8] text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Guardando..." : saveLabel}
        </button>

        <div className="absolute bottom-6 right-8 text-6xl opacity-10">✨</div>
      </div>
    </div>
  );

  if (isCreating) {
    return renderEntryForm(
      "Nueva Entrada",
      closeCreate,
      () => void handleCreate(),
      "Guardar entrada",
    );
  }

  if (editingEntry) {
    return renderEntryForm(
      "Editar entrada",
      closeEdit,
      () => void handleUpdate(),
      "Guardar cambios",
    );
  }

  if (expandedEntry) {
    const detail = withDisplayFields(expandedEntry);
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <button
          type="button"
          onClick={() => setExpandedEntry(null)}
          className="flex items-center gap-2 text-[#c9a6d4] hover:text-[#dfc4e8] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a entradas
        </button>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg relative">
          <div className="absolute top-6 right-6 text-4xl">🦋</div>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#c9a6d4] to-[#f5c4d0] rounded-full flex items-center justify-center text-4xl shrink-0">
              {detail.mood}
            </div>
            <div>
              <h2
                className="text-3xl md:text-4xl"
                style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
              >
                {detail.formattedDate}
              </h2>
              {detail.mood_label && (
                <p className="text-sm text-muted-foreground mt-1">
                  {detail.mood_label}
                </p>
              )}
            </div>
          </div>

          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {detail.content}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openEdit(expandedEntry)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-[#c9a6d4]/30 bg-[#f5e8ec]/50 hover:bg-[#f5e8ec] text-foreground transition-all text-sm"
            >
              <Pencil className="w-4 h-4 text-[#c9a6d4]" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => void handleDelete(expandedEntry)}
              disabled={deletingId === expandedEntry.id}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-[#f5c4d0]/40 bg-[#f5c4d0]/10 hover:bg-[#f5c4d0]/20 text-foreground transition-all text-sm disabled:opacity-60"
            >
              {deletingId === expandedEntry.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 text-[#f5c4d0]" />
              )}
              Borrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2
          className="text-3xl md:text-5xl"
          style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
        >
          Mis Entradas
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-[#c9a6d4] to-[#dfc4e8] text-white rounded-2xl shadow-md hover:shadow-lg transition-all text-sm md:text-base"
        >
          + Nueva entrada
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 text-[#c9a6d4] animate-spin" />
          <span className="text-sm">Cargando tus entradas...</span>
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

      {formError && !isCreating && !editingEntry && !expandedEntry && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-[#f5c4d0]/30 border border-[#f5c4d0]/50 text-sm"
        >
          {formError}
        </div>
      )}

      {!loading && !error && displayEntries.length === 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-10 border-2 border-[#c9a6d4]/20 text-center">
          <div className="text-5xl mb-4">📝</div>
          <p
            className="text-2xl mb-2"
            style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
          >
            Tu diario está en blanco
          </p>
          <p className="text-muted-foreground mb-6">
            Escribe tu primera entrada cuando quieras. Este espacio es solo tuyo.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="px-6 py-3 bg-gradient-to-r from-[#c9a6d4] to-[#dfc4e8] text-white rounded-2xl shadow-md hover:shadow-lg transition-all"
          >
            Crear primera entrada
          </button>
        </div>
      )}

      {!loading && displayEntries.length > 0 && (
        <div className="space-y-4">
          {displayEntries.map((entry: DiaryEntryWithDisplay, index) => (
            <div
              key={entry.id}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#c9a6d4]/20 shadow-md hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-3xl">
                {LIST_DECORATIONS[index % LIST_DECORATIONS.length]}
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#c9a6d4] to-[#f5c4d0] rounded-full flex items-center justify-center text-3xl shrink-0">
                  {entry.mood}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-xl mb-2"
                    style={{
                      fontFamily: "var(--font-script)",
                      color: "#c9a6d4",
                    }}
                  >
                    {entry.formattedDate}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {entry.preview}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setExpandedEntry(entry);
                      }}
                      className="text-[#c9a6d4] hover:text-[#dfc4e8] transition-colors text-sm"
                    >
                      Leer completo →
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(entry)}
                      className="text-muted-foreground hover:text-[#c9a6d4] transition-colors text-sm inline-flex items-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(entry)}
                      disabled={deletingId === entry.id}
                      className="text-muted-foreground hover:text-[#f5c4d0] transition-colors text-sm inline-flex items-center gap-1 disabled:opacity-60"
                    >
                      {deletingId === entry.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Borrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
