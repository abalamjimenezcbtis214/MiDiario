import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3));

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const moodData: Record<number, string> = {
    28: "😊",
    27: "😌",
    26: "🥳",
    25: "😴",
    23: "😍",
    20: "😊",
    18: "🤔",
  };

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      "😊": "#c9a6d4",
      "😌": "#b8d8d0",
      "🥳": "#f5c4d0",
      "😴": "#dfc4e8",
      "😍": "#f5c4d0",
      "🤔": "#c9a6d4",
    };
    return colors[mood] || "#c9a6d4";
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl md:text-5xl" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
          Mi Calendario
        </h2>
        <div className="text-4xl md:text-5xl">
          📅
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg relative overflow-hidden">
        <div className="absolute top-6 right-6 text-6xl opacity-20">
          🌸
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-[#f5e8ec] rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#c9a6d4]" />
          </button>

          <h3 className="text-3xl" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-[#f5e8ec] rounded-full transition-colors"
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
            const mood = moodData[day];
            const color = mood ? getMoodColor(mood) : undefined;

            return (
              <button
                key={day}
                className={`aspect-square rounded-2xl p-2 flex flex-col items-center justify-center transition-all ${
                  mood
                    ? 'shadow-md hover:shadow-lg scale-100 hover:scale-105'
                    : 'bg-[#f5e8ec]/30 hover:bg-[#f5e8ec]/50'
                }`}
                style={mood ? { backgroundColor: `${color}20`, border: `2px solid ${color}` } : {}}
              >
                <div className="text-sm mb-1">{day}</div>
                {mood && <div className="text-2xl">{mood}</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#f5e8d8] to-[#f5e8ec] rounded-3xl p-6 border border-[#c9a6d4]/20">
        <h3 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
          Mood Tracker
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: '#c9a6d420', border: '2px solid #c9a6d4' }}>
              😊
            </div>
            <div>
              <div className="text-sm">Feliz</div>
              <div className="text-xs text-muted-foreground">3 días</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: '#b8d8d020', border: '2px solid #b8d8d0' }}>
              😌
            </div>
            <div>
              <div className="text-sm">Tranquilo</div>
              <div className="text-xs text-muted-foreground">2 días</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: '#f5c4d020', border: '2px solid #f5c4d0' }}>
              🥳
            </div>
            <div>
              <div className="text-sm">Emocionado</div>
              <div className="text-xs text-muted-foreground">1 día</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: '#dfc4e820', border: '2px solid #dfc4e8' }}>
              😴
            </div>
            <div>
              <div className="text-sm">Cansado</div>
              <div className="text-xs text-muted-foreground">1 día</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
