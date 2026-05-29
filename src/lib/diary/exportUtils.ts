import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DiaryEntry } from "@/lib/supabase/database.types";
import { formatEntryDate, sortEntriesByNewest } from "@/lib/diary/entryUtils";

const DIARY_TITLE = "My Dearest Diary";

export type DiaryExportProfile = {
  display_name?: string | null;
  avatar_emoji?: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getExportMetadata(entries: DiaryEntry[]) {
  const sorted = sortEntriesByNewest(entries);
  const exportedAt = format(new Date(), "d 'de' MMMM, yyyy 'a las' HH:mm", {
    locale: es,
  });
  return { sorted, exportedAt, total: sorted.length };
}

export function generateDiaryMarkdown(entries: DiaryEntry[]): string {
  const { sorted, exportedAt, total } = getExportMetadata(entries);

  const lines: string[] = [
    `# ${DIARY_TITLE}`,
    "",
    `**Fecha de exportación:** ${exportedAt}`,
    "",
    `**Total de entradas:** ${total}`,
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

export function generateDiaryPdfHtml(
  entries: DiaryEntry[],
  profile?: DiaryExportProfile | null,
): string {
  const { sorted, exportedAt, total } = getExportMetadata(entries);

  const ownerLine =
    profile?.display_name?.trim() || profile?.avatar_emoji
      ? `<p class="owner">${escapeHtml(profile.avatar_emoji ?? "🌸")} ${escapeHtml(profile.display_name?.trim() || "Mi diario")}</p>`
      : "";

  const entriesHtml = sorted
    .map((entry) => {
      const dateLabel = escapeHtml(formatEntryDate(entry.entry_date));
      const moodLine = entry.mood_label
        ? `${escapeHtml(entry.mood)} <span class="mood-label">(${escapeHtml(entry.mood_label)})</span>`
        : escapeHtml(entry.mood);
      const content = escapeHtml(entry.content.trim());

      return `
        <article class="entry">
          <h2>${dateLabel}</h2>
          <p class="mood"><strong>Estado:</strong> ${moodLine}</p>
          <div class="content">${content}</div>
        </article>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${DIARY_TITLE}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 2rem;
        font-family: "Segoe UI", system-ui, sans-serif;
        color: #4a4a4a;
        background: linear-gradient(135deg, #fef8f5 0%, #f5e8ec 50%, #f5e8d8 100%);
        line-height: 1.6;
      }
      .wrap { max-width: 720px; margin: 0 auto; }
      h1 {
        font-family: Georgia, "Times New Roman", serif;
        color: #c9a6d4;
        font-size: 2.25rem;
        margin: 0 0 0.5rem;
      }
      .owner { font-size: 1.1rem; margin: 0 0 1rem; color: #7a6a82; }
      .meta { color: #7a6a82; font-size: 0.95rem; margin: 0.25rem 0; }
      .entry {
        background: rgba(255, 255, 255, 0.85);
        border: 2px solid rgba(201, 166, 212, 0.35);
        border-radius: 1.25rem;
        padding: 1.25rem 1.5rem;
        margin-top: 1.25rem;
        page-break-inside: avoid;
      }
      .entry h2 {
        font-family: Georgia, "Times New Roman", serif;
        color: #c9a6d4;
        font-size: 1.35rem;
        margin: 0 0 0.5rem;
      }
      .mood { margin: 0 0 0.75rem; font-size: 1rem; }
      .mood-label { color: #7a6a82; }
      .content {
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 0;
      }
      @media print {
        body { background: #fff; padding: 1rem; }
        .entry { border-color: #ddd; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>${DIARY_TITLE}</h1>
      ${ownerLine}
      <p class="meta"><strong>Fecha de exportación:</strong> ${escapeHtml(exportedAt)}</p>
      <p class="meta"><strong>Total de entradas:</strong> ${total}</p>
      ${entriesHtml}
    </div>
    <script>
      window.addEventListener("load", function () {
        window.focus();
        window.print();
      });
    </script>
  </body>
</html>`;
}

export type DiaryPdfExportResult = {
  success: boolean;
  error?: string;
};

export function downloadDiaryPdf(
  entries: DiaryEntry[],
  profile?: DiaryExportProfile | null,
): DiaryPdfExportResult {
  const html = generateDiaryPdfHtml(entries, profile);
  const printWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printWindow) {
    return {
      success: false,
      error:
        "No se pudo abrir la ventana de impresión. Permite ventanas emergentes en tu navegador.",
    };
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  return { success: true };
}
