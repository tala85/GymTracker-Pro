import { useEffect, useMemo, type ReactNode } from "react";
import {
  Apple,
  Check,
  Droplets,
  Dumbbell,
  HeartHandshake,
  Minus,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { useWellnessStore } from "../../stores/wellnessStore";
import { useHistoryStore } from "../../stores/historyStore";
import { getDailyTips, type Tip } from "../../data/wellnessTips";
import { Card } from "../../components/ui/Card";

const WATER_GOAL = 8;
const SLEEP_GOAL = 7;
const SUN_GOAL = 10;

const nowAtLoad = Date.now();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function scoreOf(
  day:
    | {
        nutritionGood: boolean;
        exerciseManual: boolean;
        waterGlasses: number;
        sunMinutes: number;
        temperanceGood: boolean;
        airGood: boolean;
        sleepHours: number;
        trustDone: boolean;
      }
    | undefined,
  exercised: boolean,
): number {
  if (!day && !exercised) return 0;
  return [
    day?.nutritionGood ?? false,
    exercised || (day?.exerciseManual ?? false),
    (day?.waterGlasses ?? 0) >= WATER_GOAL,
    (day?.sunMinutes ?? 0) >= SUN_GOAL,
    day?.temperanceGood ?? false,
    day?.airGood ?? false,
    (day?.sleepHours ?? 0) >= SLEEP_GOAL,
    day?.trustDone ?? false,
  ].filter(Boolean).length;
}

function BoolRow({
  icon,
  title,
  desc,
  done,
  onToggle,
  tip,
  emoji,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  done: boolean;
  onToggle: () => void;
  tip?: Tip;
  emoji?: string;
}) {
  const handleClick = () => {
    onToggle();
    if (!done) {
      const messages: Record<string, string[]> = {
        Nutrición: [
          "¡Excelente elección! 🥗",
          "Tu cuerpo te lo agradece 🙏",
          "Comida real = energía real 💪",
        ],
        Ejercicio: [
          "¡Eso es! El movimiento es vida 🏃",
          "Cada día cuenta 💪",
          "¡Bien hecho! 🔥",
        ],
        Temperancia: [
          "¡Autocontrol activado! 🎯",
          "Dominio propio = poder 💪",
          "¡Vas por buen camino! ✨",
        ],
        "Aire puro": [
          "¡Respirá profundo! ️",
          "El aire puro renueva ",
          "¡Excelente! 🌿",
        ],
        "Confianza en Dios": [
          "¡Bendiciones! 🙏",
          "La fe mueve montañas ",
          "Paz y fortaleza 💖",
        ],
      };
      const msgs = messages[title] || ["¡Bien hecho! 👏"];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];

      toast.success(randomMsg, {
        className:
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-xl",
        duration: 3500,
      });
    }
  };

  return (
    <Card
      className={`flex items-start gap-3 transition-all ${done ? "border border-emerald-500/40 bg-emerald-500/5" : ""}`}
    >
      <span
        className={`rounded-lg p-2 ${done ? "bg-emerald-500/15 text-emerald-500" : "bg-slate-100 text-gray-500 dark:bg-slate-700"}`}
      >
        {icon}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold">{title}</p>
          {emoji && <span className="text-sm">{emoji}</span>}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
        {tip && (
          <p className="mt-1.5 text-[11px] italic leading-snug text-emerald-500/90 dark:text-emerald-400/80">
            "{tip.text}"{" "}
            <span className="not-italic text-gray-400">— {tip.source}</span>
          </p>
        )}
      </div>
      <button
        onClick={handleClick}
        aria-label={title}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
          done
            ? "bg-emerald-500 text-white scale-110"
            : "bg-slate-200 text-gray-500 dark:bg-slate-600"
        }`}
      >
        <Check size={16} />
      </button>
    </Card>
  );
}

export function WellnessPage() {
  const days = useWellnessStore((state) => state.days);
  const loaded = useWellnessStore((state) => state.loaded);
  const load = useWellnessStore((state) => state.load);
  const updateToday = useWellnessStore((state) => state.updateToday);
  const sessions = useHistoryStore((state) => state.sessions);
  const loadHistory = useHistoryStore((state) => state.load);

  const tips = getDailyTips();

  useEffect(() => {
    load();
    loadHistory();
  }, [load, loadHistory]);

  const today = days[todayKey()];
  const exercisedToday = sessions.some(
    (s) => s.startedAt.slice(0, 10) === todayKey(),
  );

  const week = useMemo(() => {
    const result: { date: string; score: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const key = new Date(nowAtLoad - i * 86400000).toISOString().slice(0, 10);
      const exercised = sessions.some((s) => s.startedAt.slice(0, 10) === key);
      result.push({ date: key, score: scoreOf(days[key], exercised) });
    }
    return result;
  }, [days, sessions]);

  const score = scoreOf(today, exercisedToday);

  // Mensaje motivacional según el puntaje
  const getMotivationalMessage = () => {
    if (score === 0)
      return {
        text: "Hoy es un nuevo día para brillar. ¡Empezá completando los 8 remedios! 💪",
        color: "text-gray-500",
      };
    if (score <= 3)
      return {
        text: "Vas por buen camino. Cada pequeño paso cuenta. ¡Seguí así! 🌱",
        color: "text-amber-500",
      };
    if (score <= 6)
      return {
        text: "¡Excelente progreso! Tu cuerpo y mente te lo agradecen. 🔥",
        color: "text-emerald-500",
      };
    return {
      text: "¡IMPRESIONANTE! Estás cuidando tu templo al máximo. ¡Sos un ejemplo! ",
      color: "text-emerald-600",
    };
  };

  const motivationalMsg = getMotivationalMessage();

  if (!loaded) return <p className="text-sm text-gray-500">Cargando…</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* HEADER MOTIVACIONAL */}
      <Card className="bg-linear-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {" "}
            Tu bienestar es tu fuerza
          </h1>
          <p className="text-xs italic text-gray-600 dark:text-gray-300">
            "El aire puro, el sol, la abstinencia, el descanso, el ejercicio,
            una alimentación conveniente, el uso del agua y la confianza en el
            poder divino: éstos son los verdaderos remedios."{" "}
            <span className="not-italic font-semibold">
              — El Ministerio de Curación
            </span>
          </p>
          <div className="mt-1 flex items-center justify-between">
            <p className={`text-sm font-bold ${motivationalMsg.color}`}>
              {motivationalMsg.text}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Progreso hoy: {score}/8
            </p>
            <div className="flex gap-1.5">
              {week.map((w) => (
                <div
                  key={w.date}
                  title={`${w.date}: ${w.score}/8`}
                  className={`h-3 w-3 rounded-full transition-all ${
                    w.score >= 6
                      ? "bg-emerald-500 scale-110"
                      : w.score >= 3
                        ? "bg-amber-400"
                        : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* NUTRICIÓN CON CONSEJO */}
      <BoolRow
        icon={<Apple size={18} />}
        title="Nutrición"
        desc="Comida real, vegetales y sin excesos"
        done={today?.nutritionGood ?? false}
        onToggle={() =>
          updateToday({ nutritionGood: !(today?.nutritionGood ?? false) })
        }
        tip={tips.nutricion}
        emoji={tips.nutricion.emoji}
      />

      {/* EJERCICIO */}
      <BoolRow
        icon={<Dumbbell size={18} />}
        title="Ejercicio"
        desc={
          exercisedToday
            ? "¡Entrenaste hoy! Marcado automático"
            : "Movete al menos 30 minutos"
        }
        done={exercisedToday || (today?.exerciseManual ?? false)}
        onToggle={() =>
          updateToday({ exerciseManual: !(today?.exerciseManual ?? false) })
        }
        emoji="💪"
      />

      {/* AGUA CON CONTADOR */}
      <Card
        className={`flex items-center gap-3 transition-all ${(today?.waterGlasses ?? 0) >= WATER_GOAL ? "border border-emerald-500/40 bg-emerald-500/5" : ""}`}
      >
        <span
          className={`rounded-lg p-2 ${(today?.waterGlasses ?? 0) >= WATER_GOAL ? "bg-emerald-500/15 text-emerald-500" : "bg-slate-100 text-gray-500 dark:bg-slate-700"}`}
        >
          <Droplets size={18} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold">Agua 💧</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {today?.waterGlasses ?? 0}/{WATER_GOAL} vasos
          </p>
          {(today?.waterGlasses ?? 0) >= WATER_GOAL && (
            <p className="text-[11px] text-emerald-500 mt-1">
              ¡Meta cumplida! Tu cuerpo hidratado{" "}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newCount = Math.max(0, (today?.waterGlasses ?? 0) - 1);
              updateToday({ waterGlasses: newCount });
              if (
                newCount < WATER_GOAL &&
                (today?.waterGlasses ?? 0) >= WATER_GOAL
              ) {
                toast.info("Seguí tomando agua 💧", { duration: 1500 });
              }
            }}
            className="rounded-full bg-slate-200 p-2 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            aria-label="Menos agua"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => {
              const newCount = Math.min(15, (today?.waterGlasses ?? 0) + 1);
              updateToday({ waterGlasses: newCount });
              if (newCount === WATER_GOAL) {
                toast.success("¡10 minutos de sol! Energía natural ☀️💪", {
                  className:
                    "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-xl",
                  duration: 3500,
                });
              } else if (newCount > WATER_GOAL) {
                toast.success("¡Súper hidratado! ", { duration: 2000 });
              }
            }}
            className="rounded-full bg-emerald-500 p-2 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30"
            aria-label="Más agua"
          >
            <Plus size={14} />
          </button>
        </div>
      </Card>

      {/* SOL CON CONTADOR */}
      <Card
        className={`flex items-center gap-3 transition-all ${(today?.sunMinutes ?? 0) >= SUN_GOAL ? "border border-amber-500/40 bg-amber-500/5" : ""}`}
      >
        <span
          className={`rounded-lg p-2 ${(today?.sunMinutes ?? 0) >= SUN_GOAL ? "bg-amber-500/15 text-amber-500" : "bg-slate-100 text-gray-500 dark:bg-slate-700"}`}
        >
          <Sun size={18} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold">Luz de sol ️</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {today?.sunMinutes ?? 0}/{SUN_GOAL} minutos
          </p>
          {(today?.sunMinutes ?? 0) >= SUN_GOAL && (
            <p className="text-[11px] text-amber-500 mt-1">
              ¡Vitamina D activada! ☀️✨
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newMinutes = Math.max(0, (today?.sunMinutes ?? 0) - 5);
              updateToday({ sunMinutes: newMinutes });
            }}
            className="rounded-full bg-slate-200 px-2.5 py-1.5 text-xs font-bold dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            -5
          </button>
          <button
            onClick={() => {
              const newMinutes = (today?.sunMinutes ?? 0) + 10;
              updateToday({ sunMinutes: newMinutes });
              if (
                newMinutes >= SUN_GOAL &&
                (today?.sunMinutes ?? 0) < SUN_GOAL
              ) {
                toast.success("¡10 minutos de sol! Energía natural ☀️💪", {
                  className:
                    "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-xl",
                  duration: 3500,
                });
              }
            }}
            className="rounded-full bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
          >
            +10
          </button>
        </div>
      </Card>

      {/* TEMPERANCIA CON CONSEJO */}
      <BoolRow
        icon={<ShieldCheck size={18} />}
        title="Temperancia"
        desc="Abstinencia de lo que daña, moderación en lo bueno"
        done={today?.temperanceGood ?? false}
        onToggle={() =>
          updateToday({ temperanceGood: !(today?.temperanceGood ?? false) })
        }
        tip={tips.temperancia}
        emoji={tips.temperancia.emoji}
      />

      {/* AIRE PURO */}
      <BoolRow
        icon={<Wind size={18} />}
        title="Aire puro"
        desc="Salí o ventilá: respirá profundo al aire libre"
        done={today?.airGood ?? false}
        onToggle={() => updateToday({ airGood: !(today?.airGood ?? false) })}
        emoji="🌬️"
      />

      {/* DESCANSO */}
      <Card
        className={`flex items-center gap-3 transition-all ${(today?.sleepHours ?? 0) >= SLEEP_GOAL ? "border border-indigo-500/40 bg-indigo-500/5" : ""}`}
      >
        <span
          className={`rounded-lg p-2 ${(today?.sleepHours ?? 0) >= SLEEP_GOAL ? "bg-indigo-500/15 text-indigo-500" : "bg-slate-100 text-gray-500 dark:bg-slate-700"}`}
        >
          <Moon size={18} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold">Descanso 😴</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {today?.sleepHours ?? 0}/{SLEEP_GOAL} horas de sueño
          </p>
          {(today?.sleepHours ?? 0) >= SLEEP_GOAL && (
            <p className="text-[11px] text-indigo-500 mt-1">
              ¡Descanso reparador! Recuperación óptima 😴💪
            </p>
          )}
        </div>
        <input
          type="number"
          min={0}
          max={14}
          step={0.5}
          value={today?.sleepHours ?? 0}
          onChange={(event) => {
            const hours = Math.min(
              14,
              Math.max(0, Number(event.target.value) || 0),
            );
            updateToday({ sleepHours: hours });
            if (hours >= SLEEP_GOAL && (today?.sleepHours ?? 0) < SLEEP_GOAL) {
              toast.success("¡7+ horas! Recuperación perfecta 😴", {
                className:
                  "bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-xl",
                duration: 3500,
              });
            }
          }}
          className="w-16 rounded border border-gray-300 bg-white px-2 py-1.5 text-center text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-indigo-500 focus:outline-none"
        />
      </Card>

      {/* CONFIANZA EN DIOS CON CONSEJO */}
      <BoolRow
        icon={<HeartHandshake size={18} />}
        title="Confianza en Dios"
        desc="Un momento de paz, oración o lectura"
        done={today?.trustDone ?? false}
        onToggle={() =>
          updateToday({ trustDone: !(today?.trustDone ?? false) })
        }
        tip={tips.confianza}
        emoji={tips.confianza.emoji}
      />
    </div>
  );
}
