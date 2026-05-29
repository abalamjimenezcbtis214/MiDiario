import { Loader2 } from "lucide-react";

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fef8f5] via-[#f5e8ec] to-[#f5e8d8] gap-6">
      <div className="text-7xl animate-bounce">🌸</div>
      <Loader2 className="w-8 h-8 text-[#c9a6d4] animate-spin" />
      <p
        className="text-xl text-muted-foreground"
        style={{ fontFamily: "var(--font-script)", color: "#c9a6d4" }}
      >
        Abriendo tu diario...
      </p>
    </div>
  );
}
