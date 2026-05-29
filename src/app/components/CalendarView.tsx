import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import {
  addMonths,
  buildMoodByDayOfMonth,
  filterEntriesForMonth,
  getCalendarMonthFromDate,
  getMoodColor,
  getMoodTrackerForMonth,
} from "@/lib/diary/entryUtils";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function CalendarView() {
  const { entries, loading, error } = useDiaryEntries();
  const [viewMonth, setViewMonth] = useState(getCalendarMonthFromDate);

  const { year, month } = viewMonth;

  const moodByDay = useMemo(
    () => buildMoodByDayOfMonth(entries, year, month),
    [entries, year, month],
  );

  const moodTracker = useMemo(
    () => getMoodTrackerForMonth(entries, year, month),
    [entries, year, month],
  );

  const monthEntries = useMemo(
    () => filterEntriesForMonth(entries, year, month),
    [entries, year, month],
  );

  const hasEntriesInMonth = monthEntries.length > 0;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => {
    setViewMonth((current) => addMonths(current, -1));
  };

  const nextMonth = () => {
    setViewMonth((current) => addMonths(current, 1));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h2
          className="text-3xl md:text-5xl"
          style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
        >
          Mi Calendario
        </h2>
        <div className="text-4xl md:text-5xl">📅</div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 text-[#c9a6d4] animate-spin" />
          <span className="text-sm">Cargando tu calendario...</span>
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

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg relative overflow-hidden">
        <div className="absolute top-6 right-6 text-6xl opacity-20 pointer-events-none select-none">
          🌸
        </div>

        <div className="relative z-10 flex items-center justify-between mb-6 gap-2">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mes anterior"
            className="shrink-0 p-2 hover:bg-[#f5e8ec] rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#c9a6d4]" />
          </button>

          <h3
            className="text-2xl md:text-3xl text-center"
            style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
          >
            {MONTH_NAMES[month]} {year}
          </h3>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Mes siguiente"
            className="shrink-0 p-2 hover:bg-[#f5e8ec] rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-[#c9a6d4]" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div key={day} className="text-center p-2 text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {days.map((day) => {
            const mood = moodByDay[day];
            const color = mood ? getMoodColor(mood) : undefined;

            return (
              <div
                key={day}
                className={`aspect-square rounded-2xl p-2 flex flex-col items-center justify-center transition-all ${
                  mood
                    ? "shadow-md hover:shadow-lg scale-100 hover:scale-105"
                    : "bg-[#f5e8ec]/30"
                }`}
                style={
                  mood
                    ? {
                        backgroundColor: `${color}20`,
                        border: `2px solid ${color}`,
                      }
                    : undefined
                }
              >
                <div className="text-sm mb-1">{day}</div>
                {mood && <div className="text-2xl">{mood}</div>}
              </div>
            );
          })}
        </div>

        {!loading && !error && !hasEntriesInMonth && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            No hay entradas en {MONTH_NAMES[month].toLowerCase()}. Cuando escribas
            en tu diario, tus moods aparecerán en el calendario 🌸
          </p>
        )}
      </div>

      <div className="bg-gradient-to-br from-[#f5e8d8] to-[#f5e8ec] rounded-3xl p-6 border border-[#c9a6d4]/20">
        <h3
          className="text-2xl mb-4"
          style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
        >
          Mood Tracker
        </h3>

        {!loading && !error && moodTracker.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {moodTracker.map((item) => {
              const color = getMoodColor(item.mood);
              const dayLabel = item.days === 1 ? "1 día" : `${item.days} días`;

              return (
                <div key={item.mood} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: `${color}20`,
                      border: `2px solid ${color}`,
                    }}
                  >
                    {item.mood}
                  </div>
                  <div>
                    <div className="text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {dayLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && moodTracker.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aún no hay moods registrados este mes. Escribe una entrada para ver tu
            seguimiento aquí.
          </p>
        )}
      </div>
    </div>
  );
}
