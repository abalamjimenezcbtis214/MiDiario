import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDiaryEntries } from "@/hooks/useDiaryEntries";
import { getMoodAnalytics } from "@/lib/diary/entryUtils";

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload?: {
      mood: string;
      moodLabel: string;
      count: number;
      percentage: number;
    };
  }>;
};

function MoodChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.[0]?.payload) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border-2 border-[#c9a6d4]/30 bg-white/95 px-3 py-2 text-sm shadow-md">
      <p className="font-medium">
        {data.mood} {data.moodLabel}
      </p>
      <p className="text-muted-foreground">
        {data.count} {data.count === 1 ? "entrada" : "entradas"} · {data.percentage}%
      </p>
    </div>
  );
}

export function MoodAnalyticsView() {
  const { entries, loading, error } = useDiaryEntries();

  const analytics = useMemo(() => getMoodAnalytics(entries), [entries]);
  const chartData = useMemo(
    () =>
      analytics.items.map((item) => ({
        mood: item.mood,
        moodLabel: item.moodLabel,
        name: `${item.mood} ${item.moodLabel}`,
        count: item.count,
        percentage: item.percentage,
        fill: item.color,
      })),
    [analytics.items],
  );

  const hasEntries = analytics.totalEntries > 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2
            className="text-3xl md:text-5xl mb-2"
            style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
          >
            Mood Analytics
          </h2>
          <p className="text-muted-foreground">
            Tu mapa emocional según tus entradas 💗
          </p>
        </div>
        <div className="text-4xl md:text-5xl">📊</div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 text-[#c9a6d4] animate-spin" />
          <span className="text-sm">Calculando tus moods...</span>
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

      {!loading && !error && !hasEntries && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-10 border-2 border-[#c9a6d4]/20 text-center">
          <div className="text-5xl mb-4">💗</div>
          <p
            className="text-2xl mb-2"
            style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
          >
            Aún no hay datos
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Cuando escribas entradas con tu estado de ánimo, aquí verás gráficas
            y porcentajes de cómo te has sentido.
          </p>
        </div>
      )}

      {!loading && !error && hasEntries && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#c9a6d4]/30 text-center">
              <div className="text-3xl mb-2">📝</div>
              <div
                className="text-3xl mb-1"
                style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
              >
                {analytics.totalEntries}
              </div>
              <div className="text-sm text-muted-foreground">Entradas totales</div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#dfc4e8]/30 text-center md:col-span-2">
              <div className="text-3xl mb-2">💜</div>
              {analytics.topMood && (
                <>
                  <div className="text-4xl mb-1">{analytics.topMood.mood}</div>
                  <div
                    className="text-xl mb-1"
                    style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
                  >
                    {analytics.topMood.moodLabel}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mood más frecuente · {analytics.topMood.percentage}% de tus
                    entradas
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 border-2 border-[#c9a6d4]/30 shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4 text-4xl opacity-20 pointer-events-none">
              🌸
            </div>
            <h3
              className="text-2xl mb-6"
              style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
            >
              Distribución por mood
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    label={({ payload }) =>
                      `${payload?.mood ?? ""} ${payload?.percentage ?? 0}%`
                    }
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.mood} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<MoodChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 border-2 border-[#c9a6d4]/30 shadow-lg">
            <h3
              className="text-2xl mb-6"
              style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
            >
              Conteo por mood
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c9a6d420" />
                  <XAxis
                    dataKey="mood"
                    tick={{ fontSize: 20 }}
                    axisLine={{ stroke: "#c9a6d440" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={{ stroke: "#c9a6d440" }}
                    tickLine={false}
                    tick={{ fill: "#7a6a82", fontSize: 12 }}
                  />
                  <Tooltip content={<MoodChartTooltip />} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.mood} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#f5e8d8] to-[#f5e8ec] rounded-3xl p-6 border border-[#c9a6d4]/20">
            <h3
              className="text-2xl mb-4"
              style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
            >
              Detalle por mood
            </h3>
            <div className="space-y-3">
              {analytics.items.map((item) => (
                <div
                  key={item.mood}
                  className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-[#c9a6d4]/15"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                    style={{
                      backgroundColor: `${item.color}20`,
                      border: `2px solid ${item.color}`,
                    }}
                  >
                    {item.mood}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">
                      {item.moodLabel}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.count} {item.count === 1 ? "entrada" : "entradas"}
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#f5e8ec] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="text-xl shrink-0"
                    style={{ fontFamily: "var(--font-script)", color: item.color }}
                  >
                    {item.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
