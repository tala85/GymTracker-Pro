import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Dumbbell, Play, Ruler, Sparkles } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useRoutineStore } from "../../stores/routineStore";
import { useHistoryStore } from "../../stores/historyStore";
import { useMeasurementStore } from "../../stores/measurementStore";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const nowAtLoad = Date.now();

export function HomePage() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const routines = useRoutineStore((state) => state.routines);
  const daysByRoutine = useRoutineStore((state) => state.daysByRoutine);
  const sessions = useHistoryStore((state) => state.sessions);
  const loadHistory = useHistoryStore((state) => state.load);
  const measurements = useMeasurementStore((state) => state.measurements);
  const loadMeasurements = useMeasurementStore((state) => state.load);

  useEffect(() => {
    loadHistory();
    loadMeasurements();
  }, [loadHistory, loadMeasurements]);

  const activeRoutine = routines.find((r) => r.isActive);
  const days = activeRoutine ? (daysByRoutine[activeRoutine.id] ?? []) : [];
  const todayWeekday = ((new Date(nowAtLoad).getDay() + 6) % 7) + 1;
  const todayDay = days.find((d) => d.weekday === todayWeekday) ?? days[0];

  const weekStats = useMemo(() => {
    const cutoff = nowAtLoad - 7 * 86400000;
    const list = sessions.filter(
      (s) => new Date(s.startedAt).getTime() >= cutoff,
    );
    return {
      count: list.length,
      volume: list.reduce((acc, s) => acc + (s.totalVolumeKg ?? 0), 0),
    };
  }, [sessions]);

  const latestWeight = measurements[0];
  const previousWeight = measurements[1];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">
        Hola, {profile?.fullName?.split(" ")[0] ?? "atleta"} 👋
      </h1>

      <Card className="flex flex-col gap-3 border border-emerald-500/30">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-500" />
          <h2 className="text-base font-bold">Asesor inteligente</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Respondé 6 preguntas y te armamos una rutina a tu medida: misma
          ciencia, adaptada a tus días, tu equipo y tu cuerpo.
        </p>
        <Button variant="secondary" onClick={() => navigate("/asesor")}>
          Hacer el test
        </Button>
      </Card>

      {activeRoutine && todayDay && (
        <Card className="flex flex-col gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Hoy te toca
          </p>
          <div>
            <h2 className="text-lg font-bold">{todayDay.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {todayDay.targetMuscles.join(", ")}
            </p>
          </div>
          <Button onClick={() => navigate("/entrenar")}>
            <Play size={16} /> Empezar
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Card className="flex flex-col gap-1">
          <p className="text-2xl font-bold">{weekStats.count}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Entrenamientos (7 días)
          </p>
        </Card>
        <Card className="flex flex-col gap-1">
          <p className="text-2xl font-bold">
            {weekStats.volume.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Kg movidos (7 días)
          </p>
        </Card>
      </div>

      {latestWeight && (
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Último peso
            </p>
            <p className="text-lg font-bold">{latestWeight.weightKg} kg</p>
          </div>
          {previousWeight && (
            <span className="text-sm font-semibold text-emerald-500">
              {latestWeight.weightKg > previousWeight.weightKg ? "+" : ""}
              {(latestWeight.weightKg - previousWeight.weightKg).toFixed(1)} kg
            </span>
          )}
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => navigate("/rutinas")}
          className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-xs font-semibold shadow-sm hover:bg-emerald-500/10 dark:bg-slate-800"
        >
          <CalendarDays size={20} className="text-emerald-500" /> Rutinas
        </button>
        <button
          onClick={() => navigate("/ejercicios")}
          className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-xs font-semibold shadow-sm hover:bg-emerald-500/10 dark:bg-slate-800"
        >
          <Dumbbell size={20} className="text-emerald-500" /> Ejercicios
        </button>
        <button
          onClick={() => navigate("/progreso")}
          className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-xs font-semibold shadow-sm hover:bg-emerald-500/10 dark:bg-slate-800"
        >
          <Ruler size={20} className="text-emerald-500" /> Progreso
        </button>
      </div>
    </div>
  );
}
