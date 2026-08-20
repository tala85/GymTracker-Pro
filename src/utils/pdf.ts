import { jsPDF } from 'jspdf'
import type { Exercise, Routine, RoutineDay, RoutineExercise } from '../types'

export function exportRoutineToPdf(
  routine: Routine,
  days: RoutineDay[],
  exercisesByDay: Record<string, RoutineExercise[]>,
  library: Exercise[]
): void {
  const doc = new jsPDF()
  const nameOf = (exerciseId: string) =>
    library.find((e) => e.id === exerciseId)?.name ?? 'Ejercicio'

  let y = 20
  doc.setFontSize(16)
  doc.text(routine.name, 14, y)
  y += 8
  doc.setFontSize(10)
  doc.text(`Objetivo: ${routine.goal} · Estructura: ${routine.split}`, 14, y)
  y += 10

  for (const day of days) {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    doc.setFontSize(13)
    doc.text(`Dia ${day.dayNumber}: ${day.name}`, 14, y)
    y += 6
    doc.setFontSize(10)
    for (const re of exercisesByDay[day.id] ?? []) {
      if (y > 280) {
        doc.addPage()
        y = 20
      }
      const line = `- ${nameOf(re.exerciseId)}: ${re.setsTarget} x ${re.repsTarget} · RIR ${re.rirTarget ?? '-'} · descanso ${re.restSeconds}s`
      doc.text(line, 18, y)
      y += 6
    }
    y += 6
  }

  doc.save(`${routine.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}