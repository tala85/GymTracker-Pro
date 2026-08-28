import { create } from "zustand";
import type { WorkoutExercise, WorkoutSession, WorkoutSet } from "../types";
import { dbBulkPut, dbDelete, dbGet, dbGetAll, dbPut } from "../lib/db";
import { uid } from "../utils/helpers";
import { useExerciseStore } from "./exerciseStore";
import { useRoutineStore } from "./routineStore";
import type { CoachSuggestion } from "../utils/coach";

export interface ActiveSet {
  id: string;
  weightKg: number;
  reps: number;
  rir: number;
  isFailure: boolean;
  isCompleted: boolean;
  notes: string;
}

export interface ActiveExercise {
  id: string;
  exerciseId: string;
  name: string;
  plannedRestSeconds: number;
  repsTarget?: string;
  sets: ActiveSet[];
}

export interface ActiveSession {
  id: string;
  routineId: string | null;
  routineDayId: string | null;
  dayName: string;
  startedAt: string;
  exercises: ActiveExercise[];
}

const ACTIVE_KEY = "active-session";
const COACH_KEY = "coach-suggestions";

function upperBound(repsTarget: string): number {
  const nums = repsTarget
    .split("-")
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  return nums.length ? Math.max(...nums) : 10;
}

async function getPreviousSets(exerciseId: string) {
  const [sessions, wExercises, wSets] = await Promise.all([
    dbGetAll<WorkoutSession>("workoutSessions"),
    dbGetAll<WorkoutExercise>("workoutExercises"),
    dbGetAll<WorkoutSet>("workoutSets"),
  ]);
  const sorted = [...sessions].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );
  for (const session of sorted) {
    const wex = wExercises.find(
      (we) =>
        we.workoutSessionId === session.id && we.exerciseId === exerciseId,
    );
    if (!wex) continue;
    const sets = wSets
      .filter((s) => s.workoutExerciseId === wex.id && s.isCompleted)
      .sort((a, b) => a.setNumber - b.setNumber);
    if (sets.length) {
      return sets.map((s) => ({
        weightKg: s.weightKg,
        reps: s.reps,
        rir: s.rir ?? 1,
      }));
    }
  }
  return null;
}

interface WorkoutState {
  active: ActiveSession | null;
  restEndsAt: number | null;
  suggestions: Record<string, CoachSuggestion>;
  loadActive: () => Promise<void>;
  startWorkout: (routineId: string, dayId: string) => Promise<void>;
  discard: () => Promise<void>;
  addExercise: (exerciseId: string) => Promise<void>;
  removeExercise: (activeExerciseId: string) => Promise<void>;
  addSet: (activeExerciseId: string) => Promise<void>;
  removeSet: (activeExerciseId: string, setId: string) => Promise<void>;
  updateSet: (
    activeExerciseId: string,
    setId: string,
    patch: Partial<ActiveSet>,
  ) => Promise<void>;
  completeSet: (activeExerciseId: string, setId: string) => Promise<void>;
  copyPrevious: (activeExerciseId: string) => Promise<boolean>;
  saveSuggestions: (list: CoachSuggestion[]) => Promise<void>;
  startRest: (seconds: number) => void;
  extendRest: (seconds: number) => void;
  clearRest: () => void;
  finish: (techniqueFeeling?: "impecable" | "bien" | "costo") => Promise<void>;
  replaceExercise: (
    oldExerciseId: string,
    newExerciseId: string,
  ) => Promise<void>;
}

async function persist(active: ActiveSession | null) {
  if (active) {
    await dbPut("settings", { id: ACTIVE_KEY, session: active });
  } else {
    await dbDelete("settings", ACTIVE_KEY);
  }
}

