export type TrainingGoal = 'hipertrofia' | 'fuerza' | 'definicion' | 'volumen' | 'mantenimiento'
export type RoutineSplit = 'ppl' | 'weider' | 'torso_pierna' | 'full_body' | 'upper_lower' | 'personalizado'
export type MovementPattern = 'empuje' | 'tiron' | 'bisagra' | 'dominante_rodilla' | 'core' | 'cardio' | 'otro'
export type Equipment = 'barra' | 'mancuernas' | 'maquina' | 'polea' | 'peso_corporal' | 'bandas' | 'otro'
export type Difficulty = 'principiante' | 'intermedio' | 'avanzado'

export interface Profile {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  birthDate?: string
  heightCm?: number
  goal?: TrainingGoal
  createdAt: string
}

export interface Exercise {
  id: string
  userId?: string | null
  name: string
  primaryMuscle: string
  secondaryMuscles: string[]
  movementPattern: MovementPattern
  equipment: Equipment
  description?: string
  videoUrl?: string
  imageUrl?: string
  difficulty: Difficulty
  tags: string[]
  isFavorite: boolean
  isSystem: boolean
  createdAt: string
}

export interface Routine {
  id: string
  userId?: string | null
  name: string
  description?: string
  goal: TrainingGoal
  split: RoutineSplit
  durationWeeks?: number
  isActive: boolean
  createdAt: string
}

export interface RoutineDay {
  id: string
  routineId: string
  dayNumber: number
  weekday?: number
  name: string
  targetMuscles: string[]
  isRestDay: boolean
}

export interface RoutineExercise {
  id: string
  routineDayId: string
  exerciseId: string
  order: number
  setsTarget: number
  repsTarget: string
  weightTargetKg?: number
  rirTarget?: number
  restSeconds: number
  notes?: string
}

export interface WorkoutSet {
  id: string
  workoutExerciseId: string
  setNumber: number
  weightKg: number
  reps: number
  rir?: number
  restSeconds?: number
  notes?: string
  isFailure: boolean
  isCompleted: boolean
  completedAt?: string
}

export interface WorkoutExercise {
  id: string
  workoutSessionId: string
  exerciseId: string
  order: number
}

export interface WorkoutSession {
  id: string
  userId?: string | null
  routineId?: string
  routineDayId?: string
  dayName?: string
  startedAt: string
  endedAt?: string
  durationSeconds?: number
  totalVolumeKg?: number
  notes?: string
  energyLevel?: number
  sleepQuality?: number
  bodyWeightKg?: number
  techniqueFeeling?: 'impecable' | 'bien' | 'costo'
}

export interface Measurement {
  id: string
  userId?: string | null
  date: string
  weightKg: number
  heightCm?: number
  waistCm?: number
  hipsCm?: number
  chestCm?: number
  bicepsCm?: number
  thighCm?: number
  notes?: string
}

export interface UserLink {
  id: string
  userId?: string | null
  title: string
  url: string
  category: string
  isFavorite: boolean
  isSystem: boolean
  createdAt: string
}

export interface PersonalRecord {
  id: string
  userId?: string | null
  exerciseId: string
  recordType: 'max_weight' | 'max_volume_session' | 'max_reps'
  value: number
  achievedAt: string
}

export interface SyncQueueItem {
  id: string
  table: string
  operation: 'insert' | 'update' | 'delete'
  payload: unknown
  createdAt: string
}

export interface ProgressPhoto {
  id: string
  userId?: string | null
  date: string
  view: 'frontal' | 'espalda' | 'izquierda' | 'derecha' | 'otro'
  weightKg?: number
  notes?: string
  dataUrl: string
  createdAt: string
}

export interface WellnessDay {
  id: string
  date: string
  waterGlasses: number
  sleepHours: number
  sunMinutes: number
  nutritionGood: boolean
  temperanceGood: boolean
  airGood: boolean
  trustDone: boolean
  exerciseManual: boolean
  note?: string
}