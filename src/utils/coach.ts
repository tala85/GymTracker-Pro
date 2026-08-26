import { useExerciseStore } from '../stores/exerciseStore'

export interface CoachSuggestion {
  exerciseId: string
  name: string
  action: 'subir' | 'mantener' | 'bajar'
  deltaKg: number
  reason: string
}

interface SessionExerciseLike {
  exerciseId: string
  name: string
  repsTarget?: string
  sets: { isCompleted: boolean; reps: number; rir: number }[]
}

const BIG_MUSCLES = ['Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Espalda', 'Pecho']

function parseRange(repsTarget: string): { min: number; max: number } {
  const nums = repsTarget.split('-').map(Number).filter((n) => !Number.isNaN(n))
  if (nums.length === 2) return { min: nums[0], max: nums[1] }
  const single = nums[0] ?? 10
  return { min: single, max: single }
}

export function analyzeSession(exercises: SessionExerciseLike[]): CoachSuggestion[] {
  const library = useExerciseStore.getState().exercises
  const suggestions: CoachSuggestion[] = []

  for (const ex of exercises) {
    const completed = ex.sets.filter((s) => s.isCompleted)
    if (completed.length === 0) continue

    const { min, max } = parseRange(ex.repsTarget ?? '8-12')
    const muscle = library.find((e) => e.id === ex.exerciseId)?.primaryMuscle ?? ''
    const step = BIG_MUSCLES.includes(muscle) ? 5 : 2.5

    const allTop = completed.every((s) => s.reps >= max && (s.rir ?? 10) <= 2)
    const failedBottom = completed.some((s) => s.reps < min)

    if (allTop) {
      suggestions.push({
        exerciseId: ex.exerciseId,
        name: ex.name,
        action: 'subir',
        deltaKg: step,
        reason: `Cerraste ${completed.length} series de ${max}+ reps con RIR ≤ 2: tu cuerpo ya pidió más carga.`,
      })
    } else if (failedBottom) {
      suggestions.push({
        exerciseId: ex.exerciseId,
        name: ex.name,
        action: 'bajar',
        deltaKg: -step,
        reason: `No llegaste al rango de ${min} reps: bajá un poco el peso y recuperá la técnica.`,
      })
    } else {
      suggestions.push({
        exerciseId: ex.exerciseId,
        name: ex.name,
        action: 'mantener',
        deltaKg: 0,
        reason: 'Buen punto medio: mantené el peso y buscá 1 repetición más por serie la próxima vez.',
      })
    }
  }

  return suggestions
}