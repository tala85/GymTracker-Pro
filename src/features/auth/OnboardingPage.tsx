import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Dumbbell, TrendingUp } from 'lucide-react'
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

function Feature({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
      <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">{icon}</span>
      {text}
    </div>
  )
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const [name, setName] = useState('')
  const [height, setHeight] = useState('')
  const [goal, setGoal] = useState<TrainingGoal>('hipertrofia')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const finish = async () => {
    if (name.trim().length < 2) {
      setError('Escribí tu nombre (mínimo 2 caracteres)')
      return
    }
    const heightNumber = height === '' ? undefined : Number(height)
    if (heightNumber !== undefined && (Number.isNaN(heightNumber) || heightNumber < 100 || heightNumber > 250)) {
      setError('La altura debe estar entre 100 y 250 cm')
      return
    }
    setSaving(true)
    await updateProfile({ fullName: name.trim(), heightCm: heightNumber, goal })
    toast.success(`¡Bienvenido, ${name.trim()}!`)
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex flex-col gap-3">
          <Feature icon={<CalendarDays size={18} />} text="Armá tu rutina con los días que quieras" />
          <Feature icon={<Dumbbell size={18} />} text="Registrá series, repeticiones, peso y descansos" />
          <Feature icon={<TrendingUp size={18} />} text="Seguí tus medidas y tu progreso en gráficos" />
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Tu nombre"
            placeholder="Ej: Alex"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError('')
            }}
          />
          <Input
            label="Altura (cm) - opcional"
            type="number"
            placeholder="Ej: 175"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
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
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button size="lg" onClick={finish} loading={saving}>
            Comenzar
          </Button>
        </div>
      </Card>
    </div>
  )
}