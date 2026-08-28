import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Star } from "lucide-react";
import { useExerciseStore } from "../../stores/exerciseStore";
import { Button } from "../../components/ui/Button";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { ExerciseFormModal } from "./ExerciseFormModal";
import { DIFFICULTY_LABELS } from "../../utils/labels";

const SELECT_CLASS =
  "rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white";

export function ExercisesPage() {
  const exercises = useExerciseStore((state) => state.exercises);
  const loaded = useExerciseStore((state) => state.loaded);
  const load = useExerciseStore((state) => state.load);
  const toggleFavorite = useExerciseStore((state) => state.toggleFavorite);

  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("Todos");
  const [equipment, setEquipment] = useState("Todos");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const muscles = useMemo(
    () => [
      "Todos",
      ...Array.from(new Set(exercises.map((e) => e.primaryMuscle))).sort(),
    ],
    [exercises],
  );

  const equipments = [
    "Todos",
    "Barra",
    "Mancuernas",
    "Máquina",
    "Polea",
    "Peso corporal",
    "Bandas",
    "Otro",
  ];

  const filtered = useMemo(
    () =>
      exercises
        .filter((e) => muscle === "Todos" || e.primaryMuscle === muscle)
        .filter(
          (e) =>
            equipment === "Todos" ||
            e.equipment === equipment.toLowerCase().replace(" ", "_"),
        )
        .filter((e) => !onlyFavorites || e.isFavorite)
        .filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [exercises, muscle, equipment, onlyFavorites, query],
  );

  const selected = exercises.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Ejercicios</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nuevo
        </Button>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar ejercicio…"
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div className="flex gap-2">
        <select
          value={muscle}
          onChange={(event) => setMuscle(event.target.value)}
          className={`${SELECT_CLASS} flex-1`}
        >
          {muscles.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={equipment}
          onChange={(event) => setEquipment(event.target.value)}
          className={`${SELECT_CLASS} flex-1`}
        >
          {equipments.map((eq) => (
            <option key={eq} value={eq}>
              {eq}
            </option>
          ))}
        </select>
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          aria-label="Ver favoritos"
          className={`rounded-lg border px-3 py-2 text-sm ${
            onlyFavorites
              ? "border-amber-400 bg-amber-400/10 text-amber-400"
              : "border-gray-300 text-gray-500 dark:border-slate-600"
          }`}
        >
          <Star size={16} className={onlyFavorites ? "fill-amber-400" : ""} />
        </button>
      </div>

      {!loaded && <p className="text-sm text-gray-500">Cargando…</p>}

      {loaded && filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          No se encontraron ejercicios.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((exercise) => (
          <div
            key={exercise.id}
            className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800"
          >
            <button
              onClick={() => setSelectedId(exercise.id)}
              className="flex flex-1 flex-col items-start text-left"
            >
              <p className="text-sm font-semibold">{exercise.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {exercise.primaryMuscle} ·{" "}
                {DIFFICULTY_LABELS[exercise.difficulty]}
                {exercise.isSystem ? "" : " · Personalizado"}
              </p>
            </button>
            <button
              onClick={() => toggleFavorite(exercise.id)}
              aria-label="Favorito"
              className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Star
                size={17}
                className={
                  exercise.isFavorite
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-400"
                }
              />
            </button>
          </div>
        ))}
      </div>

      <ExerciseDetailModal
        exercise={selected}
        onClose={() => setSelectedId(null)}
        onToggleFavorite={toggleFavorite}
      />
      <ExerciseFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        muscles={muscles}
      />
    </div>
  );
}
