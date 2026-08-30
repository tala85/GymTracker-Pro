// Mapeo de nombres de ejercicios en español a nombres en la API
// API: https://github.com/JahelCuadrado/ExerciseGymGifsDB

export const EXERCISE_NAME_MAPPING: Record<string, string> = {
  // PECHO
  'Press banca plano': 'Barbell Bench Press',
  'Press inclinado con mancuernas': 'Incline Dumbbell Press',
  'Press declinado': 'Decline Bench Press',
  'Flexiones': 'Push-up',
  'Fondos en paralelas': 'Dip',
  'Aperturas con mancuernas': 'Dumbbell Fly',
  'Cruce de poleas': 'Cable Crossover',
    
  // ESPALDA
  'Dominadas': 'Pull-up',
  'Jalón al pecho': 'Lat Pulldown',
  'Remo con barra': 'Barbell Row',
  'Remo con mancuerna': 'One-Arm Dumbbell Row',
  'Peso muerto': 'Deadlift',
  'Face pull': 'Face Pull',
  'Remo en polea baja': 'Seated Cable Row',
  'Dominadas agarre cerrado': 'Close-Grip Pull-up',
  'Jalón al pecho agarre cerrado': 'Close-Grip Lat Pulldown',
  
  // HOMBROS
  'Press militar con barra': 'Overhead Press',
  'Press militar con mancuernas': 'Dumbbell Shoulder Press',
  'Elevaciones laterales': 'Lateral Raise',
  'Elevaciones frontales': 'Front Raise',
  'Pájaros con mancuernas': 'Rear Delt Fly',
  'Press Arnold': 'Arnold Press',
  'Encogimientos con barra': 'Barbell Shrug',
  'Encogimientos con mancuernas': 'Dumbbell Shrug',
  
  // PIERNAS - CUÁDRICEPS
  'Sentadilla': 'Barbell Squat',
  'Sentadilla con mancuernas': 'Goblet Squat',
  'Zancadas': 'Lunge',
  'Sentadilla búlgara': 'Bulgarian Split Squat',
  'Prensa': 'Leg Press',
  'Extensiones de cuádriceps': 'Leg Extension',
  'Sentadilla frontal': 'Front Squat',
  
  // PIERNAS - ISQUIOTIBIALES/GLÚTEOS
  'Peso muerto rumano': 'Romanian Deadlift',
  'Curl femoral tumbado': 'Lying Leg Curl',
  'Curl femoral sentado': 'Seated Leg Curl',
  'Hip thrust': 'Hip Thrust',
  'Puente de glúteos': 'Glute Bridge',
  'Peso muerto pierna rígida': 'Stiff-Legged Deadlift',
  
  // BÍCEPS
  'Curl con barra': 'Barbell Curl',
  'Curl con mancuernas': 'Dumbbell Curl',
  'Curl martillo': 'Hammer Curl',
  'Curl predicador': 'Preacher Curl',
  'Curl concentrado': 'Concentration Curl',
  'Curl en polea baja': 'Cable Curl',
  'Curl Zottman': 'Zottman Curl',
  
  // TRÍCEPS
  'Press francés': 'Skullcrusher',
  'Extensiones de tríceps': 'Triceps Extension',
  'Fondos en banco': 'Bench Dip',
  'Patada de tríceps': 'Triceps Kickback',
  'Press banca agarre cerrado': 'Close-Grip Bench Press',
  'Extensiones en polea': 'Triceps Pushdown',
  
  // CORE
  'Plancha': 'Plank',
  'Plancha lateral': 'Side Plank',
  'Crunch': 'Crunch',
  'Crunch en polea': 'Cable Crunch',
  'Elevación de piernas colgado': 'Hanging Leg Raise',
  'Elevación de talones de pie': 'Standing Calf Raise',
  'Elevación de talones sentado': 'Seated Calf Raise',
  'Abductores en máquina': 'Hip Abduction',
  'Aductores en máquina': 'Hip Adduction',
  
  // CARDIO
  'Cinta de correr': 'Treadmill',
  'Bicicleta': 'Bicycle',
  'Elíptica': 'Elliptical',
  'Cuerda': 'Jump Rope',
}

// Función para obtener el nombre en la API
export function getApiExerciseName(spanishName: string): string {
  return EXERCISE_NAME_MAPPING[spanishName] || spanishName
}