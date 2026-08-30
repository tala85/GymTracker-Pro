// Banco de frases curado manualmente.
// Agregá, editá o quitá frases acá: la app elige al azar por tema.

export type WisdomTheme = 'confianza' | 'temperancia' | 'nutricion'

export interface WisdomPhrase {
  text: string
  source: string
  theme: WisdomTheme
}

export const WISDOM_BANK: WisdomPhrase[] = [
  // 🙏 CONFIANZA
  { text: 'Jehová es mi pastor; nada me faltará.', source: 'Salmo 23:1', theme: 'confianza' },
  { text: 'Todo lo puedo en Cristo que me fortalece.', source: 'Filipenses 4:13', theme: 'confianza' },
  { text: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios.', source: 'Isaías 41:10', theme: 'confianza' },
  { text: 'Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.', source: 'Isaías 40:31', theme: 'confianza' },
  { text: 'Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.', source: '1 Pedro 5:7', theme: 'confianza' },
  { text: 'Cuando pases por las aguas, yo estaré contigo.', source: 'Isaías 43:2', theme: 'confianza' },
  { text: 'Fiel es el Señor, que os confirmará y guardará del mal.', source: '2 Tesalonicenses 3:3', theme: 'confianza' },
  { text: 'La oración es el aliento del alma.', source: 'Elena G. de White', theme: 'confianza' },

  // ⚖️ TEMPERANCIA
  { text: '¿O ignoráis que vuestro cuerpo es templo del Espíritu Santo?', source: '1 Corintios 6:19', theme: 'temperancia' },
  { text: 'Todo me es lícito, mas no todo conviene; todo me es lícito, mas no todo edifica.', source: '1 Corintios 10:23', theme: 'temperancia' },
  { text: 'Si, pues, coméis o bebéis, o hacéis otra cosa, hacedlo todo para la gloria de Dios.', source: '1 Corintios 10:31', theme: 'temperancia' },
  { text: 'Abstenerse por completo de lo perjudicial y usar con sabiduría lo bueno: eso es temperancia.', source: 'Elena G. de White', theme: 'temperancia' },

  // 🥗 NUTRICIÓN
  { text: 'Os he dado toda planta que da simiente... y todo árbol en que hay fruto... os serán para comer.', source: 'Génesis 1:29', theme: 'nutricion' },
  { text: 'Y Daniel propuso en su corazón no contaminarse con la porción de la comida del rey.', source: 'Daniel 1:8', theme: 'nutricion' },
  { text: 'Los cereales, las frutas, las nueces y las verduras constituyen la dieta escogida para nosotros por nuestro Creador.', source: 'Elena G. de White', theme: 'nutricion' },
]

export function getRandomPhrase(theme: WisdomTheme): WisdomPhrase | null {
  const pool = WISDOM_BANK.filter((p) => p.theme === theme)
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}