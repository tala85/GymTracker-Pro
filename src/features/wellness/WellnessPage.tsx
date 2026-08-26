import { useEffect, useMemo, type ReactNode } from 'react'
import { Apple, Check, Droplets, Dumbbell, HeartHandshake, Minus, Moon, Plus, ShieldCheck, Sun, Wind } from 'lucide-react'
import { useWellnessStore } from '../../stores/wellnessStore'
import { useHistoryStore } from '../../stores/historyStore'
import { getDailyTips, type Tip } from '../../data/wellnessTips'
import { Card } from '../../components/ui/Card'

const WATER_GOAL = 8
const SLEEP_GOAL = 7
const SUN_GOAL = 10

const nowAtLoad = Date.now()

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function scoreOf(
  day:
    | {
        nutritionGood: boolean
        exerciseManual: boolean
        waterGlasses: number
        sunMinutes: number
        temperanceGood: boolean
        airGood: boolean
        sleepHours: number
        trustDone: boolean
      }
    | undefined,
  exercised: boolean
): number {
  if (!day && !exercised) return 0
  return [
    day?.nutritionGood ?? false,
    exercised || (day?.exerciseManual ?? false),
    (day?.waterGlasses ?? 0) >= WATER_GOAL,
    (day?.sunMinutes ?? 0) >= SUN_GOAL,
    day?.temperanceGood ?? false,
    day?.airGood ?? false,
    (day?.sleepHours ?? 0) >= SLEEP_GOAL,
    day?.trustDone ?? false,
  ].filter(Boolean).length
}

