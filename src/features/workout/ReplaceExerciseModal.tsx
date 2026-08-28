import { useExerciseStore } from "../../stores/exerciseStore";
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS } from "../../utils/labels";
import { Modal } from "../../components/ui/Modal";
import { Dumbbell, Check } from "lucide-react";

interface ReplaceExerciseModalProps {
  currentExerciseId: string;
  currentExerciseName: string;
  primaryMuscle: string;
  movementPattern: string;
  onClose: () => void;
  onReplace: (newExerciseId: string) => void;
}

export function ReplaceExerciseModal({
  currentExerciseId,
  currentExerciseName,
  primaryMuscle,
  movementPattern,
  onClose,
  onReplace,
}: ReplaceExerciseModalProps) {
  const exercises = useExerciseStore((state) => state.exercises);

  const samePattern = exercises.filter(
    (e) =>
      e.id !== currentExerciseId &&
      e.primaryMuscle === primaryMuscle &&
      e.movementPattern === movementPattern,
  );
  const sameMuscle = exercises.filter(
    (e) =>
      e.id !== currentExerciseId &&
      e.primaryMuscle === primaryMuscle &&
      !samePattern.some((a) => a.id === e.id),
  );

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Reemplazar ${currentExerciseName}`}
    >
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Elegí un ejercicio equivalente que trabaje{" "}
        <strong>{primaryMuscle}</strong>:
      </p>

      {samePattern.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
            Mismo patrón (recomendados)
          </p>
          {samePattern.map((alt) => (
            <button
              key={alt.id}
              onClick={() => {
                onReplace(alt.id);
              }}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-emerald-500 hover:bg-emerald-500/5 dark:border-slate-600 dark:bg-slate-700 dark:hover:border-emerald-500"
            >
              <Dumbbell size={16} className="text-emerald-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{alt.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {EQUIPMENT_LABELS[alt.equipment] ?? alt.equipment} ·{" "}
                  {DIFFICULTY_LABELS[alt.difficulty]}
                </p>
              </div>
              <Check size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {sameMuscle.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Otras opciones para {primaryMuscle}
          </p>
          {sameMuscle.slice(0, 6).map((alt) => (
            <button
              key={alt.id}
              onClick={() => {
                onReplace(alt.id);
              }}
              className="..."
            >
              <Dumbbell size={16} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{alt.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {EQUIPMENT_LABELS[alt.equipment] ?? alt.equipment} ·{" "}
                  {DIFFICULTY_LABELS[alt.difficulty]}
                </p>
              </div>
              <Check size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {samePattern.length === 0 && sameMuscle.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-500">
          No hay ejercicios equivalentes disponibles para {primaryMuscle}.
        </p>
      )}
    </Modal>
  );
}
