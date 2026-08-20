import { useMemo, useState } from "react";
import { useExerciseStore } from "../../stores/exerciseStore";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";

const MUSCLES = [
  "Todos",
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Cuádriceps",
  "Isquiotibiales",
  "Glúteos",
  "Pantorrillas",
  "Core",
  "Cardio",
];

interface ExercisePickerModalProps {
  open: boolean;
  onClose: () => void;
  onPick: (exerciseId: string) => void;
}

export function ExercisePickerModal({
  open,
  onClose,
  onPick,
}: ExercisePickerModalProps) {
  const exercises = useExerciseStore((state) => state.exercises);
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("Todos");

  const filtered = useMemo(() => {
    return exercises
      .filter(
        (exercise) => muscle === "Todos" || exercise.primaryMuscle === muscle,
      )
      .filter((exercise) =>
        exercise.name.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, query, muscle]);

  return (
    <Modal open={open} onClose={onClose} title="Elegir ejercicio">
      <div className="flex flex-col gap-3">
        <Input
          label="Buscar"
          placeholder="Nombre del ejercicio"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={muscle}
          onChange={(event) => setMuscle(event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          {MUSCLES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => {
                onPick(exercise.id);
                onClose();
              }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-left transition-colors hover:border-emerald-500 dark:border-slate-600"
            >
              <p className="text-sm font-medium">{exercise.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {exercise.primaryMuscle} · {exercise.difficulty}
                {!exercise.isSystem && " · Personalizado"}
              </p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">
              Sin resultados.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
