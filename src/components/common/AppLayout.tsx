import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { BookMarked, Dumbbell, Play, UserRound, WifiOff } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { RestTimer } from "../domain/RestTimer";
import { useUiStore } from "../../stores/uiStore";
import { useWorkoutStore } from "../../stores/workoutStore";

export function AppLayout() {
  const theme = useUiStore((state) => state.theme);
  const isOnline = useUiStore((state) => state.isOnline);
  const setOnline = useUiStore((state) => state.setOnline);
  const hasActive = useWorkoutStore((state) => state.active !== null);
  const loadActive = useWorkoutStore((state) => state.loadActive);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnline]);

  useEffect(() => {
    loadActive();
  }, [loadActive]);

  const showFab = ["/", "/rutinas", "/ejercicios"].some((path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path),
  );

  return (
    <div className="min-h-screen">
      {!isOnline && (
        <div className="flex items-center justify-center gap-2 bg-amber-500 py-1 text-xs font-medium text-black">
          <WifiOff size={14} />
          Sin conexión: tus datos se guardan en este dispositivo
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <Dumbbell size={20} className="text-emerald-500" />
            GymTracker Pro
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/enlaces"
              aria-label="Enlaces de interés"
              className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              <BookMarked size={18} />
            </Link>
            <Link
              to="/perfil"
              aria-label="Perfil"
              className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              <UserRound size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-32 pt-4">
        <Outlet />
      </main>

      {showFab && (
        <Link
          to="/entrenar"
          className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-600"
        >
          <Play size={16} fill="currentColor" />
          {hasActive ? "Reanudar entrenamiento" : "Entrenar"}
        </Link>
      )}

      <RestTimer />
      <BottomNav />
    </div>
  );
}
