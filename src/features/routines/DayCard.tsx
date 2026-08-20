import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { RoutineDay } from '../../types'
import { useRoutineStore } from '../../stores/routineStore'
import { useExerciseStore } from '../../stores/exerciseStore'
import { Button } from '../../components/ui/Button'
import { ExercisePickerModal } from '../../components/domain/ExercisePickerModal'

interface FieldProps {
  label: string
  value: string | number
  type?: string
  onChange: (value: string) => void
}

function Field({ label, value, type = 'number', onChange }: FieldProps) {
  return (
    <label className="flex flex-col gap-0.5 text-[11px] text-gray-500 dark:text-gray-400">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded border border-gray-300 bg-white px-1.5 py-1 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      />
    </label>
  )
}

export function DayCard({ day }: { day: RoutineDay }) {
  const exercisesByDay = useRoutineStore((state) => state.exercisesByDay)
  const allExercises = useExerciseStore((state) => state.exercises)
  const addExerciseToDay = useRoutineStore((state) => state.addExerciseToDay)
  const updateRoutineExercise = useRoutineStore((state) => state.updateRoutineExercise)
  const removeRoutineExercise = useRoutineStore((state) => state.removeRoutineExercise)
  const [showPicker, setShowPicker] = useState(false)

  const routineExercises = exercisesByDay[day.id] ?? []
  const nameOf = (exerciseId: string) =>
    allExercises.find((exercise) => exercise.id === exerciseId)?.name ?? 'Ejercicio'

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
      {routineExercises.length === 0 && (
        <p className="py-2 text-center text-xs text-gray-500 dark:text-gray-400">
          Sin ejercicios todavía. Agregá el primero.
        </p>
      )}
      {routineExercises.map((re) => (
        <div key={re.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">{nameOf(re.exerciseId)}</p>
            <button
              onClick={() => removeRoutineExercise(re.id)}
              aria-label="Quitar ejercicio"
              className="text-red-400 hover:text-red-500"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Field
              label="Series"
              value={re.setsTarget}
              onChange={(v) => updateRoutineExercise(re.id, { setsTarget: Math.max(0, Number(v) || 0) })}
            />
            <Field
              label="Reps"
              type="text"
              value={re.repsTarget}
              onChange={(v) => updateRoutineExercise(re.id, { repsTarget: v })}
            />
            <Field
              label="RIR"
              value={re.rirTarget ?? 1}
              onChange={(v) => updateRoutineExercise(re.id, { rirTarget: Math.min(10, Math.max(0, Number(v) || 0)) })}
            />
            <Field
              label="Desc. (s)"
              value={re.restSeconds}
              onChange={(v) => updateRoutineExercise(re.id, { restSeconds: Math.max(0, Number(v) || 0) })}
            />
          </div>
        </div>
      ))}
      <Button size="sm" variant="secondary" onClick={() => setShowPicker(true)}>
        <Plus size={14} /> Agregar ejercicio
      </Button>
      <ExercisePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onPick={(exerciseIdValue) => addExerciseToDay(day.id, exerciseIdValue)}
      />
    </div>
  )
}