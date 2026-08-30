import { useEffect, useState } from "react";
import {
  ExternalLink,
  Link2,
  ShieldCheck,
  Star,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import type { Exercise } from "../../types";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { YouTubeEmbed } from "../../components/domain/YouTubeEmbed";
import { MuscleMap } from "../../components/domain/MuscleMap";
import { useExerciseStore } from "../../stores/exerciseStore";
import { getTechnique } from "../../data/technique";
import { searchExerciseGif, type ExerciseGif } from "../../lib/exercise-gifs-api"; // <-- NUEVO IMPORT
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  PATTERN_LABELS,
} from "../../utils/labels";
import { AlternativesSection } from "./AlternativesSection";

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onPick?: (exerciseId: string) => void;
}

export function ExerciseDetailModal({
  exercise,
  onClose,
  onToggleFavorite,
  onPick,
}: ExerciseDetailModalProps) {
  const updateExercise = useExerciseStore((state) => state.updateExercise);
  const [newVideo, setNewVideo] = useState("");
  
  // NUEVO: Estado para el GIF dinámico
  const [exerciseGif, setExerciseGif] = useState<ExerciseGif | null>(null);
  const [loadingGif, setLoadingGif] = useState(true);

  // NUEVO: Efecto para buscar el GIF automáticamente
  useEffect(() => {
    async function loadGif() {
      if (!exercise) return;
      setLoadingGif(true);
      const gif = await searchExerciseGif(exercise.name);
      setExerciseGif(gif);
      setLoadingGif(false);
    }
    loadGif();
  }, [exercise]);

  if (!exercise) return null;

  const technique = getTechnique(exercise);

  const saveVideo = async () => {
    const url = newVideo.trim();
    if (!/^https?:\/\//.test(url) || !/youtube\.com|youtu\.be/i.test(url)) {
      toast.error("Pegá un enlace válido de YouTube");
      return;
    }
    await updateExercise(exercise.id, { videoUrl: url });
    toast.success("Video actualizado");
    setNewVideo("");
  };

  return (
    <Modal open={true} onClose={onClose} title={exercise.name}>
      <div className="flex flex-col gap-3">
        {exercise.videoUrl && (
          <YouTubeEmbed url={exercise.videoUrl} title={exercise.name} />
        )}

        <div className="flex flex-wrap gap-1">
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
            {exercise.primaryMuscle}
          </span>
          {exercise.secondaryMuscles.map((muscle) => (
            <span
              key={muscle}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-700"
            >
              {muscle}
            </span>
          ))}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-700">
            {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-700">
            {DIFFICULTY_LABELS[exercise.difficulty] ?? exercise.difficulty}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-700">
            {PATTERN_LABELS[exercise.movementPattern] ??
              exercise.movementPattern}
          </span>
        </div>

        {/* DEMOSTRACIÓN VISUAL (GIF DINÁMICO DESDE API) */}
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700">
          {loadingGif ? (
            <div className="h-56 w-full flex items-center justify-center bg-white dark:bg-slate-800">
              <p className="text-sm text-gray-500">Cargando demostración...</p>
            </div>
          ) : exerciseGif?.gifUrl ? (
            <>
              <img
                src={exerciseGif.gifUrl}
                alt={`Demostración de ${exercise.name}`}
                className="h-56 w-full object-contain bg-white dark:bg-slate-800"
                loading="lazy"
              />
              <p className="bg-slate-200 px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-600 dark:text-slate-300">
                {exerciseGif.name}
              </p>
            </>
          ) : (
            <div className="h-56 w-full flex items-center justify-center bg-white dark:bg-slate-800">
              <p className="text-sm text-gray-500 text-center px-4">
                Sin GIF disponible.<br />
                Mirá el video de YouTube arriba.
              </p>
            </div>
          )}
        </div>

        <MuscleMap
          primary={exercise.primaryMuscle}
          secondary={exercise.secondaryMuscles}
        />

        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-700/50">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold">
            <ShieldCheck size={14} className="text-emerald-500" /> Técnica
            segura
          </p>
          <ul className="list-disc space-y-0.5 pl-4 text-xs text-gray-600 dark:text-gray-300">
            {technique.cues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
          <p className="mb-1.5 mt-3 flex items-center gap-1.5 text-xs font-bold text-red-400">
            <TriangleAlert size={14} /> Evitá estos errores
          </p>
          <ul className="list-disc space-y-0.5 pl-4 text-xs text-gray-600 dark:text-gray-300">
            {technique.mistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] italic text-amber-500">
            {technique.safety}
          </p>
        </div>

        {exercise.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {exercise.description}
          </p>
        )}

        <div className="flex flex-col gap-2 rounded-lg bg-slate-100 p-3 dark:bg-slate-700/50">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
            ¿Tenés un mejor video para este ejercicio? Pegá el enlace de
            YouTube:
          </p>
          <div className="flex gap-2">
            <Input
              value={newVideo}
              onChange={(event) => setNewVideo(event.target.value)}
              placeholder="https://youtube.com/watch?v=…"
            />
            <Button
              variant="secondary"
              onClick={saveVideo}
              aria-label="Guardar video"
            >
              <Link2 size={16} />
            </Button>
          </div>
        </div>

        {/* ALTERNATIVAS DEL MISMO MÚSCULO */}
        <AlternativesSection
          currentExerciseId={exercise.id}
          primaryMuscle={exercise.primaryMuscle}
          movementPattern={exercise.movementPattern}
          onPick={(altId) => {
            onPick?.(altId);
          }}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => onToggleFavorite(exercise.id)}
          >
            <Star
              size={16}
              className={
                exercise.isFavorite ? "fill-amber-400 text-amber-400" : ""
              }
            />
            {exercise.isFavorite ? "Quitar de favoritos" : "Marcar favorito"}
          </Button>
          {exercise.videoUrl && (
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/10"
            >
              <ExternalLink size={16} /> Abrir en YouTube
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}