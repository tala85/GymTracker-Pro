import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRoutineStore } from '../../stores/routineStore'
import { GOAL_LABELS, SPLIT_LABELS, WEEKDAY_LABELS } from '../../data/templates'
import type { RoutineDay, RoutineSplit, TrainingGoal } from '../../types'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { DayCard } from './DayCard'

export function RoutineEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const routines = useRoutineStore((state) => state.routines)
  const daysByRoutine = useRoutineStore((state) => state.daysByRoutine)
  const updateRoutine = useRoutineStore((state) => state.updateRoutine)
  const addDay = useRoutineStore((state) => state.addDay)
  const updateDay = useRoutineStore((state) => state.updateDay)
  const deleteDay = useRoutineStore((state) => state.deleteDay)

  const [dayModalOpen, setDayModalOpen] = useState(false)
  const [editDayId, setEditDayId] = useState<string | null>(null)
  const [deleteDayId, setDeleteDayId] = useState<string | null>(null)
  const [dayName, setDayName] = useState('')
  const [dayWeekday, setDayWeekday] = useState(1)

  const routine = routines.find((r) => r.id === id)
  const days = daysByRoutine[id ?? ''] ?? []

  if (!routine) {
    return (
      <div className="flex flex-col items-center gap-3 pt-10">
        <p className="text-sm text-gray-500">Rutina no encontrada.</p>
        <Button variant="secondary" onClick={() => navigate('/rutinas')}>Volver</Button>
      </div>
    )
  }

  const openAddDay = () => {
    setEditDayId(null)
    setDayName(`Día ${days.length + 1}`)
    setDayWeekday((days.length % 7) + 1)
    setDayModalOpen(true)
  }

  const openEditDay = (day: RoutineDay) => {
    setEditDayId(day.id)
    setDayName(day.name)
    setDayWeekday(day.weekday ?? 1)
    setDayModalOpen(true)
  }

  const saveDay = async () => {
    if (dayName.trim().length < 1) {
      toast.error('Poné un nombre al día')
      return
    }
    if (editDayId) {
      await updateDay(editDayId, { name: dayName.trim(), weekday: dayWeekday })
      toast.success('Día actualizado')
    } else {
      await addDay(routine.id, dayName.trim(), dayWeekday)
      toast.success('Día agregado')
    }
    setDayModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/rutinas')}
          aria-label="Volver"
          className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold">Editar rutina</h1>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label, index) => {
          const day = days.find((d) => d.weekday === index + 1)
          return (
            <div
              key={label}
              className={`rounded-lg py-1.5 text-center text-[10px] ${
                day
                  ? 'bg-emerald-500/15 font-semibold text-emerald-500'
                  : 'bg-slate-100 text-gray-400 dark:bg-slate-800'
              }`}
            >
              <p>{label}</p>
              <p className="truncate px-0.5">{day ? day.name : '—'}</p>
            </div>
          )
        })}
      </div>

      <Card className="flex flex-col gap-3">
        <Input
          label="Nombre de la rutina"
          value={routine.name}
          onChange={(event) => updateRoutine(routine.id, { name: event.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Objetivo
            <select
              value={routine.goal}
              onChange={(event) => updateRoutine(routine.id, { goal: event.target.value as TrainingGoal })}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              {(Object.keys(GOAL_LABELS) as TrainingGoal[]).map((goal) => (
                <option key={goal} value={goal}>{GOAL_LABELS[goal]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Estructura
            <select
              value={routine.split}
              onChange={(event) => updateRoutine(routine.id, { split: event.target.value as RoutineSplit })}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              {(Object.keys(SPLIT_LABELS) as RoutineSplit[]).map((split) => (
                <option key={split} value={split}>{SPLIT_LABELS[split]}</option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {days.map((day) => (
        <div key={day.id} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">{day.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {WEEKDAY_LABELS[(day.weekday ?? 1) - 1]} ·{' '}
                {day.targetMuscles.join(', ') || 'Sin músculos definidos'}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => openEditDay(day)}
                aria-label="Editar día"
                className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => setDeleteDayId(day.id)}
                aria-label="Eliminar día"
                className="rounded p-2 text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          <DayCard day={day} />
        </div>
      ))}

      <Button variant="secondary" onClick={openAddDay}>
        <Plus size={16} /> Agregar día
      </Button>

      <Modal
        open={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        title={editDayId ? 'Editar día' : 'Agregar día'}
      >
        <div className="flex flex-col gap-3">
          <Input label="Nombre" value={dayName} onChange={(event) => setDayName(event.target.value)} />
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Día de la semana
            <select
              value={dayWeekday}
              onChange={(event) => setDayWeekday(Number(event.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              {WEEKDAY_LABELS.map((label, index) => (
                <option key={label} value={index + 1}>{label}</option>
              ))}
            </select>
          </label>
          <Button onClick={saveDay}>{editDayId ? 'Guardar' : 'Agregar'}</Button>
        </div>
      </Modal>

      <Modal open={deleteDayId !== null} onClose={() => setDeleteDayId(null)} title="Eliminar día">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Se eliminarán también los ejercicios de este día. ¿Continuar?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteDayId(null)}>Cancelar</Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (deleteDayId) {
                await deleteDay(deleteDayId)
                toast.success('Día eliminado')
              }
              setDeleteDayId(null)
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}