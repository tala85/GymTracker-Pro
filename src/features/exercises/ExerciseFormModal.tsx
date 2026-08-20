import { useState } from 'react'
import { toast } from 'sonner'
import { exerciseFormSchema } from '../../lib/validators'
import { useExerciseStore } from '../../stores/exerciseStore'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, PATTERN_LABELS } from '../../utils/labels'
import type { Difficulty, Equipment, MovementPattern } from '../../types'

const OTHER = '__otro__'

const SELECT_CLASS =
  'rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white'

interface ExerciseFormModalProps {
  open: boolean
  onClose: () => void
  muscles: string[]
}

export function ExerciseFormModal({ open, onClose, muscles }: ExerciseFormModalProps) {
  const addCustom = useExerciseStore((state) => state.addCustom)

  const [name, setName] = useState('')
  const [muscleChoice, setMuscleChoice] = useState('')
  const [customMuscle, setCustomMuscle] = useState('')
  const [pattern, setPattern] = useState<MovementPattern>('otro')
  const [equipment, setEquipment] = useState<Equipment>('maquina')
  const [difficulty, setDifficulty] = useState<Difficulty>('principiante')
  const [videoUrl, setVideoUrl] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const finalMuscle = muscleChoice === OTHER ? customMuscle.trim() : muscleChoice

  const reset = () => {
    setName('')
    setMuscleChoice('')
    setCustomMuscle('')
    setPattern('otro')
    setEquipment('maquina')
    setDifficulty('principiante')
    setVideoUrl('')
    setDescription('')
    setErrors({})
  }

  const submit = async () => {
    const result = exerciseFormSchema.safeParse({
      name,
      primaryMuscle: finalMuscle,
      description: description || undefined,
      videoUrl,
    })
    if (!result.success) {
      const map: Record<string, string> = {}
      for (const issue of result.error.issues) {
        map[String(issue.path[0])] = issue.message
      }
      setErrors(map)
      return
    }
    await addCustom({
      name: name.trim(),
      primaryMuscle: finalMuscle,
      secondaryMuscles: [],
      movementPattern: pattern,
      equipment,
      difficulty,
      description: description.trim() || undefined,
      videoUrl: videoUrl || undefined,
      imageUrl: undefined,
      tags: ['personalizado'],
    })
    toast.success('Ejercicio creado')
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo ejercicio">
      <div className="flex flex-col gap-3">
        <Input
          label="Nombre *"
          placeholder="Ej: Press landmine"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Grupo muscular *</label>
          <select value={muscleChoice} onChange={(event) => setMuscleChoice(event.target.value)} className={SELECT_CLASS}>
            <option value="">Elegí un grupo…</option>
            {muscles.filter((m) => m !== 'Todos').map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
            <option value={OTHER}>Otro (escribir nuevo)</option>
          </select>
          {errors.primaryMuscle && <p className="text-xs text-red-500">{errors.primaryMuscle}</p>}
        </div>
        {muscleChoice === OTHER && (
          <Input
            label="Nuevo grupo muscular"
            placeholder="Ej: Antebrazo"
            value={customMuscle}
            onChange={(event) => setCustomMuscle(event.target.value)}
          />
        )}
        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Patrón
            <select value={pattern} onChange={(event) => setPattern(event.target.value as MovementPattern)} className={SELECT_CLASS}>
              {Object.entries(PATTERN_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Equipo
            <select value={equipment} onChange={(event) => setEquipment(event.target.value as Equipment)} className={SELECT_CLASS}>
              {Object.entries(EQUIPMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Nivel
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)} className={SELECT_CLASS}>
              {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
        <Input
          label="Video de YouTube"
          placeholder="https://youtube.com/watch?v=…"
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          error={errors.videoUrl}
        />
        <Input
          label="Descripción (opcional)"
          placeholder="Consejos de técnica…"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          error={errors.description}
        />
        <Button onClick={submit}>Crear ejercicio</Button>
      </div>
    </Modal>
  )
}