import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLoadingScreen } from "./components/AuthLoadingScreen";
import { AuthView } from "./components/AuthView";
import { Navigation } from "./components/Navigation";
import { HomeView } from "./components/HomeView";
import { EntriesView } from "./components/EntriesView";
import { CalendarView } from "./components/CalendarView";
import { ProfileView } from "./components/ProfileView";
import { AboutView } from "./components/AboutView";

export default function App() {
  const { user, session, loading } = useAuth();
  const [activeView, setActiveView] = useState("home");

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user || !session) {
    return <AuthView />;
  }

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <HomeView onNavigate={setActiveView} />;
      case "entries":
        return <EntriesView onNavigate={setActiveView} />;
      case "calendar":
        return <CalendarView />;
      case "profile":
        return <ProfileView />;
      case "about":
        return <AboutView />;
      default:
        return <HomeView onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen md:flex bg-gradient-to-br from-[#fef8f5] via-[#f5e8ec] to-[#f5e8d8]">
      <Navigation activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="absolute top-8 right-8 text-8xl opacity-10 pointer-events-none animate-pulse">
          ✨
        </div>
        <div className="absolute bottom-12 left-1/2 text-7xl opacity-10 pointer-events-none">
          🦋
        </div>
        <div className="absolute top-1/3 right-1/4 text-6xl opacity-10 pointer-events-none">
          🌸
        </div>
        {renderView()}
      </main>
    </div>
  );
}