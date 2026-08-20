import { useState } from 'react'
import { ExternalLink, Link2, Star } from 'lucide-react'
import { toast } from 'sonner'
import type { Exercise } from '../../types'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { YouTubeEmbed } from '../../components/domain/YouTubeEmbed'
import { useExerciseStore } from '../../stores/exerciseStore'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, PATTERN_LABELS } from '../../utils/labels'

interface ExerciseDetailModalProps {
  exercise: Exercise | null
  onClose: () => void
  onToggleFavorite: (id: string) => void
}

export function ExerciseDetailModal({ exercise, onClose, onToggleFavorite }: ExerciseDetailModalProps) {
  const updateExercise = useExerciseStore((state) => state.updateExercise)
  const [newVideo, setNewVideo] = useState('')

  if (!exercise) return null

  const saveVideo = async () => {
    const url = newVideo.trim()
    if (!/^https?:\/\//.test(url) || !/youtube\.com|youtu\.be/i.test(url)) {
      toast.error('Pegá un enlace válido de YouTube')
      return
    }
    await updateExercise(exercise.id, { videoUrl: url })
    toast.success('Video actualizado')
    setNewVideo('')
  }

  return (
    <Modal open={true} onClose={onClose} title={exercise.name}>
      <div className="flex flex-col gap-3">
        {exercise.videoUrl && <YouTubeEmbed url={exercise.videoUrl} title={exercise.name} />}

        <div className="flex flex-wrap gap-1">
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
            {exercise.primaryMuscle}
          </span>
          {exercise.secondaryMuscles.map((muscle) => (
            <span key={muscle} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-700">
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
            {PATTERN_LABELS[exercise.movementPattern] ?? exercise.movementPattern}
          </span>
        </div>

        {exercise.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{exercise.description}</p>
        )}

        <div className="flex flex-col gap-2 rounded-lg bg-slate-100 p-3 dark:bg-slate-700/50">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
            ¿Tenés un mejor video para este ejercicio? Pegá el enlace de YouTube:
          </p>
          <div className="flex gap-2">
            <Input
              value={newVideo}
              onChange={(event) => setNewVideo(event.target.value)}
              placeholder="https://youtube.com/watch?v=…"
            />
            <Button variant="secondary" onClick={saveVideo} aria-label="Guardar video">
              <Link2 size={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => onToggleFavorite(exercise.id)}>
            <Star
              size={16}
              className={exercise.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
            />
            {exercise.isFavorite ? 'Quitar de favoritos' : 'Marcar favorito'}
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
  )
}