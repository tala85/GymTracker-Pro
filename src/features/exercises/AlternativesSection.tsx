import { useExerciseStore } from '../../stores/exerciseStore'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS } from '../../utils/labels'
import { ArrowRight, Dumbbell } from 'lucide-react'

interface AlternativesSectionProps {
  currentExerciseId: string
  primaryMuscle: string
  movementPattern: string
  onPick: (exerciseId: string) => void
}

export function AlternativesSection({
  currentExerciseId,
  primaryMuscle,
  movementPattern,
  onPick,
}: AlternativesSectionProps) {
  const exercises = useExerciseStore((state) => state.exercises)

  // Buscar alternativas: mismo músculo, MISMO patrón de movimiento, distinto ejercicio
  const alternatives = exercises.filter(
    (e) =>
      e.id !== currentExerciseId &&
      e.primaryMuscle === primaryMuscle &&
      e.movementPattern === movementPattern
  )

  // Si no hay del mismo patrón, buscar del mismo músculo (más amplias)
  const fallback = exercises.filter(
    (e) =>
      e.id !== currentExerciseId &&
      e.primaryMuscle === primaryMuscle &&
      !alternatives.some((a) => a.id === e.id)
  )

  if (alternatives.length === 0 && fallback.length === 0) return null

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-slate-100 p-3 dark:bg-slate-700/50">
      <div className="flex items-center gap-1.5">
        <Dumbbell size={14} className="text-emerald-500" />
        <p className="text-xs font-bold">Ejercicios equivalentes</p>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        Si este ejercicio no te gusta o no tenés el equipo, podés reemplazarlo por alguno de estos que trabajan el mismo músculo:
      </p>

      {alternatives.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
            Mismo patrón de movimiento (mejores alternativas)
          </p>
          {alternatives.map((alt) => (
            <button
              key={alt.id}
              onClick={() => onPick(alt.id)}
              className="flex items-center justify-between rounded-lg bg-white p-2 text-left transition-colors hover:bg-emerald-500/10 dark:bg-slate-800 dark:hover:bg-emerald-500/10"
            >
              <div className="flex-1">
                <p className="text-xs font-semibold">{alt.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {EQUIPMENT_LABELS[alt.equipment] ?? alt.equipment} · {DIFFICULTY_LABELS[alt.difficulty]}
                </p>
              </div>
              <ArrowRight size={14} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {fallback.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Otras opciones para {primaryMuscle}
          </p>
          {fallback.slice(0, 4).map((alt) => (
            <button
              key={alt.id}
              onClick={() => onPick(alt.id)}
              className="flex items-center justify-between rounded-lg bg-white p-2 text-left transition-colors hover:bg-emerald-500/10 dark:bg-slate-800 dark:hover:bg-emerald-500/10"
            >
              <div className="flex-1">
                <p className="text-xs font-semibold">{alt.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {EQUIPMENT_LABELS[alt.equipment] ?? alt.equipment} · {DIFFICULTY_LABELS[alt.difficulty]}
                </p>
              </div>
              <ArrowRight size={14} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}