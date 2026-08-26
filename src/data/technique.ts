import type { Exercise } from '../types'

export interface TechniqueInfo {
  cues: string[]
  mistakes: string[]
  safety: string
}

const BY_PATTERN: Record<string, TechniqueInfo> = {
  empuje: {
    cues: [
      'Escápulas firmes y pecho abierto antes de empujar',
      'Core apretado durante todo el recorrido',
      'Controlá la bajada: 2 a 3 segundos',
      'Codos a ~45° del torso en los presses',
    ],
    mistakes: [
      'Rebotar la carga contra el pecho',
      'Arquear demasiado la lumbar',
      'Abrir los codos a 90° (estresa el hombro)',
    ],
    safety: 'Si sentís pinzamiento en el hombro, reducí el rango o el peso antes de seguir.',
  },
  tiron: {
    cues: [
      'Iniciá el tirón desde la espalda, no desde los brazos',
      'Pecho afuera y columna neutra',
      'Tirá los codos hacia atrás o hacia abajo',
      'Apretá 1 segundo arriba, sin balanceo',
    ],
    mistakes: [
      'Balancear el torso para subir el peso',
      'Encoger los hombros hacia las orejas',
      'Tirar solo con bíceps sin activar dorsales',
    ],
    safety: 'El tirón se siente en los dorsales; si solo sentís bíceps o lumbar, bajá el peso y reajustá la postura.',
  },
  bisagra: {
    cues: [
      'La cadera va hacia atrás y el pecho queda "orgulloso"',
      'La carga viaja pegada al cuerpo',
      'Rodillas semiflexionadas, no bloqueadas',
      'Empujá el piso con los pies al subir',
    ],
    mistakes: [
      'Redondear la lumbar',
      'Convertirlo en sentadilla (flexionar demasiado rodillas)',
      'Alejar la carga del cuerpo',
    ],
    safety: 'La lumbar nunca se redondea: si no podés mantenerla neutra, reducí rango o peso.',
  },
  dominante_rodilla: {
    cues: [
      'Rodilla alineada con la punta del pie',
      'Bajá como sentándote en una silla',
      'Talón apoyado: empujá el piso',
      'Core firme y mirada al frente',
    ],
    mistakes: [
      'Rodillas que colapsan hacia adentro',
      'Talones que se despegan del piso',
      'Rebotar abajo para subir',
    ],
    safety: 'Si la rodilla duele (no el ardor normal de esfuerzo), pará: reducí profundidad o peso y revisá la técnica.',
  },
  core: {
    cues: [
      'Columna neutra: ni te arquees ni te aplastes',
      'Respirá sin perder la tensión',
      'Calidad antes que tiempo o repeticiones',
    ],
    mistakes: [
      'Tirar del cuello con las manos',
      'Arquear la lumbar en planchas',
      'Hacerlo rápido y sin control',
    ],
    safety: 'El core se entrena con tensión, no con dolor lumbar: si duele la espalda, volvé a una variante más fácil.',
  },
  cardio: {
    cues: [
      'Empezá con 5 minutos de intensidad baja',
      'Postura erguida y zancada controlada',
      'Deberías poder hablar con dificultad moderada',
    ],
    mistakes: ['Arrancar demasiado fuerte', 'Colgarse de los pasamanos en la cinta'],
    safety: 'Mareos o presión en el pecho = parar y consultar. El cardio se progresa de a poco.',
  },
  otro: {
    cues: ['Dominá la técnica antes de cargar peso', 'Movimiento lento y controlado', 'Respirá: exhala en el esfuerzo'],
    mistakes: ['Usar impulso para mover el peso', 'Sacrificar rango por más carga'],
    safety: 'Ante dolor articular agudo, detenete: el ardor muscular es normal, el dolor punzante no.',
  },
}

