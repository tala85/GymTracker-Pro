import type { RoutineSplit, TrainingGoal } from '../types'

export const SPLIT_LABELS: Record<RoutineSplit, string> = {
  ppl: 'Push/Pull/Legs',
  weider: 'Weider',
  torso_pierna: 'Torso/Pierna',
  full_body: 'Full Body',
  upper_lower: 'Upper/Lower',
  personalizado: 'Personalizado',
}

export const GOAL_LABELS: Record<TrainingGoal, string> = {
  hipertrofia: 'Hipertrofia',
  fuerza: 'Fuerza',
  definicion: 'Definición',
  volumen: 'Volumen',
  mantenimiento: 'Mantenimiento',
}

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// [nombreEjercicio, series, repeticiones, RIR, descansoSegundos]
type ExerciseDef = [string, number, string, number, number]

interface DayDef {
  name: string
  muscles: string[]
  weekday: number
  exercises: ExerciseDef[]
}

export interface TemplateDef {
  key: string
  name: string
  description: string
  goal: TrainingGoal
  split: RoutineSplit
  days: DayDef[]
}

export const TEMPLATES: TemplateDef[] = [
  {
    key: 'ppl-5',
    name: 'PPL Frecuencia 2 (5 días)',
    description: 'Empuje/Tirón/Piernas con segunda exposición semanal. Ideal hipertrofia.',
    goal: 'hipertrofia',
    split: 'ppl',
    days: [
      { name: 'Empuje A', muscles: ['Pecho', 'Hombros', 'Tríceps'], weekday: 1, exercises: [
        ['Press banca plano', 3, '6-8', 1, 120],
        ['Press inclinado con mancuernas', 3, '10-12', 1, 90],
        ['Cruce de poleas', 3, '10-12', 1, 90],
        ['Press militar con mancuernas', 3, '10-12', 1, 90],
        ['Elevaciones laterales', 4, '12-15', 1, 60],
        ['Extensión de tríceps en polea', 3, '10-12', 1, 90],
      ]},
      { name: 'Tirón A', muscles: ['Espalda', 'Bíceps'], weekday: 2, exercises: [
        ['Dominadas', 3, '6-8', 1, 120],
        ['Jalón al pecho', 3, '10-12', 0, 90],
        ['Remo con barra', 3, '10-12', 1, 120],
        ['Curl predicador', 3, '10-12', 0, 90],
        ['Curl martillo', 3, '10-12', 1, 90],
        ['Rueda abdominal', 3, '12-15', 1, 60],
      ]},
      { name: 'Piernas A', muscles: ['Cuádriceps', 'Isquiotibiales', 'Glúteos'], weekday: 3, exercises: [
        ['Sentadilla libre', 3, '6-8', 1, 150],
        ['Sentadilla hack', 3, '8-10', 1, 120],
        ['Sentadilla búlgara', 3, '10-12', 1, 90],
        ['Curl femoral sentado', 3, '10-12', 0, 90],
        ['Peso muerto rumano', 3, '8-10', 1, 120],
        ['Elevación de talones de pie', 4, '12-15', 1, 60],
      ]},
      { name: 'Empuje B', muscles: ['Hombros', 'Pecho', 'Tríceps'], weekday: 5, exercises: [
        ['Press en máquina', 3, '8-10', 1, 120],
        ['Press banca plano', 3, '8-10', 1, 120],
        ['Aperturas con mancuernas', 3, '10-12', 1, 90],
        ['Press militar con barra', 3, '8-10', 1, 120],
        ['Elevaciones laterales en polea', 4, '12-15', 1, 60],
        ['Press francés con mancuernas', 3, '10-12', 1, 90],
      ]},
      { name: 'Tirón B', muscles: ['Espalda', 'Bíceps'], weekday: 6, exercises: [
        ['Remo en máquina', 3, '10-12', 0, 90],
        ['Jalón al pecho', 3, '8-10', 1, 120],
        ['Remo en polea baja', 3, '10-12', 1, 90],
        ['Face pull', 3, '12-15', 1, 60],
        ['Curl con barra', 3, '8-10', 1, 90],
        ['Crunch', 3, '12-15', 1, 60],
      ]},
    ],
  },
  {
    key: 'weider-5',
    name: 'Weider Clásico (5 días)',
    description: 'Un grupo muscular principal por día. Máxima conexión mente-músculo.',
    goal: 'hipertrofia',
    split: 'weider',
    days: [
      { name: 'Pecho', muscles: ['Pecho'], weekday: 1, exercises: [
        ['Press banca plano', 3, '6-8', 1, 120],
        ['Press inclinado con mancuernas', 3, '10-12', 1, 90],
        ['Press en máquina', 3, '10-12', 1, 90],
        ['Cruce de poleas', 3, '10-12', 1, 90],
        ['Fondos en paralelas', 2, '10-12', 1, 90],
        ['Flexiones', 2, '12-15', 2, 60],
      ]},
      { name: 'Espalda', muscles: ['Espalda'], weekday: 2, exercises: [
        ['Dominadas', 3, '6-8', 1, 120],
        ['Remo con barra', 3, '8-10', 1, 120],
        ['Jalón al pecho', 3, '10-12', 0, 90],
        ['Remo con mancuerna', 3, '10-12', 1, 90],
        ['Pull over en polea', 3, '10-12', 1, 90],
        ['Hiperextensiones', 3, '10-12', 1, 90],
      ]},
      { name: 'Hombros y Core', muscles: ['Hombros', 'Core'], weekday: 3, exercises: [
        ['Press militar con barra', 3, '8-10', 1, 120],
        ['Elevaciones laterales', 4, '12-15', 1, 60],
        ['Pájaros con mancuernas', 3, '12-15', 1, 60],
        ['Elevaciones frontales', 3, '10-12', 1, 60],
        ['Crunch', 3, '12-15', 1, 60],
        ['Pallof press', 3, '12-15', 1, 60],
      ]},
      { name: 'Piernas', muscles: ['Cuádriceps', 'Isquiotibiales', 'Glúteos'], weekday: 4, exercises: [
        ['Sentadilla libre', 3, '6-8', 1, 150],
        ['Prensa 45', 3, '10-12', 1, 120],
        ['Peso muerto rumano', 3, '8-10', 1, 120],
        ['Curl femoral tumbado', 3, '10-12', 0, 90],
        ['Hip thrust', 3, '8-10', 1, 120],
        ['Elevación de talones sentado', 4, '12-15', 1, 60],
      ]},
      { name: 'Brazos', muscles: ['Bíceps', 'Tríceps'], weekday: 5, exercises: [
        ['Curl con barra', 3, '8-10', 1, 90],
        ['Press francés con mancuernas', 3, '10-12', 1, 90],
        ['Curl predicador', 3, '10-12', 0, 90],
        ['Extensión de tríceps en polea', 3, '10-12', 0, 90],
        ['Curl martillo', 3, '10-12', 1, 90],
        ['Tríceps overhead en polea', 3, '10-12', 1, 90],
      ]},
    ],
  },
  {
    key: 'torso-pierna-5',
    name: 'Torso/Pierna + Enfoque (5 días)',
    description: 'Alterna torso y pierna con un día para puntos débiles. Muy flexible.',
    goal: 'hipertrofia',
    split: 'torso_pierna',
    days: [
      { name: 'Torso A', muscles: ['Pecho', 'Espalda', 'Hombros'], weekday: 1, exercises: [
        ['Press banca plano', 3, '6-8', 1, 120],
        ['Jalón al pecho', 3, '8-10', 1, 120],
        ['Press inclinado con mancuernas', 3, '10-12', 1, 90],
        ['Remo con barra', 3, '10-12', 1, 90],
        ['Elevaciones laterales', 3, '12-15', 1, 60],
        ['Curl con barra', 3, '10-12', 1, 90],
      ]},
      { name: 'Pierna A', muscles: ['Cuádriceps', 'Isquiotibiales', 'Glúteos'], weekday: 2, exercises: [
        ['Sentadilla libre', 3, '6-8', 1, 150],
        ['Peso muerto rumano', 3, '8-10', 1, 120],
        ['Zancadas', 3, '10-12', 1, 90],
        ['Curl femoral sentado', 3, '10-12', 0, 90],
        ['Hip thrust', 3, '8-10', 1, 120],
        ['Elevación de talones de pie', 4, '12-15', 1, 60],
      ]},
      { name: 'Torso B', muscles: ['Hombros', 'Espalda', 'Pecho'], weekday: 4, exercises: [
        ['Press militar con barra', 3, '8-10', 1, 120],
        ['Remo en máquina', 3, '10-12', 0, 90],
        ['Cruce de poleas', 3, '10-12', 1, 90],
        ['Dominadas', 3, '6-8', 1, 120],
        ['Pájaros con mancuernas', 3, '12-15', 1, 60],
        ['Extensión de tríceps en polea', 3, '10-12', 0, 90],
      ]},
      { name: 'Pierna B', muscles: ['Isquiotibiales', 'Glúteos', 'Cuádriceps'], weekday: 5, exercises: [
        ['Sentadilla hack', 3, '8-10', 1, 120],
        ['Sentadilla búlgara', 3, '10-12', 1, 90],
        ['Curl femoral tumbado', 3, '10-12', 0, 90],
        ['Abductores en máquina', 3, '12-15', 1, 60],
        ['Puente de glúteo', 3, '10-12', 1, 90],
        ['Pantorrillas en prensa', 4, '12-15', 1, 60],
      ]},
      { name: 'Enfoque (brazos y hombros)', muscles: ['Bíceps', 'Tríceps', 'Hombros'], weekday: 6, exercises: [
        ['Elevaciones laterales', 4, '12-15', 1, 60],
        ['Curl predicador', 3, '10-12', 0, 90],
        ['Press francés con mancuernas', 3, '10-12', 1, 90],
        ['Curl martillo', 3, '10-12', 1, 90],
        ['Tríceps overhead en polea', 3, '10-12', 1, 90],
        ['Elevaciones laterales en polea', 3, '12-15', 1, 60],
      ]},
    ],
  },
  {
    key: 'fullbody-3',
    name: 'Full Body (3 días)',
    description: 'Cuerpo completo lunes, miércoles y viernes. Ideal principiantes.',
    goal: 'mantenimiento',
    split: 'full_body',
    days: [
      { name: 'Full Body A', muscles: ['Cuerpo completo'], weekday: 1, exercises: [
        ['Sentadilla libre', 3, '6-8', 1, 150],
        ['Press banca plano', 3, '6-8', 1, 120],
        ['Remo con barra', 3, '8-10', 1, 120],
        ['Elevaciones laterales', 3, '12-15', 1, 60],
        ['Crunch', 3, '12-15', 1, 60],
      ]},
      { name: 'Full Body B', muscles: ['Cuerpo completo'], weekday: 3, exercises: [
        ['Peso muerto', 3, '6-8', 1, 150],
        ['Press militar con barra', 3, '8-10', 1, 120],
        ['Jalón al pecho', 3, '10-12', 0, 90],
        ['Zancadas', 3, '10-12', 1, 90],
        ['Curl martillo', 3, '10-12', 1, 90],
      ]},
      { name: 'Full Body C', muscles: ['Cuerpo completo'], weekday: 5, exercises: [
        ['Prensa 45', 3, '10-12', 1, 120],
        ['Press inclinado con mancuernas', 3, '10-12', 1, 90],
        ['Remo en polea baja', 3, '10-12', 1, 90],
        ['Hip thrust', 3, '8-10', 1, 120],
        ['Elevación de talones de pie', 4, '12-15', 1, 60],
      ]},
    ],
  },
  {
    key: 'upper-lower-4',
    name: 'Upper/Lower (4 días)',
    description: 'Torso y pierna alternados. El mejor equilibrio resultado/tiempo.',
    goal: 'hipertrofia',
    split: 'upper_lower',
    days: [
      { name: 'Upper A', muscles: ['Pecho', 'Espalda', 'Hombros'], weekday: 1, exercises: [
        ['Press banca plano', 3, '6-8', 1, 120],
        ['Remo con barra', 3, '8-10', 1, 120],
        ['Press militar con mancuernas', 3, '10-12', 1, 90],
        ['Jalón al pecho', 3, '10-12', 0, 90],
        ['Curl con barra', 3, '10-12', 1, 90],
        ['Extensión de tríceps en polea', 3, '10-12', 0, 90],
      ]},
      { name: 'Lower A', muscles: ['Cuádriceps', 'Isquiotibiales', 'Glúteos'], weekday: 2, exercises: [
        ['Sentadilla libre', 3, '6-8', 1, 150],
        ['Peso muerto rumano', 3, '8-10', 1, 120],
        ['Sentadilla búlgara', 3, '10-12', 1, 90],
        ['Curl femoral sentado', 3, '10-12', 0, 90],
        ['Elevación de talones de pie', 4, '12-15', 1, 60],
      ]},
      { name: 'Upper B', muscles: ['Pecho', 'Espalda', 'Hombros'], weekday: 4, exercises: [
        ['Press inclinado con mancuernas', 3, '8-10', 1, 120],
        ['Dominadas', 3, '6-8', 1, 120],
        ['Elevaciones laterales', 4, '12-15', 1, 60],
        ['Remo en polea baja', 3, '10-12', 1, 90],
        ['Curl predicador', 3, '10-12', 0, 90],
        ['Press francés con mancuernas', 3, '10-12', 1, 90],
      ]},
      { name: 'Lower B', muscles: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'], weekday: 5, exercises: [
        ['Sentadilla hack', 3, '8-10', 1, 120],
        ['Hip thrust', 3, '8-10', 1, 120],
        ['Zancadas', 3, '10-12', 1, 90],
        ['Curl femoral tumbado', 3, '10-12', 0, 90],
        ['Elevación de talones sentado', 4, '12-15', 1, 60],
      ]},
    ],
  },
]