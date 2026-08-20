import type { UserLink } from '../types'

export const LINK_CATEGORIES = [
  'Técnica de ejercicios',
  'Nutrición',
  'Ciencia del entrenamiento',
  'Suplementación',
  'Motivación',
  'Recuperación',
  'Otros',
]

function link(id: string, title: string, url: string, category: string): UserLink {
  return {
    id,
    title,
    url,
    category,
    isFavorite: false,
    isSystem: true,
    createdAt: new Date().toISOString(),
  }
}

export const SYSTEM_LINKS: UserLink[] = [
  link('sys-enfaf', 'ENFAF - Entrenamiento basado en ciencia', 'https://enfaf.com', 'Ciencia del entrenamiento'),
  link('sys-enfaf-5dias', 'ENFAF - Rutina de 5 días completa', 'https://enfaf.com/la-mejor-rutina-de-gimnasio-de-5-dias/', 'Ciencia del entrenamiento'),
  link('sys-fitrevo-web', 'Fitness Revolucionario - nutrición y entrenamiento', 'https://fitnessrevolucionario.com', 'Nutrición'),
  link('sys-fitrevo-yt', 'Fitness Revolucionario (YouTube)', 'https://www.youtube.com/@FitnessRevolucionario', 'Nutrición'),
  link('sys-javi', 'Javi NewBody (YouTube)', 'https://www.youtube.com/@JaviNewBody', 'Técnica de ejercicios'),
  link('sys-athleanx-es', 'ATHLEAN-X en Español (sitio oficial)', 'https://athleanx.com/espanol', 'Técnica de ejercicios'),
  link('sys-examine', 'Examine.com - suplementos con evidencia (inglés)', 'https://examine.com', 'Suplementación'),
  link('sys-exrx', 'ExRx.net - directorio de ejercicios (inglés)', 'https://exrx.net', 'Técnica de ejercicios'),
]