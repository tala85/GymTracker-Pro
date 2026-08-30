export interface ExerciseMedia {
  gifUrl?: string
  imageUrl?: string
}

export const EXERCISE_MEDIA: Record<string, ExerciseMedia> = {
  'Press banca plano': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/BENCH_PRESS-1.gif'
  },
  'Sentadilla': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/SQUAT-1.gif'
  },
  'Peso muerto': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/DEADLIFT-1.gif'
  },
  'Dominadas': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/PULL_UP-1.gif'
  },
  'Press militar con barra': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/OVERHEAD_PRESS-1.gif'
  },
  'Remo con barra': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/BAR_ROW-1.gif'
  },
  'Curl con barra': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/BAR_CURL-1.gif'
  },
  'Press francés': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/TRICEP_EXTENSION-1.gif'
  },
  'Elevaciones laterales': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/LATERAL_RAISE-1.gif'
  },
  'Face pull': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/FACE_PULL-1.gif'
  },
  'Flexiones': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/PUSH_UP-1.gif'
  },
  'Fondos en paralelas': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/DIP-1.gif'
  },
  'Zancadas': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/LUNGE-1.gif'
  },
  'Hip thrust': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/HIP_THRUST-1.gif'
  },
  'Plancha': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/PLANK-1.gif'
  },
  'Curl con mancuernas': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/DUMBBELL_CURL-1.gif'
  },
  'Press inclinado con mancuernas': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/INCLINE_DUMBBELL_PRESS-1.gif'
  },
  'Aperturas con mancuernas': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/DUMBBELL_FLY-1.gif'
  },
  'Press Arnold': {
    gifUrl: 'https://burnfit.io/en/wp-content/uploads/sites/3/2026/01/ARNOLD_PRESS-1.gif'
  },
}

export function getExerciseMedia(exerciseName: string): ExerciseMedia | undefined {
  return EXERCISE_MEDIA[exerciseName]
}