function BoolRow({
  icon,
  title,
  desc,
  done,
  onToggle,
  tip,
}: {
  icon: ReactNode
  title: string
  desc: string
  done: boolean
  onToggle: () => void
  tip?: Tip
}) {
  return (
    <Card className={`flex items-start gap-3 ${done ? 'border border-emerald-500/40' : ''}`}>
      <span className={`rounded-lg p-2 ${done ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-100 text-gray-500 dark:bg-slate-700'}`}>
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
        {tip && (
          <p className="mt-1.5 text-[11px] italic leading-snug text-emerald-500/90 dark:text-emerald-400/80">
            "{tip.text}" <span className="not-italic text-gray-400">— {tip.source}</span>
          </p>
        )}
      </div>
      <button
        onClick={onToggle}
        aria-label={title}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
          done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-gray-500 dark:bg-slate-600'
        }`}
      >
        <Check size={16} />
      </button>
    </Card>
  )
}

export function WellnessPage() {
  const days = useWellnessStore((state) => state.days)
  const loaded = useWellnessStore((state) => state.loaded)
  const load = useWellnessStore((state) => state.load)
  const updateToday = useWellnessStore((state) => state.updateToday)
  const sessions = useHistoryStore((state) => state.sessions)
  const loadHistory = useHistoryStore((state) => state.load)

  const tips = getDailyTips()

  useEffect(() => {
    load()
    loadHistory()
  }, [load, loadHistory])

  const today = days[todayKey()]
  const exercisedToday = sessions.some((s) => s.startedAt.slice(0, 10) === todayKey())

  const week = useMemo(() => {
    const result: { date: string; score: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const key = new Date(nowAtLoad - i * 86400000).toISOString().slice(0, 10)
      const exercised = sessions.some((s) => s.startedAt.slice(0, 10) === key)
      result.push({ date: key, score: scoreOf(days[key], exercised) })
    }
    return result
  }, [days, sessions])

  const score = scoreOf(today, exercisedToday)

  if (!loaded) return <p className="text-sm text-gray-500">Cargando…</p>

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-col gap-2">
        <h1 className="text-base font-bold">Bienestar integral</h1>
        <p className="text-xs italic text-gray-500 dark:text-gray-400">
          "El aire puro, el sol, la abstinencia, el descanso, el ejercicio, una alimentación
          conveniente, el uso del agua y la confianza en el poder divino: éstos son los
          verdaderos remedios." — El Ministerio de Curación
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-semibold text-emerald-500">Hoy: {score}/8</p>
          <div className="flex gap-1.5">
            {week.map((w) => (
              <div
                key={w.date}
                title={`${w.date}: ${w.score}/8`}
                className={`h-2.5 w-2.5 rounded-full ${
                  w.score >= 6 ? 'bg-emerald-500' : w.score >= 3 ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>

      <BoolRow
        icon={<Apple size={18} />}
        title="Nutrición"
        desc="Comida real, vegetales y sin excesos"
        done={today?.nutritionGood ?? false}
        onToggle={() => updateToday({ nutritionGood: !(today?.nutritionGood ?? false) })}
        tip={tips.nutricion}
      />

      <BoolRow
        icon={<Dumbbell size={18} />}
        title="Ejercicio"
        desc={exercisedToday ? '¡Entrenaste hoy! Marcado automático' : 'Movete al menos 30 minutos'}
        done={exercisedToday || (today?.exerciseManual ?? false)}
        onToggle={() => updateToday({ exerciseManual: !(today?.exerciseManual ?? false) })}
      />

      <Card className={`flex items-center gap-3 ${(today?.waterGlasses ?? 0) >= WATER_GOAL ? 'border border-emerald-500/40' : ''}`}>
        <span className={`rounded-lg p-2 ${(today?.waterGlasses ?? 0) >= WATER_GOAL ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-100 text-gray-500 dark:bg-slate-700'}`}>
          <Droplets size={18} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Agua</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{today?.waterGlasses ?? 0}/{WATER_GOAL} vasos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateToday({ waterGlasses: Math.max(0, (today?.waterGlasses ?? 0) - 1) })}
            className="rounded-full bg-slate-200 p-2 dark:bg-slate-600"
            aria-label="Menos agua"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => updateToday({ waterGlasses: Math.min(15, (today?.waterGlasses ?? 0) + 1) })}
            className="rounded-full bg-emerald-500 p-2 text-white"
            aria-label="Más agua"
          >
            <Plus size={14} />
          </button>
        </div>
      </Card>

      <Card className={`flex items-center gap-3 ${(today?.sunMinutes ?? 0) >= SUN_GOAL ? 'border border-emerald-500/40' : ''}`}>
        <span className={`rounded-lg p-2 ${(today?.sunMinutes ?? 0) >= SUN_GOAL ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-100 text-gray-500 dark:bg-slate-700'}`}>
          <Sun size={18} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Luz de sol</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{today?.sunMinutes ?? 0}/{SUN_GOAL} minutos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateToday({ sunMinutes: Math.max(0, (today?.sunMinutes ?? 0) - 5) })}
            className="rounded-full bg-slate-200 px-2.5 py-1.5 text-xs font-bold dark:bg-slate-600"
          >
            -5
          </button>
          <button
            onClick={() => updateToday({ sunMinutes: (today?.sunMinutes ?? 0) + 10 })}
            className="rounded-full bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-white"
          >
            +10
          </button>
        </div>
      </Card>

      <BoolRow
        icon={<ShieldCheck size={18} />}
        title="Temperancia"
        desc="Abstinencia de lo que daña, moderación en lo bueno"
        done={today?.temperanceGood ?? false}
        onToggle={() => updateToday({ temperanceGood: !(today?.temperanceGood ?? false) })}
        tip={tips.temperancia}
      />

      <BoolRow
        icon={<Wind size={18} />}
        title="Aire puro"
        desc="Salí o ventilá: respirá profundo al aire libre"
        done={today?.airGood ?? false}
        onToggle={() => updateToday({ airGood: !(today?.airGood ?? false) })}
      />

      <Card className={`flex items-center gap-3 ${(today?.sleepHours ?? 0) >= SLEEP_GOAL ? 'border border-emerald-500/40' : ''}`}>
        <span className={`rounded-lg p-2 ${(today?.sleepHours ?? 0) >= SLEEP_GOAL ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-100 text-gray-500 dark:bg-slate-700'}`}>
          <Moon size={18} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Descanso</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{today?.sleepHours ?? 0}/{SLEEP_GOAL} horas de sueño</p>
        </div>
        <input
          type="number"
          min={0}
          max={14}
          step={0.5}
          value={today?.sleepHours ?? 0}
          onChange={(event) => updateToday({ sleepHours: Math.min(14, Math.max(0, Number(event.target.value) || 0)) })}
          className="w-16 rounded border border-gray-300 bg-white px-2 py-1.5 text-center text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </Card>

      <BoolRow
        icon={<HeartHandshake size={18} />}
        title="Confianza en Dios"
        desc="Un momento de paz, oración o lectura"
        done={today?.trustDone ?? false}
        onToggle={() => updateToday({ trustDone: !(today?.trustDone ?? false) })}
        tip={tips.confianza}
      />
    </div>
  )
}