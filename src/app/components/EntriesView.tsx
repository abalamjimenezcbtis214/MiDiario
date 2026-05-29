import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { EntryTagChips } from "./EntryTagChips";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import { useTags } from "@/hooks/useTags";
import {
  DIARY_MOODS,
  getMoodLabel,
  toEntryDateString,
  withDisplayFields,
} from "@/lib/diary/entryUtils";
import { filterDiaryEntries } from "@/lib/diary/searchUtils";
import { findTagByName, normalizeTagName } from "@/lib/diary/tagUtils";
import type { DiaryEntryWithTags, Tag } from "@/lib/supabase/database.types";

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
    setEntryTags,
  } = useDiaryEntries();

  const { tags: allTags, getOrCreateTag } = useTags();

  const displayEntries = useMemo(
    () =>
      entries.map((entry) => ({
        ...withDisplayFields(entry),
        tags: entry.tags,
      })),
    [entries],
  );

  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = useMemo(
    () => filterDiaryEntries(displayEntries, searchQuery),
    [displayEntries, searchQuery],
  );

  const hasSearchQuery = searchQuery.trim().length > 0;

  const [isCreating, setIsCreating] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<DiaryEntryWithTags | null>(
    null,
  );
  const [editingEntry, setEditingEntry] = useState<DiaryEntryWithTags | null>(
    null,
  );
  const [selectedMood, setSelectedMood] = useState("");
  const [entryDate, setEntryDate] = useState(() => toEntryDateString());
  const [entryText, setEntryText] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedTags = useMemo(
    () =>
      selectedTagIds
        .map((id) => allTags.find((tag) => tag.id === id))
        .filter((tag): tag is Tag => Boolean(tag)),
    [selectedTagIds, allTags],
  );

  const resetForm = () => {
    setSelectedMood("");
    setEntryDate(toEntryDateString());
    setEntryText("");
    setSelectedTagIds([]);
    setNewTagInput("");
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

  const openEdit = (entry: DiaryEntryWithTags) => {
    setExpandedEntry(null);
    setIsCreating(false);
    setEditingEntry(entry);
    setSelectedMood(entry.mood);
    setEntryDate(entry.entry_date);
    setEntryText(entry.content);
    setSelectedTagIds(entry.tags.map((tag) => tag.id));
    setNewTagInput("");
    setFormError(null);
  };

  const closeEdit = () => {
    resetForm();
    setEditingEntry(null);
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
  };

  const removeSelectedTag = (tagId: string) => {
    setSelectedTagIds((current) => current.filter((id) => id !== tagId));
  };

  const handleAddNewTag = async () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) {
      setFormError("Escribe un nombre para la etiqueta.");
      return;
    }

    if (
      findTagByName(selectedTags, trimmed) ||
      selectedTagIds.some((id) => {
        const tag = allTags.find((item) => item.id === id);
        return tag && normalizeTagName(tag.name) === normalizeTagName(trimmed);
      })
    ) {
      setFormError("Esa etiqueta ya está seleccionada.");
      return;
    }

    const result = await getOrCreateTag(trimmed);
    if (result.error || !result.data) {
      setFormError(result.error ?? "No se pudo crear la etiqueta.");
      return;
    }

    setSelectedTagIds((current) =>
      current.includes(result.data!.id) ? current : [...current, result.data!.id],
    );
    setNewTagInput("");
    setFormError(null);
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

    if (result.error || !result.data) {
      setSaving(false);
      setFormError(result.error ?? "No se pudo crear la entrada.");
      return;
    }

    if (selectedTagIds.length > 0) {
      const tagResult = await setEntryTags(result.data.id, selectedTagIds);
      if (tagResult.error) {
        setSaving(false);
        setFormError(
          `Entrada guardada, pero las etiquetas fallaron: ${tagResult.error}`,
        );
        return;
      }
    }

    setSaving(false);
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

    if (result.error) {
      setSaving(false);
      setFormError(result.error);
      return;
    }

    const tagResult = await setEntryTags(editingEntry.id, selectedTagIds);
    setSaving(false);

    if (tagResult.error) {
      setFormError(
        `Entrada actualizada, pero las etiquetas fallaron: ${tagResult.error}`,
      );
      return;
    }

    closeEdit();
  };

  const handleDelete = async (entry: DiaryEntryWithTags) => {
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

  const renderTagPicker = () => (
    <div className="mb-6">
      <label className="block mb-3 text-foreground">Etiquetas</label>

      <div className="flex flex-wrap gap-2 mb-3">
        <Input
          value={newTagInput}
          onChange={(e) => setNewTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleAddNewTag();
            }
          }}
          placeholder="Nueva etiqueta..."
          disabled={saving}
          className="h-10 flex-1 min-w-[140px] bg-white/80 border-2 border-[#c9a6d4]/20 rounded-2xl"
        />
        <button
          type="button"
          onClick={() => void handleAddNewTag()}
          disabled={saving}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-2xl border-2 border-[#c9a6d4]/30 bg-[#f5e8ec]/50 hover:bg-[#f5e8ec] text-sm transition-all disabled:opacity-60"
        >
          <Plus className="w-4 h-4 text-[#c9a6d4]" />
          Agregar
        </button>
      </div>

      {selectedTags.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2">Seleccionadas</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => {
              const color = tag.color ?? "#c9a6d4";
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => removeSelectedTag(tag.id)}
                  disabled={saving}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border-2 transition-all"
                  style={{
                    borderColor: color,
                    backgroundColor: `${color}30`,
                  }}
                >
                  {tag.name}
                  <X className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {allTags.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Tus etiquetas</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              const color = tag.color ?? "#c9a6d4";
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTagSelection(tag.id)}
                  disabled={saving}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border-2 transition-all ${
                    isSelected ? "scale-105" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{
                    borderColor: color,
                    backgroundColor: isSelected ? `${color}30` : `${color}15`,
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
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
        <div className="absolute top-6 right-6 text-4xl pointer-events-none select-none">
          🌸
        </div>

        <h2
          className="text-4xl mb-6"
          style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
        >
          {title}
        </h2>

        {renderMoodPicker()}

        <div className="mb-6">
          <label htmlFor="entry-date" className="block mb-3 text-foreground">
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

        {renderTagPicker()}

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

        <div className="absolute bottom-6 right-8 text-6xl opacity-10 pointer-events-none">
          ✨
        </div>
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
          <div className="absolute top-6 right-6 text-4xl pointer-events-none">
            🦋
          </div>

          <div className="flex items-start gap-4 mb-4">
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

          <EntryTagChips tags={expandedEntry.tags} className="mb-6" />

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

      {!loading && !error && displayEntries.length > 0 && (
        <>
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 border-2 border-[#c9a6d4]/20 shadow-sm">
            <label htmlFor="entry-search" className="sr-only">
              Buscar en mi diario
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c9a6d4]" />
              <Input
                id="entry-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en mi diario…"
                className="h-12 pl-12 pr-4 bg-white/80 border-2 border-[#c9a6d4]/20 rounded-2xl focus-visible:border-[#c9a6d4]"
              />
            </div>
          </div>

          {filteredEntries.length === 0 && hasSearchQuery && (
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-10 border-2 border-[#c9a6d4]/20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p
                className="text-2xl mb-2"
                style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
              >
                Sin resultados
              </p>
              <p className="text-muted-foreground">
                No encontramos entradas con esa búsqueda.
              </p>
            </div>
          )}

          {filteredEntries.length > 0 && (
        <div className="space-y-4">
          {filteredEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#c9a6d4]/20 shadow-md hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-3xl pointer-events-none">
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
                  <EntryTagChips tags={entry.tags} className="mb-3" />
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
        </>
      )}
    </div>
  );
}