export const useWorkoutStore = create<WorkoutState>((set, get) => {
  const commit = async (next: ActiveSession) => {
    set({ active: next });
    await persist(next);
  };

  return {
    active: null,
    restEndsAt: null,
    suggestions: {},

    loadActive: async () => {
      const [stored, coachStored] = await Promise.all([
        dbGet<{ id: string; session: ActiveSession }>("settings", ACTIVE_KEY),
        dbGet<{ id: string; suggestions: Record<string, CoachSuggestion> }>(
          "settings",
          COACH_KEY,
        ),
      ]);
      set({
        active: stored?.session ?? null,
        suggestions: coachStored?.suggestions ?? {},
      });
    },

    startWorkout: async (routineId, dayId) => {
      const { daysByRoutine, exercisesByDay } = useRoutineStore.getState();
      const library = useExerciseStore.getState().exercises;
      const day = (daysByRoutine[routineId] ?? []).find((d) => d.id === dayId);
      if (!day) return;
      const planned = exercisesByDay[dayId] ?? [];
      const suggestions = get().suggestions;
      const exercises: ActiveExercise[] = [];

      for (const p of planned) {
        const previous = await getPreviousSets(p.exerciseId);
        const name =
          library.find((e) => e.id === p.exerciseId)?.name ?? "Ejercicio";
        const suggestion = suggestions[p.exerciseId];
        const sets: ActiveSet[] = Array.from(
          { length: p.setsTarget },
          (_, index) => {
            const baseWeight =
              previous?.[index]?.weightKg ?? previous?.[0]?.weightKg ?? 0;
            const adjusted =
              baseWeight > 0 && suggestion && suggestion.deltaKg !== 0
                ? Math.max(0, baseWeight + suggestion.deltaKg)
                : baseWeight;
            return {
              id: uid(),
              weightKg: adjusted,
              reps: previous?.[index]?.reps ?? upperBound(p.repsTarget),
              rir: previous?.[index]?.rir ?? p.rirTarget ?? 1,
              isFailure: false,
              isCompleted: false,
              notes: "",
            };
          },
        );
        exercises.push({
          id: uid(),
          exerciseId: p.exerciseId,
          name,
          plannedRestSeconds: p.restSeconds,
          repsTarget: p.repsTarget,
          sets,
        });
      }

      const session: ActiveSession = {
        id: uid(),
        routineId,
        routineDayId: dayId,
        dayName: day.name,
        startedAt: new Date().toISOString(),
        exercises,
      };
      await commit(session);
    },

    discard: async () => {
      await persist(null);
      set({ active: null, restEndsAt: null });
    },

    addExercise: async (exerciseId) => {
      const current = get().active;
      if (!current) return;
      const library = useExerciseStore.getState().exercises;
      const found = library.find((e) => e.id === exerciseId);
      const name = found?.name ?? "Ejercicio";
      const next: ActiveSession = {
        ...current,
        exercises: [
          ...current.exercises,
          {
            id: uid(),
            exerciseId,
            name,
            plannedRestSeconds: 90,
            repsTarget: "8-12",
            sets: [
              {
                id: uid(),
                weightKg: 0,
                reps: 8,
                rir: 1,
                isFailure: false,
                isCompleted: false,
                notes: "",
              },
            ],
          },
        ],
      };
      await commit(next);
    },

    removeExercise: async (activeExerciseId) => {
      const current = get().active;
      if (!current) return;
      await commit({
        ...current,
        exercises: current.exercises.filter((e) => e.id !== activeExerciseId),
      });
    },

    replaceExercise: async (oldExerciseId: string, newExerciseId: string) => {
      const current = get().active;
      if (!current) return;

      const library = useExerciseStore.getState().exercises;
      const newExData = library.find((e) => e.id === newExerciseId);
      if (!newExData) return;

      const oldIndex = current.exercises.findIndex(
        (e) => e.id === oldExerciseId,
      );
      if (oldIndex === -1) return;

      const next: ActiveSession = {
        ...current,
        exercises: current.exercises.map((ex, idx) => {
          if (idx !== oldIndex) return ex;

          // Reemplazamos manteniendo la estructura de series pero con nuevo ID
          return {
            ...ex,
            id: uid(), // Nuevo ID de instancia
            exerciseId: newExData.id,
            name: newExData.name,
            sets: ex.sets.map((s) => ({
              ...s,
              id: uid(),
              isCompleted: false,
              weightKg: 0,
              reps: 8,
            })),
          };
        }),
      };
      await commit(next);
    },

    addSet: async (activeExerciseId) => {
      const current = get().active;
      if (!current) return;
      const next: ActiveSession = {
        ...current,
        exercises: current.exercises.map((ex) => {
          if (ex.id !== activeExerciseId) return ex;
          const last = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: uid(),
                weightKg: last?.weightKg ?? 0,
                reps: last?.reps ?? 8,
                rir: last?.rir ?? 1,
                isFailure: false,
                isCompleted: false,
                notes: "",
              },
            ],
          };
        }),
      };
      await commit(next);
    },

    removeSet: async (activeExerciseId, setId) => {
      const current = get().active;
      if (!current) return;
      const next: ActiveSession = {
        ...current,
        exercises: current.exercises.map((ex) =>
          ex.id === activeExerciseId
            ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
            : ex,
        ),
      };
      await commit(next);
    },

    updateSet: async (activeExerciseId, setId, patch) => {
      const current = get().active;
      if (!current) return;
      const next: ActiveSession = {
        ...current,
        exercises: current.exercises.map((ex) =>
          ex.id === activeExerciseId
            ? {
                ...ex,
                sets: ex.sets.map((s) =>
                  s.id === setId ? { ...s, ...patch } : s,
                ),
              }
            : ex,
        ),
      };
      await commit(next);
    },

    completeSet: async (activeExerciseId, setId) => {
      const current = get().active;
      if (!current) return;
      let justCompleted = false;
      let rest = 90;
      const next: ActiveSession = {
        ...current,
        exercises: current.exercises.map((ex) => {
          if (ex.id !== activeExerciseId) return ex;
          rest = ex.plannedRestSeconds || 90;
          return {
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.id !== setId) return s;
              justCompleted = !s.isCompleted;
              return { ...s, isCompleted: !s.isCompleted };
            }),
          };
        }),
      };
      await commit(next);
      if (justCompleted) get().startRest(rest);
    },

    copyPrevious: async (activeExerciseId) => {
      const current = get().active;
      if (!current) return false;
      const target = current.exercises.find((e) => e.id === activeExerciseId);
      if (!target) return false;
      const previous = await getPreviousSets(target.exerciseId);
      if (!previous) return false;
      const next: ActiveSession = {
        ...current,
        exercises: current.exercises.map((ex) =>
          ex.id === activeExerciseId
            ? {
                ...ex,
                sets: previous.map((p) => ({
                  id: uid(),
                  weightKg: p.weightKg,
                  reps: p.reps,
                  rir: p.rir,
                  isFailure: false,
                  isCompleted: false,
                  notes: "",
                })),
              }
            : ex,
        ),
      };
      await commit(next);
      return true;
    },

    saveSuggestions: async (list) => {
      const map: Record<string, CoachSuggestion> = {};
      for (const s of list) map[s.exerciseId] = s;
      await dbPut("settings", { id: COACH_KEY, suggestions: map });
      set({ suggestions: map });
    },

    startRest: (seconds) => set({ restEndsAt: Date.now() + seconds * 1000 }),
    extendRest: (seconds) =>
      set({ restEndsAt: (get().restEndsAt ?? Date.now()) + seconds * 1000 }),
    clearRest: () => set({ restEndsAt: null }),

    finish: async (techniqueFeeling?: "impecable" | "bien" | "costo") => {
      const current = get().active;
      if (!current) return;
      const endedAt = new Date().toISOString();
      const durationSeconds = Math.max(
        1,
        Math.floor((Date.now() - new Date(current.startedAt).getTime()) / 1000),
      );
      const withSets = current.exercises.filter((ex) =>
        ex.sets.some((s) => s.isCompleted),
      );
      let volume = 0;
      const wExercises: WorkoutExercise[] = withSets.map((ex, index) => ({
        id: ex.id,
        workoutSessionId: current.id,
        exerciseId: ex.exerciseId,
        order: index + 1,
      }));
      const wSets: WorkoutSet[] = withSets.flatMap((ex) =>
        ex.sets.map((s, index) => {
          if (s.isCompleted) volume += s.weightKg * s.reps;
          return {
            id: s.id,
            workoutExerciseId: ex.id,
            setNumber: index + 1,
            weightKg: s.weightKg,
            reps: s.reps,
            rir: s.rir,
            restSeconds: ex.plannedRestSeconds,
            notes: s.notes || undefined,
            isFailure: s.isFailure,
            isCompleted: s.isCompleted,
          };
        }),
      );
      const session: WorkoutSession = {
        id: current.id,
        routineId: current.routineId ?? undefined,
        routineDayId: current.routineDayId ?? undefined,
        dayName: current.dayName,
        startedAt: current.startedAt,
        endedAt,
        durationSeconds,
        totalVolumeKg: volume,
        techniqueFeeling, // <-- AGREGAR ESTA LÍNEA
      };
      await dbPut("workoutSessions", session);
      await dbBulkPut("workoutExercises", wExercises);
      await dbBulkPut("workoutSets", wSets);
      await persist(null);
      set({ active: null, restEndsAt: null });
    },
  };
});
