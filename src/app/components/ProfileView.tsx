import { User, Lock, Bell, Palette } from "lucide-react";
import { Switch } from "./ui/switch";

export function ProfileView() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl md:text-5xl" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
          Mi Perfil
        </h2>
        <div className="text-4xl md:text-5xl">
          💜
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg relative overflow-hidden">
        <div className="absolute top-6 right-6 text-6xl opacity-20">
          ✨
        </div>

        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#c9a6d4] to-[#f5c4d0] rounded-full flex items-center justify-center text-5xl shadow-lg">
            🌸
          </div>
          <div>
            <h3 className="text-3xl mb-1" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
              Sofia Martínez
            </h3>
            <p className="text-muted-foreground">Miembro desde Enero 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-[#f5c4d0]/20 to-white rounded-2xl border border-[#f5c4d0]/30">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl mb-1" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
              42
            </div>
            <div className="text-sm text-muted-foreground">Entradas escritas</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-[#b8d8d0]/20 to-white rounded-2xl border border-[#b8d8d0]/30">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl mb-1" style={{ fontFamily: 'var(--font-script)', color: '#b8d8d0' }}>
              7
            </div>
            <div className="text-sm text-muted-foreground">Días seguidos</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-[#dfc4e8]/20 to-white rounded-2xl border border-[#dfc4e8]/30">
            <div className="text-3xl mb-2">💜</div>
            <div className="text-2xl mb-1" style={{ fontFamily: 'var(--font-script)', color: '#dfc4e8' }}>
              😊
            </div>
            <div className="text-sm text-muted-foreground">Mood frecuente</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-[#f5e8d8]/20 to-white rounded-2xl border border-[#f5e8d8]/30">
            <div className="text-3xl mb-2">⏰</div>
            <div className="text-2xl mb-1" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
              9:30 PM
            </div>
            <div className="text-sm text-muted-foreground">Hora favorita</div>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg space-y-6">
        <h3 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
          Ajustes
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#f5e8ec]/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#c9a6d4]/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#c9a6d4]" />
              </div>
              <div>
                <div className="text-foreground">Diario privado</div>
                <div className="text-sm text-muted-foreground">Solo tú puedes ver tus entradas</div>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#f5e8ec]/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#b8d8d0]/20 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#b8d8d0]" />
              </div>
              <div>
                <div className="text-foreground">Recordatorios diarios</div>
                <div className="text-sm text-muted-foreground">Recibe una notificación para escribir</div>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#f5e8ec]/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f5c4d0]/20 rounded-full flex items-center justify-center">
                <Palette className="w-5 h-5 text-[#f5c4d0]" />
              </div>
              <div>
                <div className="text-foreground">Tema aesthetic</div>
                <div className="text-sm text-muted-foreground">Colores pastel y elementos decorativos</div>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}
