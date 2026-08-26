import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { generatePlan, type AdvisorAnswers } from '../../utils/planGenerator'
import { useRoutineStore } from '../../stores/routineStore'
import type { TrainingGoal } from '../../types'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

interface Option {
  value: string
  label: string
  desc?: string
}

const STEPS: { key: keyof AdvisorAnswers; title: string; multi?: boolean; options: Option[] }[] = [
  {
    key: 'goal',
    title: '¿Cuál es tu objetivo principal?',
    options: [
      { value: 'hipertrofia', label: 'Ganar músculo' },
      { value: 'fuerza', label: 'Ganar fuerza' },
      { value: 'definicion', label: 'Definir (perder grasa)' },
      { value: 'mantenimiento', label: 'Salud y mantenimiento' },
    ],
  },
  {
    key: 'daysPerWeek',
    title: '¿Cuántos días vas a entrenar por semana?',
    options: [2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} días` })),
  },
  {
    key: 'experience',
    title: 'Tu experiencia entrenando:',
    options: [
      { value: 'principiante', label: 'Principiante', desc: 'Menos de 1 año o retomando' },
      { value: 'intermedio', label: 'Intermedio', desc: '1 a 3 años constantes' },
      { value: 'avanzado', label: 'Avanzado', desc: 'Más de 3 años' },
    ],
  },
  {
    key: 'timePerSession',
    title: '¿Cuánto tiempo tenés por sesión?',
    options: [
      { value: 'corta', label: 'Hasta 45 minutos' },
      { value: 'media', label: '60 a 75 minutos' },
      { value: 'larga', label: '90 minutos o más' },
    ],
  },
  {
    key: 'equipment',
    title: '¿Dónde vas a entrenar?',
    options: [
      { value: 'gym', label: 'Gimnasio completo' },
      { value: 'basico', label: 'Gimnasio básico (sin poleas)' },
      { value: 'casa', label: 'En casa (mancuernas / peso corporal)' },
    ],
  },
  {
    key: 'limitations',
    title: '¿Alguna molestia o limitación?',
    multi: true,
    options: [
      { value: 'ninguna', label: 'Ninguna' },
      { value: 'rodillas', label: 'Rodillas' },
      { value: 'hombros', label: 'Hombros' },
      { value: 'espalda', label: 'Zona lumbar' },
    ],
  },
]

export function AdvisorPage() {
  const navigate = useNavigate()
  const createFromTemplateDef = useRoutineStore((state) => state.createFromTemplateDef)
  const [step, setStep] = useState(0)
  const [summary, setSummary] = useState<ReturnType<typeof generatePlan> | null>(null)
  const [answers, setAnswers] = useState<AdvisorAnswers>({
    goal: 'hipertrofia',
    daysPerWeek: 4,
    experience: 'principiante',
    timePerSession: 'media',
    equipment: 'gym',
    limitations: [],
  })

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const select = (option: Option) => {
    const next: AdvisorAnswers = { ...answers }
    if (current.multi) {
      if (option.value === 'ninguna') {
        next.limitations = []
      } else {
        next.limitations = next.limitations.includes(option.value)
          ? next.limitations.filter((l) => l !== option.value)
          : [...next.limitations, option.value]
      }
      setAnswers(next)
      return
    }
    if (current.key === 'daysPerWeek') next.daysPerWeek = Number(option.value)
    else if (current.key === 'goal') next.goal = option.value as TrainingGoal
    else if (current.key === 'experience') next.experience = option.value as AdvisorAnswers['experience']
    else if (current.key === 'timePerSession') next.timePerSession = option.value as AdvisorAnswers['timePerSession']
    else if (current.key === 'equipment') next.equipment = option.value as AdvisorAnswers['equipment']
    setAnswers(next)
    if (isLast) {
      setSummary(generatePlan(next))
    } else {
      setStep(step + 1)
    }
  }

  const toggleLimitation = (option: Option) => {
    if (isLast && current.multi) {
      // en el último paso multi, el avance es con el botón Continuar
    }
    select(option)
  }

  if (summary) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-emerald-500" />
          <h1 className="text-xl font-bold">Tu plan sugerido</h1>
        </div>
        <Card className="flex flex-col gap-3">
          <p className="text-sm font-bold">
            {summary.plan.days.length} días · {summary.plan.days.map((d) => d.name).join(' / ')}
          </p>
          {summary.notes.map((note) => (
            <p key={note} className="text-xs text-gray-500 dark:text-gray-400">• {note}</p>
          ))}
        </Card>
        <div className="flex flex-col gap-2">
          {summary.plan.days.map((day) => (
            <Card key={day.name} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{day.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{day.muscles.join(', ')}</p>
              </div>
              <span className="text-xs text-gray-500">{day.exercises.length} ejercicios</span>
            </Card>
          ))}
        </div>
        <Button
          size="lg"
          onClick={async () => {
            await createFromTemplateDef(summary.plan)
            toast.success('¡Rutina creada! Ya podés entrenar con ella.')
            navigate('/rutinas')
          }}
        >
          Crear mi rutina
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setSummary(null)
            setStep(0)
          }}
        >
          Volver a empezar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            aria-label="Volver"
            className="rounded-full bg-slate-100 p-2 dark:bg-slate-800"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <h1 className="text-lg font-bold">Asesor inteligente</h1>
        <span className="ml-auto text-xs text-gray-500">{step + 1}/{STEPS.length}</span>
      </div>

      <h2 className="text-base font-semibold">{current.title}</h2>

      <div className="flex flex-col gap-2">
        {current.options.map((option) => {
          const active = current.multi
            ? answers.limitations.includes(option.value)
            : String(answers[current.key] ?? '') === option.value
          return (
            <button
              key={option.value}
              onClick={() => (current.multi && isLast ? toggleLimitation(option) : select(option))}
              className={`rounded-xl p-4 text-left shadow-sm transition-colors ${
                active
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white hover:bg-emerald-500/10 dark:bg-slate-800'
              }`}
            >
              <p className="font-semibold">{option.label}</p>
              {option.desc && (
                <p className={`text-xs ${active ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {option.desc}
                </p>
              )}
            </button>
          )
        })}
      </div>

      {current.multi && (
        <Button
          onClick={() => {
            if (isLast) setSummary(generatePlan(answers))
            else setStep(step + 1)
          }}
        >
          Continuar
        </Button>
      )}
    </div>
  )
}