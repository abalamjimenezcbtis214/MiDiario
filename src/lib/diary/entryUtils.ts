import { format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";
import type { DiaryEntry } from "@/lib/supabase/database.types";

const PREVIEW_MAX_LENGTH = 140;

export function formatEntryDate(entryDate: string): string {
  return format(parseISO(entryDate), "d 'de' MMMM, yyyy", { locale: es });
}

export function getEntryPreview(content: string, maxLength = PREVIEW_MAX_LENGTH): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength).trimEnd()}...`;
}

export function toEntryDateString(date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export type CalendarMonth = {
  year: number;
  month: number;
};

export function getCalendarMonthFromDate(date = new Date()): CalendarMonth {
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function addMonths(
  { year, month }: CalendarMonth,
  delta: number,
): CalendarMonth {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export const DIARY_MOODS = [
  { emoji: "😊", label: "Feliz" },
  { emoji: "😢", label: "Triste" },
  { emoji: "😴", label: "Cansado" },
  { emoji: "😍", label: "Enamorado" },
  { emoji: "😡", label: "Enojado" },
  { emoji: "🤔", label: "Pensativo" },
  { emoji: "😌", label: "Tranquilo" },
  { emoji: "🥳", label: "Emocionado" },
] as const;

export function getMoodLabel(emoji: string): string | null {
  return DIARY_MOODS.find((m) => m.emoji === emoji)?.label ?? null;
}

/** Colores pastel del calendario por emoji de mood. */
export const MOOD_COLORS: Record<string, string> = {
  "😊": "#c9a6d4",
  "😌": "#b8d8d0",
  "🥳": "#f5c4d0",
  "😴": "#dfc4e8",
  "😍": "#f5c4d0",
  "🤔": "#c9a6d4",
  "😢": "#dfc4e8",
  "😡": "#f5c4d0",
};

export function getMoodColor(mood: string): string {
  return MOOD_COLORS[mood] ?? "#c9a6d4";
}

export function isEntryInMonth(
  entryDate: string,
  year: number,
  month: number,
): boolean {
  const date = parseISO(entryDate);
  return date.getFullYear() === year && date.getMonth() === month;
}

export function filterEntriesForMonth(
  entries: DiaryEntry[],
  year: number,
  month: number,
): DiaryEntry[] {
  return entries.filter((entry) =>
    isEntryInMonth(entry.entry_date, year, month),
  );
}

/**
 * Mapa día del mes (1–31) → mood de la entrada más reciente de ese día.
 */
export function buildMoodByDayOfMonth(
  entries: DiaryEntry[],
  year: number,
  month: number,
): Record<number, string> {
  const monthEntries = filterEntriesForMonth(entries, year, month);
  const entriesByDay = new Map<number, DiaryEntry[]>();

  for (const entry of monthEntries) {
    const day = parseISO(entry.entry_date).getDate();
    const dayEntries = entriesByDay.get(day) ?? [];
    dayEntries.push(entry);
    entriesByDay.set(day, dayEntries);
  }

  const moodByDay: Record<number, string> = {};

  for (const [day, dayEntries] of entriesByDay) {
    const latest = sortEntriesByNewest(dayEntries)[0];
    if (latest) {
      moodByDay[day] = latest.mood;
    }
  }

  return moodByDay;
}

export type MonthMoodSummary = {
  mood: string;
  label: string;
  days: number;
};

/** Resumen de moods del mes para el bloque Mood Tracker (días únicos por mood). */
export function getMoodTrackerForMonth(
  entries: DiaryEntry[],
  year: number,
  month: number,
): MonthMoodSummary[] {
  const moodByDay = buildMoodByDayOfMonth(entries, year, month);
  const dayCounts = new Map<string, number>();

  for (const mood of Object.values(moodByDay)) {
    dayCounts.set(mood, (dayCounts.get(mood) ?? 0) + 1);
  }

  return Array.from(dayCounts.entries())
    .map(([mood, days]) => ({
      mood,
      label: getMoodLabel(mood) ?? mood,
      days,
    }))
    .sort((a, b) => b.days - a.days);
}

export type DiaryEntryWithDisplay = DiaryEntry & {
  formattedDate: string;
  preview: string;
};

export function withDisplayFields(entry: DiaryEntry): DiaryEntryWithDisplay {
  return {
    ...entry,
    formattedDate: formatEntryDate(entry.entry_date),
    preview: getEntryPreview(entry.content),
  };
}

/** Ordena por entry_date y created_at descendente (misma lógica que Supabase). */
export function sortEntriesByNewest(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort((a, b) => {
    const dateCmp = b.entry_date.localeCompare(a.entry_date);
    if (dateCmp !== 0) return dateCmp;
    return b.created_at.localeCompare(a.created_at);
  });
}

export function getLatestEntry(entries: DiaryEntry[]): DiaryEntry | null {
  return sortEntriesByNewest(entries)[0] ?? null;
}

export function getMostFrequentMood(entries: DiaryEntry[]): string | null {
  if (entries.length === 0) return null;

  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1);
  }

  let frequentMood: string | null = null;
  let maxCount = 0;

  for (const [mood, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      frequentMood = mood;
    }
  }

  return frequentMood;
}

/**
 * Racha de días consecutivos con al menos una entrada.
 * Cuenta hacia atrás desde hoy; si hoy no hay entrada, empieza desde ayer.
 */
export function calculateWritingStreak(entries: DiaryEntry[]): number {
  if (entries.length === 0) return 0;

  const datesWithEntries = new Set(entries.map((entry) => entry.entry_date));
  let cursor = new Date();
  let streak = 0;

  if (!datesWithEntries.has(toEntryDateString(cursor))) {
    cursor = subDays(cursor, 1);
    if (!datesWithEntries.has(toEntryDateString(cursor))) {
      return 0;
    }
  }

  while (datesWithEntries.has(toEntryDateString(cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export type DiaryStats = {
  totalEntries: number;
  latestEntry: DiaryEntryWithDisplay | null;
  frequentMood: string | null;
  writingStreak: number;
};

export function getDiaryStats(entries: DiaryEntry[]): DiaryStats {
  const latest = getLatestEntry(entries);

  return {
    totalEntries: entries.length,
    latestEntry: latest ? withDisplayFields(latest) : null,
    frequentMood: getMostFrequentMood(entries),
    writingStreak: calculateWritingStreak(entries),
  };
}

/** Hora del día (local) con más entradas creadas; formato 12 h. */
export function getFavoriteWritingHour(entries: DiaryEntry[]): string | null {
  if (entries.length === 0) return null;

  const hourCounts = new Map<number, number>();

  for (const entry of entries) {
    const hour = parseISO(entry.created_at).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  }

  let favoriteHour = 0;
  let maxCount = 0;

  for (const [hour, count] of hourCounts) {
    if (count > maxCount) {
      maxCount = count;
      favoriteHour = hour;
    }
  }

  const reference = new Date();
  reference.setHours(favoriteHour, 0, 0, 0);
  return format(reference, "h:mm a");
}

export function formatMemberSince(isoDate: string): string {
  const formatted = format(parseISO(isoDate), "MMMM yyyy", { locale: es });
  const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  return `Miembro desde ${capitalized}`;
}
