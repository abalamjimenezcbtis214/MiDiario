import {
  BarChart3,
  BookHeart,
  Calendar,
  User,
  Info,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function Navigation({ activeView, onNavigate }: NavigationProps) {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    setIsOpen(false);
  };

  const menuItems = [
    { id: "home", label: "Inicio", icon: BookHeart },
    { id: "entries", label: "Entradas", icon: BookHeart },
    { id: "calendar", label: "Calendario", icon: Calendar },
    { id: "analytics", label: "Moods", icon: BarChart3 },
    { id: "profile", label: "Perfil", icon: User },
    { id: "about", label: "Sobre nosotros", icon: Info },
  ];

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border-2 border-[#c9a6d4]/30"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-[#c9a6d4]" />
        ) : (
          <Menu className="w-6 h-6 text-[#c9a6d4]" />
        )}
      </button>

      <nav className={`
        w-64 min-h-screen bg-white/60 backdrop-blur-sm border-r-2 border-[#c9a6d4]/30 p-6 sticky top-0
        md:block
        ${isOpen ? 'fixed inset-0 z-40' : 'hidden'}
      `}>
      <div className="mb-8">
        <h1 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-script)', color: '#c9a6d4' }}>
          My Dearest Diary
        </h1>
        <div className="text-sm text-muted-foreground">Tu espacio seguro ✨</div>
      </div>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeView === item.id
                  ? 'bg-gradient-to-r from-[#c9a6d4] to-[#dfc4e8] text-white shadow-md'
                  : 'hover:bg-[#f5e8ec] text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="mt-6 w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-[#f5c4d0]/40 bg-[#f5e8ec]/40 hover:bg-[#f5e8ec] text-foreground transition-all disabled:opacity-60"
      >
        <LogOut className="w-5 h-5 text-[#f5c4d0]" />
        <span>{signingOut ? "Cerrando sesión..." : "Cerrar sesión"}</span>
      </button>

      <div className="mt-8 p-4 bg-gradient-to-br from-[#f5c4d0]/20 to-[#dfc4e8]/20 rounded-2xl border border-[#c9a6d4]/20">
        <p className="text-sm text-center" style={{ fontFamily: 'var(--font-script)', fontSize: '18px' }}>
          "Cada día es una nueva página"
        </p>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="text-center text-6xl opacity-20">
          ✨
        </div>
      </div>
    </nav>
    </>
  );
}
