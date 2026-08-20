import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRoutineStore } from '../../stores/routineStore'
import { GOAL_LABELS, SPLIT_LABELS, TEMPLATES } from '../../data/templates'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'

export function RoutinesPage() {
  const navigate = useNavigate()
  const routines = useRoutineStore((state) => state.routines)
  const daysByRoutine = useRoutineStore((state) => state.daysByRoutine)
  const loaded = useRoutineStore((state) => state.loaded)
  const createFromTemplate = useRoutineStore((state) => state.createFromTemplate)
  const createBlank = useRoutineStore((state) => state.createBlank)
  const duplicateRoutine = useRoutineStore((state) => state.duplicateRoutine)
  const deleteRoutine = useRoutineStore((state) => state.deleteRoutine)
  const setActive = useRoutineStore((state) => state.setActive)

  const [showNew, setShowNew] = useState(false)
  const [blankName, setBlankName] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    useRoutineStore.getState().load()
  }, [])

  const handleTemplate = async (key: string) => {
    setBusy(true)
    await createFromTemplate(key)
    setBusy(false)
    setShowNew(false)
    toast.success('Rutina creada desde plantilla')
  }

  const handleBlank = async () => {
    if (blankName.trim().length < 2) {
      toast.error('Poné un nombre de al menos 2 caracteres')
      return
    }
    setBusy(true)
    const routine = await createBlank(blankName.trim())
    setBusy(false)
    setShowNew(false)
    setBlankName('')
    toast.success('Rutina en blanco creada')
    navigate(`/rutinas/${routine.id}`)
  }

  const routineToDelete = routines.find((r) => r.id === deleteId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Rutinas</h1>
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus size={16} /> Nueva
        </Button>
      </div>

      {!loaded && <p className="text-sm text-gray-500">Cargando…</p>}

      {loaded && routines.length === 0 && (
        <Card className="text-center">
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Todavía no tenés rutinas. Creá una desde una plantilla basada en ciencia o empezá en blanco.
          </p>
          <Button onClick={() => setShowNew(true)}>Crear mi primera rutina</Button>
        </Card>
      )}

      {routines.map((routine) => {
        const days = daysByRoutine[routine.id] ?? []
        return (
          <Card key={routine.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold">{routine.name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{routine.description}</p>
              </div>
              {routine.isActive && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                  <Star size={12} fill="currentColor" /> Activa
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-700">
                {SPLIT_LABELS[routine.split]}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-700">
                {GOAL_LABELS[routine.goal]}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-700">
                {days.length} días
              </span>
            </div>

            <div className="flex gap-2">
              {!routine.isActive && (
                <Button size="sm" variant="secondary" onClick={() => setActive(routine.id)}>
                  Activar
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => navigate(`/rutinas/${routine.id}`)}>
                <Pencil size={14} /> Editar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await duplicateRoutine(routine.id)
                  toast.success('Rutina duplicada')
                }}
              >
                <Copy size={14} /> Duplicar
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(routine.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        )
      })}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nueva rutina">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.key}
                disabled={busy}
                onClick={() => handleTemplate(template.key)}
                className="rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-emerald-500 dark:border-slate-600"
              >
                <p className="text-sm font-semibold">{template.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{template.description}</p>
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2 border-t border-gray-200 pt-4 dark:border-slate-700">
            <div className="flex-1">
              <Input
                label="O rutina en blanco"
                placeholder="Ej: Mi rutina"
                value={blankName}
                onChange={(event) => setBlankName(event.target.value)}
              />
            </div>
            <Button onClick={handleBlank} loading={busy}>
              Crear
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Eliminar rutina">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          ¿Seguro que querés eliminar "{routineToDelete?.name}"? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (deleteId) {
                await deleteRoutine(deleteId)
                toast.success('Rutina eliminada')
              }
              setDeleteId(null)
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}