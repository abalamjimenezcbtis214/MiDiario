import { formatEntryDate, getMoodLabel } from "@/lib/diary/entryUtils";
import type { DiaryEntryWithTags } from "@/lib/supabase/database.types";

export type SearchableDiaryEntry = DiaryEntryWithTags & {
  formattedDate?: string;
};

function normalizeSearchText(text: string): string {
  return text.trim().toLowerCase();
}

function buildEntrySearchText(entry: SearchableDiaryEntry): string {
  const formattedDate =
    entry.formattedDate ?? formatEntryDate(entry.entry_date);

  const parts = [
    entry.content,
    entry.mood,
    entry.mood_label ?? "",
    getMoodLabel(entry.mood) ?? "",
    formattedDate,
    entry.entry_date,
    ...(entry.tags ?? []).map((tag) => tag.name),
  ];

  return normalizeSearchText(parts.join(" "));
}

export function filterDiaryEntries<T extends SearchableDiaryEntry>(
  entries: T[],
  query: string,
): T[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return entries;
  }

  return entries.filter((entry) =>
    buildEntrySearchText(entry).includes(normalizedQuery),
  );
}
