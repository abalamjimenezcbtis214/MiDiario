import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { Tag, TagInsert } from "@/lib/supabase/database.types";
import {
  DEFAULT_TAG_COLOR,
  findTagByName,
  normalizeTagName,
} from "@/lib/diary/tagUtils";
import { useAuth } from "@/hooks/useAuth";

type MutationResult<T> = {
  error: string | null;
  data: T | null;
};

export function useTags() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTags = useCallback(async () => {
    if (!user) {
      setTags([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getSupabase()
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setTags([]);
    } else {
      setTags(data ?? []);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refreshTags();
  }, [refreshTags]);

  const createTag = useCallback(
    async (name: string, color?: string | null): Promise<MutationResult<Tag>> => {
      if (!user) {
        return { error: "No hay sesión activa.", data: null };
      }

      const trimmed = name.trim();
      if (!trimmed) {
        return { error: "El nombre de la etiqueta no puede estar vacío.", data: null };
      }

      const payload: TagInsert = {
        user_id: user.id,
        name: trimmed,
        color: color ?? DEFAULT_TAG_COLOR,
      };

      const { data, error: insertError } = await getSupabase()
        .from("tags")
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        return { error: insertError.message, data: null };
      }

      await refreshTags();
      return { error: null, data };
    },
    [user, refreshTags],
  );

  const deleteTag = useCallback(
    async (id: string): Promise<MutationResult<null>> => {
      if (!user) {
        return { error: "No hay sesión activa.", data: null };
      }

      const { error: deleteError } = await getSupabase()
        .from("tags")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) {
        return { error: deleteError.message, data: null };
      }

      await refreshTags();
      return { error: null, data: null };
    },
    [user, refreshTags],
  );

  const getOrCreateTag = useCallback(
    async (name: string, color?: string | null): Promise<MutationResult<Tag>> => {
      if (!user) {
        return { error: "No hay sesión activa.", data: null };
      }

      const trimmed = name.trim();
      if (!trimmed) {
        return { error: "El nombre de la etiqueta no puede estar vacío.", data: null };
      }

      const { data: userTags } = await getSupabase()
        .from("tags")
        .select("*")
        .eq("user_id", user.id);

      const existing = findTagByName(userTags ?? [], trimmed);
      if (existing) {
        return { error: null, data: existing };
      }

      const created = await createTag(trimmed, color);
      if (created.data) {
        return created;
      }

      const { data: refreshedTags } = await getSupabase()
        .from("tags")
        .select("*")
        .eq("user_id", user.id);

      const retry = findTagByName(refreshedTags ?? [], trimmed);
      if (retry) {
        await refreshTags();
        return { error: null, data: retry };
      }

      return created;
    },
    [user, createTag, refreshTags],
  );

  return {
    tags,
    loading,
    error,
    refreshTags,
    createTag,
    deleteTag,
    getOrCreateTag,
  };
}
