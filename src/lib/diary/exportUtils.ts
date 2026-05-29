import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DiaryEntry } from "@/lib/supabase/database.types";
import { formatEntryDate, sortEntriesByNewest } from "@/lib/diary/entryUtils";

const DIARY_TITLE = "My Dearest Diary";

export function generateDiaryMarkdown(entries: DiaryEntry[]): string {
  const sorted = sortEntriesByNewest(entries);
  const exportedAt = format(new Date(), "d 'de' MMMM, yyyy 'a las' HH:mm", {
    locale: es,
  });

  const lines: string[] = [
    `# ${DIARY_TITLE}`,
    "",
    `**Fecha de exportación:** ${exportedAt}`,
    "",
    `**Total de entradas:** ${sorted.length}`,
    "",
    "---",
    "",
  ];

  for (const entry of sorted) {
    const dateLabel = formatEntryDate(entry.entry_date);
    const moodLine = entry.mood_label
      ? `${entry.mood} (${entry.mood_label})`
      : entry.mood;

    lines.push(`## ${dateLabel}`, "", `**Estado:** ${moodLine}`, "", entry.content.trim(), "", "---", "");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function getDiaryExportFilename(date = new Date()): string {
  return `my-dearest-diary-${format(date, "yyyy-MM-dd")}.md`;
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType = "text/markdown;charset=utf-8",
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
