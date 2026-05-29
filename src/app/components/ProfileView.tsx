import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Download, Loader2, Lock, Palette, Save, X } from "lucide-react";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import { getSupabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/database.types";
import {
  downloadTextFile,
  generateDiaryMarkdown,
  getDiaryExportFilename,
} from "@/lib/diary/exportUtils";
import {
  formatMemberSince,
  getDiaryStats,
  getFavoriteWritingHour,
} from "@/lib/diary/entryUtils";

const AVATAR_OPTIONS = ["🌸", "✨", "💜", "🦋", "🌷", "📖", "💌", "🌼"] as const;

export function ProfileView() {
  const { user } = useAuth();
  const { entries, loading: entriesLoading, error: entriesError } =
    useDiaryEntries();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🌸");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const stats = useMemo(() => getDiaryStats(entries), [entries]);
  const favoriteHour = useMemo(
    () => getFavoriteWritingHour(entries),
    [entries],
  );

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    const { data, error } = await getSupabase()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      setProfileError(error.message);
      setProfile(null);
    } else {
      setProfile(data);
      setDisplayName(data.display_name ?? "");
      setAvatarEmoji(data.avatar_emoji || "🌸");
    }

    setProfileLoading(false);
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const startEditing = () => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setAvatarEmoji(profile.avatar_emoji || "🌸");
    }
    setSaveError(null);
    setSaveSuccess(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setAvatarEmoji(profile.avatar_emoji || "🌸");
    }
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const trimmedName = displayName.trim();
    const trimmedEmoji = avatarEmoji.trim();

    if (!trimmedName) {
      setSaveError("Escribe un nombre para mostrar.");
      return;
    }

    if (!trimmedEmoji) {
      setSaveError("Elige un emoji para tu avatar.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const { data, error } = await getSupabase()
      .from("profiles")
      .update({
        display_name: trimmedName,
        avatar_emoji: trimmedEmoji,
      })
      .eq("id", user.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    setProfile(data);
    setDisplayName(data.display_name ?? "");
    setAvatarEmoji(data.avatar_emoji);
    setIsEditing(false);
    setSaveSuccess("Perfil actualizado ✨");
  };

  const isLoading = profileLoading || entriesLoading;
  const displayError = profileError ?? entriesError;

  const memberSince = profile?.created_at
    ? formatMemberSince(profile.created_at)
    : user?.created_at
      ? formatMemberSince(user.created_at)
      : null;

  const shownName =
    profile?.display_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Diarista";

  const shownAvatar = profile?.avatar_emoji || "🌸";
  const shownEmail = user?.email ?? "";

  const handleExportDiary = () => {
    setExportMessage(null);

    if (isLoading) return;

    if (entries.length === 0) {
      setExportMessage(
        "Aún no tienes entradas para exportar. Escribe en tu diario primero 💜",
      );
      return;
    }

    const content = generateDiaryMarkdown(entries);
    downloadTextFile(getDiaryExportFilename(), content);
    setExportMessage(
      `Diario exportado (${entries.length} ${entries.length === 1 ? "entrada" : "entradas"}) ✨`,
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h2
          className="text-3xl md:text-5xl"
          style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
        >
          Mi Perfil
        </h2>
        <div className="text-4xl md:text-5xl">💜</div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 text-[#c9a6d4] animate-spin" />
          <span className="text-sm">Cargando tu perfil...</span>
        </div>
      )}

      {displayError && !isLoading && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-[#f5c4d0]/30 border border-[#f5c4d0]/50 text-sm"
        >
          {displayError}
        </div>
      )}

      {saveSuccess && (
        <div
          role="status"
          className="p-3 rounded-2xl bg-[#b8d8d0]/30 border border-[#b8d8d0]/50 text-sm"
        >
          {saveSuccess}
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg relative overflow-hidden">
        <div className="absolute top-6 right-6 text-6xl opacity-20 pointer-events-none select-none">
          ✨
        </div>

        {!isEditing ? (
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[#c9a6d4] to-[#f5c4d0] rounded-full flex items-center justify-center text-5xl shadow-lg shrink-0">
              {shownAvatar}
            </div>
            <div className="flex-1">
              <h3
                className="text-3xl mb-1"
                style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
              >
                {shownName}
              </h3>
              {shownEmail && (
                <p className="text-sm text-muted-foreground mb-1">{shownEmail}</p>
              )}
              {memberSince && (
                <p className="text-muted-foreground">{memberSince}</p>
              )}
            </div>
            <button
              type="button"
              onClick={startEditing}
              disabled={isLoading || !!profileError}
              className="shrink-0 px-4 py-2 rounded-2xl border-2 border-[#c9a6d4]/30 bg-[#f5e8ec]/50 hover:bg-[#f5e8ec] text-sm transition-all disabled:opacity-60"
            >
              Editar perfil
            </button>
          </div>
        ) : (
          <div className="mb-8 space-y-4 relative z-10">
            <h3
              className="text-2xl"
              style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
            >
              Editar perfil
            </h3>

            <div>
              <label
                htmlFor="profile-display-name"
                className="block mb-2 text-sm text-foreground"
              >
                Nombre
              </label>
              <Input
                id="profile-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                disabled={saving}
                className="h-11 bg-white/80 border-2 border-[#c9a6d4]/20 rounded-2xl"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-foreground">
                Avatar (emoji)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarEmoji(emoji)}
                    className={`w-12 h-12 rounded-2xl text-2xl transition-all ${
                      avatarEmoji === emoji
                        ? "border-2 border-[#c9a6d4] bg-[#c9a6d4]/10 scale-105"
                        : "border-2 border-transparent bg-[#f5e8ec]/50 hover:bg-[#f5e8ec]"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <Input
                value={avatarEmoji}
                onChange={(e) => setAvatarEmoji(e.target.value)}
                maxLength={8}
                disabled={saving}
                className="h-11 bg-white/80 border-2 border-[#c9a6d4]/20 rounded-2xl"
              />
            </div>

            {saveError && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-[#f5c4d0]/30 border border-[#f5c4d0]/50 text-sm"
              >
                {saveError}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleSaveProfile()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#c9a6d4] to-[#dfc4e8] text-white rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl border-2 border-[#c9a6d4]/30 hover:bg-[#f5e8ec] transition-all disabled:opacity-60"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-[#f5c4d0]/20 to-white rounded-2xl border border-[#f5c4d0]/30">
            <div className="text-3xl mb-2">📝</div>
            <div
              className="text-2xl mb-1"
              style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
            >
              {isLoading ? "—" : stats.totalEntries}
            </div>
            <div className="text-sm text-muted-foreground">Entradas escritas</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-[#b8d8d0]/20 to-white rounded-2xl border border-[#b8d8d0]/30">
            <div className="text-3xl mb-2">🔥</div>
            <div
              className="text-2xl mb-1"
              style={{ fontFamily: "var(--font-script)", color: "#b8d8d0" }}
            >
              {isLoading ? "—" : stats.writingStreak}
            </div>
            <div className="text-sm text-muted-foreground">Días seguidos</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-[#dfc4e8]/20 to-white rounded-2xl border border-[#dfc4e8]/30">
            <div className="text-3xl mb-2">💜</div>
            <div
              className="text-2xl mb-1"
              style={{ fontFamily: "var(--font-script)", color: "#dfc4e8" }}
            >
              {isLoading ? "—" : (stats.frequentMood ?? "—")}
            </div>
            <div className="text-sm text-muted-foreground">Mood frecuente</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-[#f5e8d8]/20 to-white rounded-2xl border border-[#f5e8d8]/30">
            <div className="text-3xl mb-2">⏰</div>
            <div
              className="text-2xl mb-1"
              style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
            >
              {isLoading ? "—" : (favoriteHour ?? "—")}
            </div>
            <div className="text-sm text-muted-foreground">Hora favorita</div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#c9a6d4]/20 relative z-10">
          <h4
            className="text-2xl mb-2"
            style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
          >
            Exportar diario
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Descarga todas tus entradas en un archivo Markdown (.md).
          </p>

          {exportMessage && (
            <p
              role="status"
              className="mb-4 p-3 rounded-2xl bg-[#f5e8ec]/80 border border-[#c9a6d4]/20 text-sm text-foreground"
            >
              {exportMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleExportDiary}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#c9a6d4] to-[#dfc4e8] text-white rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            <Download className="w-5 h-5" />
            Exportar diario
          </button>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg space-y-6">
        <h3
          className="text-3xl mb-2"
          style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
        >
          Ajustes
        </h3>
        <p className="text-xs text-muted-foreground">
          Preferencias visuales próximamente
        </p>

        <div className="space-y-4 opacity-80">
          <div className="flex items-center justify-between p-4 bg-[#f5e8ec]/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#c9a6d4]/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#c9a6d4]" />
              </div>
              <div>
                <div className="text-foreground">Diario privado</div>
                <div className="text-sm text-muted-foreground">
                  Solo tú puedes ver tus entradas
                </div>
              </div>
            </div>
            <Switch defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#f5e8ec]/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#b8d8d0]/20 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#b8d8d0]" />
              </div>
              <div>
                <div className="text-foreground">Recordatorios diarios</div>
                <div className="text-sm text-muted-foreground">
                  Recibe una notificación para escribir
                </div>
              </div>
            </div>
            <Switch defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#f5e8ec]/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f5c4d0]/20 rounded-full flex items-center justify-center">
                <Palette className="w-5 h-5 text-[#f5c4d0]" />
              </div>
              <div>
                <div className="text-foreground">Tema aesthetic</div>
                <div className="text-sm text-muted-foreground">
                  Colores pastel y elementos decorativos
                </div>
              </div>
            </div>
            <Switch defaultChecked disabled />
          </div>
        </div>
      </div>
    </div>
  );
}
