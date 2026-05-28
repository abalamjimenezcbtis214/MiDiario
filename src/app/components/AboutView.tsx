import { Heart, Shield, Sparkles, Users } from "lucide-react";

export function AboutView() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-4xl md:text-6xl mb-4" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
          My Dearest Diary
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground">
          Tu espacio seguro para expresarte y crecer ✨
        </p>
        <div className="text-5xl md:text-7xl mt-6">
          💌
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#c9a6d4]/30 shadow-lg">
        <h3 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
          Nuestra Misión
        </h3>
        <p className="text-foreground leading-relaxed mb-6">
          Creemos que cada persona merece un espacio íntimo y seguro donde pueda expresar sus pensamientos,
          emociones y sueños sin juicios. My Dearest Diary fue creado pensando en ti, para acompañarte en
          tu viaje de autoconocimiento y crecimiento personal.
        </p>
        <p className="text-foreground leading-relaxed">
          Más que una plataforma digital, somos tu confidente, tu espacio de reflexión,
          tu rincón creativo donde cada palabra cuenta y cada sentimiento es válido.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#f5c4d0]/30 to-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#f5c4d0]/30 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-5xl opacity-20">
            🌸
          </div>
          <div className="w-12 h-12 bg-[#f5c4d0]/40 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-[#f5c4d0]" />
          </div>
          <h4 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-script)', color: '#f5c4d0' }}>
            Expresión Emocional
          </h4>
          <p className="text-foreground">
            Reconocemos y validamos todas tus emociones. Aquí puedes ser completamente tú mismo.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#c9a6d4]/30 to-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#c9a6d4]/30 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-5xl opacity-20">
            🦋
          </div>
          <div className="w-12 h-12 bg-[#c9a6d4]/40 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-[#c9a6d4]" />
          </div>
          <h4 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
            Privacidad Total
          </h4>
          <p className="text-foreground">
            Tus pensamientos son solo tuyos. Garantizamos la máxima seguridad y privacidad de tus entradas.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#b8d8d0]/30 to-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#b8d8d0]/30 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-5xl opacity-20">
            🌷
          </div>
          <div className="w-12 h-12 bg-[#b8d8d0]/40 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-[#b8d8d0]" />
          </div>
          <h4 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-script)', color: '#b8d8d0' }}>
            Creatividad Personal
          </h4>
          <p className="text-foreground">
            Diseñado con una estética que inspira creatividad y hace que escribir sea un placer visual.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#dfc4e8]/30 to-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#dfc4e8]/30 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-5xl opacity-20">
            ✨
          </div>
          <div className="w-12 h-12 bg-[#dfc4e8]/40 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-[#dfc4e8]" />
          </div>
          <h4 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-script)', color: '#dfc4e8' }}>
            Para Jóvenes
          </h4>
          <p className="text-foreground">
            Pensado especialmente para estudiantes de 15-24 años que buscan un espacio para crecer.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#f5e8d8] via-[#f5e8ec] to-[#f5e8d8] rounded-3xl p-8 border border-[#c9a6d4]/20 text-center relative overflow-hidden">
        <div className="absolute top-4 left-4 text-5xl opacity-30">
          👼
        </div>
        <div className="absolute bottom-4 right-4 text-5xl opacity-30">
          🌟
        </div>
        <h3 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
          "Cada palabra que escribes es un paso hacia conocerte mejor"
        </h3>
        <p className="text-foreground max-w-2xl mx-auto">
          Gracias por confiar en nosotros como tu compañero en este viaje de autodescubrimiento.
          Estamos aquí para ti, todos los días, en cada momento que necesites expresarte.
        </p>
      </div>

      <div className="text-center text-muted-foreground">
        <p className="mb-2">Hecho con amor para la generación que siente profundamente</p>
        <div className="flex justify-center gap-2 text-2xl">
          💜 🌸 ✨ 🦋 💌
        </div>
      </div>
    </div>
  );
}
