import { useEffect, useState, useMemo } from "react";
import { useExerciseStore } from "../../stores/exerciseStore";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { getTechnique, type TechniqueInfo } from "../../data/technique";
import {
  searchExerciseGif,
  type ExerciseGif,
} from "../../lib/exercise-gifs-api";
import type { Exercise } from "../../types";

interface ExerciseTechniqueModalProps {
  exerciseId: string;
  exerciseName?: string;
  primaryMuscle?: string;
  movementPattern?: string;
  onClose: () => void;
}

export function ExerciseTechniqueModal({
  exerciseId,
  exerciseName,
  primaryMuscle,
  movementPattern,
  onClose,
}: ExerciseTechniqueModalProps) {
  const exercises = useExerciseStore((state) => state.exercises);
  const [exerciseGif, setExerciseGif] = useState<ExerciseGif | null>(null);
  const [loading, setLoading] = useState(true);

  // Calcular el ejercicio (de la biblioteca o temporal)
  const exercise = useMemo<Exercise | null>(() => {
    const found = exercises.find(
      (e) => e.id === exerciseId || e.name === exerciseName,
    );
    if (found) return found;

    if (!exerciseName) return null;

    // Objeto temporal para ejercicios que no están en la biblioteca
    return {
      id: exerciseId,
      name: exerciseName,
      primaryMuscle: primaryMuscle ?? "Desconocido",
      secondaryMuscles: [],
      movementPattern: movementPattern ?? "empuje",
      equipment: "desconocido",
      difficulty: "intermedio",
      tags: [],
      isFavorite: false,
      isSystem: false,
    } as unknown as Exercise;
  }, [exerciseId, exerciseName, primaryMuscle, movementPattern, exercises]);

  useEffect(() => {
    async function loadGif() {
      if (!exercise) return;

      setLoading(true);
      const gif = await searchExerciseGif(exercise.name);
      setExerciseGif(gif);
      setLoading(false);
    }

    loadGif();
  }, [exercise]);

  if (!exercise) {
    return (
      <Modal open={true} onClose={onClose} title="Cargando...">
        <p className="text-center text-gray-500">
          Cargando información del ejercicio...
        </p>
      </Modal>
    );
  }

  const technique: TechniqueInfo = getTechnique(exercise);

  return (
    <Modal open={true} onClose={onClose} title={exercise.name}>
      {/* GIF DEL EJERCICIO */}
      <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700">
        {loading ? (
          <div className="h-64 w-full flex items-center justify-center bg-white dark:bg-slate-800">
            <p className="text-sm text-gray-500">Cargando demostración...</p>
          </div>
        ) : exerciseGif?.gifUrl ? (
          <>
            <img
              src={exerciseGif.gifUrl}
              alt={`Técnica de ${exercise.name}`}
              className="h-64 w-full object-contain bg-white dark:bg-slate-800"
            />
            <p className="bg-slate-200 px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-600 dark:text-slate-300">
              {exerciseGif.name}
            </p>
          </>
        ) : (
          <div className="h-64 w-full flex items-center justify-center bg-white dark:bg-slate-800">
            <p className="text-sm text-gray-500 text-center px-4">
              Sin GIF disponible.
              <br />
              Mirá el video de YouTube abajo.
            </p>
          </div>
        )}
      </div>

      {/* TÉCNICA SEGURA */}
      <div className="mb-3 rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={14} /> Técnica segura
        </p>
        <ul className="list-disc space-y-0.5 pl-4 text-xs text-gray-600 dark:text-gray-300">
          {technique.cues.map((cue: string, i: number) => (
            <li key={i}>{cue}</li>
          ))}
        </ul>
      </div>

      {/* INSTRUCCIONES DEL GIF (si existen) */}
      {exerciseGif?.instructions && exerciseGif.instructions.length > 0 && (
        <div className="mb-3 rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
          <p className="mb-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
            📋 Pasos del movimiento
          </p>
          <ol className="list-decimal space-y-0.5 pl-4 text-xs text-gray-600 dark:text-gray-300">
            {exerciseGif.instructions.map((instruction: string, i: number) => (
              <li key={i}>{instruction}</li>
            ))}
          </ol>
        </div>
      )}

      {/* ERRORES A EVITAR */}
      <div className="mb-3 rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-red-500">
          <TriangleAlert size={14} /> Evitá estos errores
        </p>
        <ul className="list-disc space-y-0.5 pl-4 text-xs text-gray-600 dark:text-gray-300">
          {technique.mistakes.map((mistake: string, i: number) => (
            <li key={i}>{mistake}</li>
          ))}
        </ul>
      </div>

      {/* TIPS DE SEGURIDAD */}
      {technique.safety && (
        <p className="mb-4 text-xs italic text-amber-600 dark:text-amber-400">
          💡 {technique.safety}
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Entendido, seguir entrenando
        </button>
      </div>
    </Modal>
  );
}
