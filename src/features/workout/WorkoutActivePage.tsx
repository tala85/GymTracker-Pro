import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Flag, History, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useWorkoutStore } from "../../stores/workoutStore";
import { ExercisePickerModal } from "../../components/domain/ExercisePickerModal";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";

function MiniInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
      {label}
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border border-gray-300 bg-white px-1 py-1.5 text-center text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      />
    </label>
  );
}

export function WorkoutActivePage() {
  const navigate = useNavigate();
  const active = useWorkoutStore((state) => state.active);
  const updateSet = useWorkoutStore((state) => state.updateSet);
  const completeSet = useWorkoutStore((state) => state.completeSet);
  const addSet = useWorkoutStore((state) => state.addSet);
  const removeSet = useWorkoutStore((state) => state.removeSet);
  const addExercise = useWorkoutStore((state) => state.addExercise);
  const removeExercise = useWorkoutStore((state) => state.removeExercise);
  const copyPrevious = useWorkoutStore((state) => state.copyPrevious);
  const discard = useWorkoutStore((state) => state.discard);
  const finish = useWorkoutStore((state) => state.finish);

  const [showPicker, setShowPicker] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-3 pt-10">
        <p className="text-sm text-gray-500">
          No hay ningún entrenamiento en curso.
        </p>
        <Button variant="secondary" onClick={() => navigate("/entrenar")}>
          Empezar uno
        </Button>
      </div>
    );
  }

  const startedMs = new Date(active.startedAt).getTime();
  const elapsed =
    now === 0 ? 0 : Math.max(0, Math.floor((now - startedMs) / 1000));
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const completedSets = active.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0,
  );
  const volume = active.exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets
        .filter((s) => s.isCompleted)
        .reduce((a, s) => a + s.weightKg * s.reps, 0),
    0,
  );

  const handleFinish = async () => {
    await finish();
    toast.success(
      `Entrenamiento guardado: ${completedSets} series · ${volume.toLocaleString()} kg`,
    );
    navigate("/");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{active.dayName}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ⏱ {mm}:{ss}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500"
            onClick={() => setShowDiscard(true)}
          >
            <Trash2 size={15} />
          </Button>
          <Button size="sm" onClick={() => setShowSummary(true)}>
            <Flag size={15} /> Terminar
          </Button>
        </div>
      </div>

      {active.exercises.map((ex) => (
        <div
          key={ex.id}
          className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{ex.name}</p>
            <div className="flex gap-1">
              <button
                onClick={async () => {
                  const copied = await copyPrevious(ex.id);
                  toast[copied ? "success" : "error"](
                    copied
                      ? "Copiado de la sesión anterior"
                      : "Sin sesiones anteriores de este ejercicio",
                  );
                }}
                aria-label="Copiar sesión anterior"
                className="rounded p-1.5 text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <History size={15} />
              </button>
              <button
                onClick={() => removeExercise(ex.id)}
                aria-label="Quitar ejercicio"
                className="rounded p-1.5 text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {ex.sets.map((set, setIndex) => (
            <div
              key={set.id}
              className={`grid grid-cols-[20px_1fr_1fr_1fr_36px_20px] items-center gap-1 rounded-lg p-1.5 ${
                set.isCompleted
                  ? "bg-emerald-500/15"
                  : "bg-slate-50 dark:bg-slate-700/50"
              }`}
            >
              <span className="text-center text-xs font-bold text-gray-500">
                {setIndex + 1}
              </span>
              <MiniInput
                label="Kg"
                value={set.weightKg}
                onChange={(v) =>
                  updateSet(ex.id, set.id, {
                    weightKg: Math.max(0, Number(v) || 0),
                  })
                }
              />
              <MiniInput
                label="Reps"
                value={set.reps}
                onChange={(v) =>
                  updateSet(ex.id, set.id, {
                    reps: Math.max(0, Number(v) || 0),
                  })
                }
              />
              <MiniInput
                label="RIR"
                value={set.rir}
                onChange={(v) =>
                  updateSet(ex.id, set.id, {
                    rir: Math.min(10, Math.max(0, Number(v) || 0)),
                  })
                }
              />
              <button
                onClick={() => completeSet(ex.id, set.id)}
                aria-label="Completar serie"
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  set.isCompleted
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-gray-500 dark:bg-slate-600"
                }`}
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => removeSet(ex.id, set.id)}
                aria-label="Quitar serie"
                className="text-gray-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <Button size="sm" variant="ghost" onClick={() => addSet(ex.id)}>
            <Plus size={14} /> Agregar serie
          </Button>
        </div>
      ))}

      <Button variant="secondary" onClick={() => setShowPicker(true)}>
        <Plus size={16} /> Agregar ejercicio
      </Button>

      <ExercisePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onPick={(exerciseId) => addExercise(exerciseId)}
      />

      <Modal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        title="Resumen del entrenamiento"
      >
        <div className="mb-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
            <p className="text-lg font-bold">
              {mm}:{ss}
            </p>
            <p className="text-xs text-gray-500">Duración</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
            <p className="text-lg font-bold">{completedSets}</p>
            <p className="text-xs text-gray-500">Series</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
            <p className="text-lg font-bold">{volume.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Kg totales</p>
          </div>
        </div>
        {completedSets === 0 && (
          <p className="mb-3 text-center text-xs text-red-500">
            Completá al menos una serie para guardar.
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowSummary(false)}>
            Seguir entrenando
          </Button>
          <Button onClick={handleFinish} disabled={completedSets === 0}>
            Guardar
          </Button>
        </div>
      </Modal>

      <Modal
        open={showDiscard}
        onClose={() => setShowDiscard(false)}
        title="Descartar entrenamiento"
      >
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Se perderá todo lo registrado en esta sesión. ¿Continuar?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDiscard(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await discard();
              navigate("/entrenar");
            }}
          >
            Descartar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
