import { useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import type { TrainingGoal } from '../../types'

const GOALS: { value: TrainingGoal; label: string }[] = [
  { value: 'hipertrofia', label: 'Ganar músculo (hipertrofia)' },
  { value: 'fuerza', label: 'Ganar fuerza' },
  { value: 'definicion', label: 'Definición (perder grasa)' },
  { value: 'volumen', label: 'Volumen limpio' },
  { value: 'mantenimiento', label: 'Mantenerme en forma' },
]

export function ProfilePage() {
  const profile = useAuthStore((state) => state.profile)
  const mode = useAuthStore((state) => state.mode)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const signOut = useAuthStore((state) => state.signOut)

  const [name, setName] = useState(profile?.fullName ?? '')
  const [height, setHeight] = useState(profile?.heightCm?.toString() ?? '')
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? '')
  const [goal, setGoal] = useState<TrainingGoal>(profile?.goal ?? 'hipertrofia')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const heightNumber = height === '' ? undefined : Number(height)
    setSaving(true)
    await updateProfile({
      fullName: name.trim(),
      heightCm: heightNumber,
      birthDate: birthDate || undefined,
      goal,
    })
    setSaving(false)
    toast.success('Perfil actualizado')
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Perfil</h1>

      <Card className="flex flex-col gap-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {mode === 'local'
            ? 'Modo local: tus datos se guardan solo en este dispositivo.'
            : `Cuenta: ${profile?.email}`}
        </p>
        <Input label="Nombre" value={name} onChange={(event) => setName(event.target.value)} />
        <Input
          label="Altura (cm)"
          type="number"
          value={height}
          onChange={(event) => setHeight(event.target.value)}
        />
        <Input
          label="Fecha de nacimiento"
          type="date"
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="goal" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Objetivo principal
          </label>
          <select
            id="goal"
            value={goal}
            onChange={(event) => setGoal(event.target.value as TrainingGoal)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            {GOALS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={save} loading={saving}>
          Guardar cambios
        </Button>
      </Card>

      <Button variant="danger" onClick={() => signOut()}>
        Cerrar sesión
      </Button>
    </div>
  )
}