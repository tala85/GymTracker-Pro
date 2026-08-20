import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Trash2 } from 'lucide-react'
import { useRoutineStore } from '../../stores/routineStore'
import { useWorkoutStore } from '../../stores/workoutStore'
import { WEEKDAY_LABELS } from '../../data/templates'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function WorkoutStartPage() {
  const navigate = useNavigate()
  const routines = useRoutineStore((state) => state.routines)
  const daysByRoutine = useRoutineStore((state) => state.daysByRoutine)
  const active = useWorkoutStore((state) => state.active)
  const loadActive = useWorkoutStore((state) => state.loadActive)
  const startWorkout = useWorkoutStore((state) => state.startWorkout)
  const discard = useWorkoutStore((state) => state.discard)

  useEffect(() => {
    loadActive()
  }, [loadActive])

  const activeRoutine = routines.find((r) => r.isActive)
  const days = activeRoutine ? daysByRoutine[activeRoutine.id] ?? [] : []
  const todayWeekday = ((new Date().getDay() + 6) % 7) + 1

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Entrenar</h1>

      {active && (
        <Card className="flex flex-col gap-3 border border-emerald-500/40">
          <p className="text-sm font-semibold">Entrenamiento en curso: {active.dayName}</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/entrenar/activo')}>
              <Play size={16} /> Reanudar
            </Button>
            <Button variant="ghost" className="text-red-500" onClick={() => discard()}>
              <Trash2 size={16} /> Descartar
            </Button>
          </div>
        </Card>
      )}

      {!activeRoutine ? (
        <Card className="text-center">
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Necesitás una rutina activa para entrenar.
          </p>
          <Button onClick={() => navigate('/rutinas')}>Ir a rutinas</Button>
        </Card>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rutina activa:{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-200">{activeRoutine.name}</span>.
            Elegí el día que vas a entrenar:
          </p>
          <div className="flex flex-col gap-2">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={async () => {
                  await startWorkout(activeRoutine.id, day.id)
                  navigate('/entrenar/activo')
                }}
                className={`rounded-xl p-4 text-left shadow-sm transition-colors ${
                  day.weekday === todayWeekday
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white hover:bg-emerald-500/10 dark:bg-slate-800'
                }`}
              >
                <p className="font-bold">{day.name}</p>
                <p className={`text-xs ${day.weekday === todayWeekday ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {WEEKDAY_LABELS[(day.weekday ?? 1) - 1]} · {day.targetMuscles.join(', ')}
                  {day.weekday === todayWeekday && ' · Hoy'}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}