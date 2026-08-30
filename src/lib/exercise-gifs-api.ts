// API de ExerciseGymGifsDB - https://github.com/JahelCuadrado/ExerciseGymGifsDB
const BASE_URL =
  "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/api/es";

export interface ExerciseGif {
  id: string;
  slug: string;
  name: string;
  muscle: string;
  bodyPart: string;
  equipment: string;
  category: string;
  secondaryMuscles: string[];
  instructions: string[];
  file: string;
  gifUrl: string;
}

import { getApiExerciseName } from "../data/exercise-name-mapping";

// Buscar ejercicio por nombre (búsqueda estricta con validación)
export async function searchExerciseGif(
  exerciseName: string,
): Promise<ExerciseGif | null> {
  try {
    // Obtener el nombre mapeado a la API
    const apiName = getApiExerciseName(exerciseName);

    // Si el nombre está mapeado, buscar directamente por ese nombre
    if (apiName !== exerciseName) {
      const response = await fetch(`${BASE_URL}/exercises.json`);
      const data = await response.json();
      const exercises: ExerciseGif[] = data.exercises;

      // Búsqueda exacta por nombre mapeado
      const exactMatch = exercises.find(
        (ex) => ex.name.toLowerCase() === apiName.toLowerCase(),
      );

      if (exactMatch) {
        console.log("✅ Match exacto por mapeo:", exactMatch.name);
        return exactMatch;
      }

      // Búsqueda parcial si no hay exacta
      const partialMatch = exercises.find((ex) => {
        const exName = ex.name.toLowerCase();
        const searchName = apiName.toLowerCase();
        return exName.includes(searchName) || searchName.includes(exName);
      });

      if (partialMatch) {
        console.log("✅ Match parcial por mapeo:", partialMatch.name);
        return partialMatch;
      }
    }

    // Si no hay mapeo o no se encontró, buscar por palabras clave
    const response = await fetch(`${BASE_URL}/exercises.json`);
    const data = await response.json();
    const exercises: ExerciseGif[] = data.exercises;

    // Extraer palabras clave importantes (más de 3 letras)
    const keywords = exerciseName
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3);

    // Buscar coincidencia que contenga TODAS las palabras clave importantes
    const match = exercises.find((ex) => {
      const exName = ex.name.toLowerCase();
      return keywords.every((keyword) => exName.includes(keyword));
    });

    if (match) {
      console.log("✅ Match por keywords:", match.name);
    } else {
      console.log("❌ No se encontró match para:", exerciseName);
    }

    return match || null;
  } catch (error) {
    console.error("Error buscando GIF de ejercicio:", error);
    return null;
  }
}

// Obtener GIF directo por músculo y slug
export function getExerciseGifUrl(muscle: string, slug: string): string {
  return `${BASE_URL}/${muscle}/${slug}.gif`;
}
