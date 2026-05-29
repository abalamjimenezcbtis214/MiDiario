import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type {
  DiaryEntry,
  DiaryEntryInsert,
  DiaryEntryUpdate,
} from "@/lib/supabase/database.types";
import { toEntryDateString } from "@/lib/diary/entryUtils";
import { useAuth } from "@/hooks/useAuth";

export type CreateEntryInput = {
  mood: string;
  mood_label?: string | null;
  content: string;
  entry_date?: string;
};

export type UpdateEntryInput = {
  mood?: string;
  mood_label?: string | null;
  content?: string;
  entry_date?: string;
};

type MutationResult<T> = {
  error: string | null;
  data: T | null;
};

export function useDiaryEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getSupabase()
      .from("diary_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setEntries([]);
    } else {
      setEntries(data ?? []);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refreshEntries();
  }, [refreshEntries]);

  const createEntry = useCallback(
    async (input: CreateEntryInput): Promise<MutationResult<DiaryEntry>> => {
      if (!user) {
        return { error: "No hay sesión activa.", data: null };
      }

      const payload: DiaryEntryInsert = {
        user_id: user.id,
        mood: input.mood,
        mood_label: input.mood_label ?? null,
        content: input.content.trim(),
        entry_date: input.entry_date ?? toEntryDateString(),
      };

      const { data, error: insertError } = await getSupabase()
        .from("diary_entries")
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        return { error: insertError.message, data: null };
      }

      await refreshEntries();
      return { error: null, data };
    },
    [user, refreshEntries],
  );

  const updateEntry = useCallback(
    async (
      id: string,
      input: UpdateEntryInput,
    ): Promise<MutationResult<DiaryEntry>> => {
      if (!user) {
        return { error: "No hay sesión activa.", data: null };
      }

      const payload: DiaryEntryUpdate = {};

      if (input.mood !== undefined) payload.mood = input.mood;
      if (input.mood_label !== undefined) payload.mood_label = input.mood_label;
      if (input.content !== undefined) payload.content = input.content.trim();
      if (input.entry_date !== undefined) payload.entry_date = input.entry_date;

      const { data, error: updateError } = await getSupabase()
        .from("diary_entries")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        return { error: updateError.message, data: null };
      }

      await refreshEntries();
      return { error: null, data };
    },
    [user, refreshEntries],
  );

  const deleteEntry = useCallback(
    async (id: string): Promise<MutationResult<null>> => {
      if (!user) {
        return { error: "No hay sesión activa.", data: null };
      }

      const { error: deleteError } = await getSupabase()
        .from("diary_entries")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) {
        return { error: deleteError.message, data: null };
      }

      await refreshEntries();
      return { error: null, data: null };
    },
    [user, refreshEntries],
  );

  return {
    entries,
    loading,
    error,
    refreshEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
