export interface Tip {
  text: string
  source: string
  emoji: string
}

const NUTRITION_TIPS: Tip[] = [
  { text: 'Comé despacio y con moderación: la sobrecarga agota el cuerpo y nubla la mente.', source: 'El Ministerio de Curación', emoji: '🍎' },
  { text: 'Los alimentos simples y naturales nutren mejor que los complicados y recargados.', source: 'El Ministerio de Curación', emoji: '🥗' },
  { text: 'Comé a horarios regulares: tu cuerpo ama el orden tanto como tu rutina del gym.', source: 'El Ministerio de Curación', emoji: '⏰' },
  { text: 'Que tu alimento sea tu medicina: más vegetales, frutas y granos enteros.', source: 'El Ministerio de Curación', emoji: '🥦' },
  { text: 'No comas cuando estás agotado o muy alterado: primero regalate un momento de calma.', source: 'El Ministerio de Curación', emoji: '🧘' },
  { text: 'Masticá bien y comé con gratitud: la buena digestión empieza en la tranquilidad.', source: 'El Ministerio de Curación', emoji: '🙏' },
  { text: 'Menos estimulantes y más agua: tu energía no debería depender de un pico de cafeína.', source: 'El Ministerio de Curación', emoji: '💧' },
  { text: 'Cena liviano y temprano: el descanso profundo se prepara de noche.', source: 'El Ministerio de Curación', emoji: '🌙' },
]

const TEMPERANCE_TIPS: Tip[] = [
  { text: 'Temperancia no es privarte de todo: es ser dueño de tus hábitos y no que ellos te dominen.', source: 'El Ministerio de Curación', emoji: '⚖️' },
  { text: 'Abstenerse de lo que daña es el primer paso; usar con moderación lo bueno, el segundo.', source: 'El Ministerio de Curación', emoji: '🎯' },
  { text: 'Cada hábito que dominás hoy es fuerza para el entrenamiento de mañana.', source: 'El Ministerio de Curación', emoji: '💪' },
  { text: 'El descanso también es disciplina: decir "hasta acá" a la pantalla es decir "sí" a tu recuperación.', source: 'El Ministerio de Curación', emoji: '📵' },
  { text: 'La intemperancia de hoy es la fatiga de mañana; la moderación es energía guardada.', source: 'El Ministerio de Curación', emoji: '🔋' },
  { text: 'Sé temperante también al entrenar: más no siempre es mejor; mejor es mejor.', source: 'El Ministerio de Curación', emoji: '🎯' },
  { text: 'Un deseo vencido vale más que mil series perfectas: así entrenás tu voluntad.', source: 'El Ministerio de Curación', emoji: '🧠' },
  { text: 'La claridad mental nace de un cuerpo libre de excesos.', source: 'El Ministerio de Curación', emoji: '✨' },
]

const TRUST_TIPS: Tip[] = [
  { text: 'Echa sobre Jehová tu carga, y él te sustentará.', source: 'Salmos 55:22', emoji: '🙏' },
  { text: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios.', source: 'Isaías 41:10', emoji: '🛡️' },
  { text: 'El corazón alegre constituye buen remedio; mas el espíritu triste seca los huesos.', source: 'Proverbios 17:22', emoji: '😊' },
  { text: 'Jehová es mi pastor; nada me faltará.', source: 'Salmos 23:1', emoji: '🐑' },
  { text: 'La paz os dejo, mi paz os doy.', source: 'Juan 14:27', emoji: '☮️' },
  { text: 'Confía en Jehová con todo tu corazón, y no te apoyes en tu propia prudencia.', source: 'Proverbios 3:5', emoji: '💖' },
  { text: 'Por nada estéis afanosos… y la paz de Dios guardará vuestros corazones y vuestros pensamientos.', source: 'Filipenses 4:6-7', emoji: '🕊️' },
  { text: 'Esta es la confianza que tenemos en él: que si pedimos alguna cosa conforme a su voluntad, él nos oye.', source: '1 Juan 5:14', emoji: '🎯' },
]

export function getDailyTips(): { nutricion: Tip; temperancia: Tip; confianza: Tip } {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000)
  return {
    nutricion: NUTRITION_TIPS[dayOfYear % NUTRITION_TIPS.length],
    temperancia: TEMPERANCE_TIPS[dayOfYear % TEMPERANCE_TIPS.length],
    confianza: TRUST_TIPS[dayOfYear % TRUST_TIPS.length],
  }
}