const OVERRIDES: Record<string, Partial<TechniqueInfo>> = {
  'Sentadilla libre': {
    cues: [
      'Barra sobre los trapecios, agarre firme y escápulas juntas',
      'Bajá hasta donde tu movilidad permita la lumbar neutra',
      'Rodillas hacia afuera siguiendo la punta de los pies',
      'Subí empujando el piso y con el pecho arriba',
    ],
    mistakes: ['Valgo de rodillas al subir', 'Buenos días: la cadera sube antes que el pecho', 'Despegar talones'],
  },
  'Press banca plano': {
    cues: [
      'Cinco apoyos: cabeza, espalda, glúteo y ambos pies',
      'Escápulas juntas y pecho alto',
      'La barra baja al pecho medio y sube en línea',
      'Muñecas firmes sobre la vertical de los codos',
    ],
    mistakes: ['Rebotar en el pecho', 'Despegar el glúteo del banco', 'Muñecas dobladas hacia atrás'],
  },
  'Peso muerto': {
    cues: [
      'Barra sobre el medio del pie, pegada a las espinillas',
      'Espalda plana y dorsales tensos antes de tirar',
      'Empujá el piso y mantené la barra pegada',
      'Terminá con glúteos, sin hiperextender la lumbar',
    ],
    mistakes: ['Redondear la espalda', 'Barra lejos del cuerpo', 'Tirar con los brazos'],
  },
  'Peso muerto rumano': {
    cues: [
      'Cadera hacia atrás manteniendo la barra pegada',
      'Rodillas semiflexionadas y fijas',
      'Bajá hasta donde tu isquiotibial permita sin redondear',
    ],
    mistakes: ['Convertirlo en sentadilla', 'Mirar al techo y extender el cuello'],
  },
  'Press militar con barra': {
    cues: [
      'Glúteos y abdomen apretados: costillas abajo',
      'Barra en línea vertical: la cabeza pasa adelante al final',
      'Terminá con la barra sobre la vertical de hombro-cadera',
    ],
    mistakes: ['Arquear la lumbar para subir', 'Rebotar desde el pecho (push press sin querer)'],
  },
  Dominadas: {
    cues: [
      'Colgá con escápulas activas antes de tirar',
      'Pecho hacia la barra, codos hacia abajo',
      'Subí hasta que la barbilla pase la barra sin balanceo',
    ],
    mistakes: ['Kipping descontrolado', 'Subir solo hasta la mitad por ego', 'Encoger hombros'],
  },
  'Hip thrust': {
    cues: [
      'Apoya la espalda baja en el banco, mentón levemente recogido',
      'Subí hasta la horizontal empujando con los talones',
      'Apretá glúteos 1-2 segundos arriba',
    ],
    mistakes: ['Hiperextender la lumbar arriba', 'Mirar al techo y extender el cuello'],
  },
  'Zancadas': {
    cues: [
      'Paso largo: ambas rodillas a 90°',
      'Torso erguido y core firme',
      'Rodilla delantera alineada con el pie',
    ],
    mistakes: ['Rodilla que colapsa hacia adentro', 'Paso demasiado corto (rodilla pasa la punta)'],
  },
  'Curl con barra': {
    cues: ['Codos pegados al costado, no viajan', 'Bajada controlada de 2-3 segundos', 'Muñecas neutras'],
    mistakes: ['Balancear el torso para subir', 'Acortar el rango arriba'],
  },
  'Elevaciones laterales': {
    cues: ['Codos levemente flexionados, manos neutras', 'Subí hasta la horizontal, no más', 'Controlá la bajada'],
    mistakes: ['Subir con impulso desde la lumbar', 'Usar demasiado peso y encoger trapecios'],
  },
}

export function getTechnique(exercise: Exercise): TechniqueInfo {
  const base = BY_PATTERN[exercise.movementPattern] ?? BY_PATTERN.otro
  const over = OVERRIDES[exercise.name]
  return {
    cues: over?.cues ?? base.cues,
    mistakes: over?.mistakes ?? base.mistakes,
    safety: over?.safety ?? base.safety,
  }
}