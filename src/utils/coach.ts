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

export function analyzeSession(
  exercises: SessionExerciseLike[],
  techniqueFeeling?: 'impecable' | 'bien' | 'costo'
): CoachSuggestion[] {
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

    // Si el usuario dijo "me costó", el coach es más conservador
    if (techniqueFeeling === 'costo') {
      suggestions.push({
        exerciseId: ex.exerciseId,
        name: ex.name,
        action: 'bajar',
        deltaKg: -step,
        reason: 'Nos contaste que te costó: prioricemos la calidad del movimiento. Bajamos un poco la carga para que la próxima sesión puedas ejecutar con control total y sin compensaciones.',
      })
    } else if (allTop && techniqueFeeling === 'impecable') {
      suggestions.push({
        exerciseId: ex.exerciseId,
        name: ex.name,
        action: 'subir',
        deltaKg: step,
        reason: '¡Excelente! Cerraste las series al tope del rango con técnica impecable. Tu cuerpo está listo para un pequeño desafío: subimos la carga.',
      })
    } else if (allTop && techniqueFeeling === 'bien') {
      suggestions.push({
        exerciseId: ex.exerciseId,
        name: ex.name,
        action: 'mantener',
        deltaKg: 0,
        reason: 'Muy buen trabajo. Aunque llegaste al tope del rango, nos dijiste que "sentiste bien" (no impecable). Mantenemos el peso para consolidar antes de subir.',
      })
    } else if (failedBottom) {
      suggestions.push({
        exerciseId: ex.exerciseId,
        name: ex.name,
        action: 'bajar',
        deltaKg: -step,
        reason: 'Hoy no llegaste al rango de reps. Tranquilo, es parte del proceso. Bajamos el peso para recuperar la técnica y el control del movimiento.',
      })
    } else {
      suggestions.push({
        exerciseId: ex.exerciseId,
        name: ex.name,
        action: 'mantener',
        deltaKg: 0,
        reason: 'Buen punto medio. Mantenemos este peso y tu único objetivo la próxima vez es sumar 1 o 2 repeticiones limpias por serie.',
      })
    }
  }

  return suggestions
}