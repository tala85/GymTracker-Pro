import { create } from "zustand";
import type { Exercise } from "../types";
import { dbBulkPut, dbGetAll, dbPut } from "../lib/db";
import { SYSTEM_EXERCISES } from "../data/exercises";
import { uid } from "../utils/helpers";

interface ExerciseState {
  exercises: Exercise[];
  loaded: boolean;
  load: () => Promise<void>;
  toggleFavorite: (exerciseId: string) => Promise<void>;
  updateExercise: (
    exerciseId: string,
    patch: Partial<Exercise>,
  ) => Promise<void>;
  addCustom: (
    data: Omit<
      Exercise,
      "id" | "isSystem" | "isFavorite" | "createdAt" | "userId"
    >,
  ) => Promise<Exercise>;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    let local = await dbGetAll<Exercise>("exercises");
    if (local.length === 0) {
      await dbBulkPut("exercises", SYSTEM_EXERCISES);
      local = SYSTEM_EXERCISES;
    }
    set({ exercises: local, loaded: true });
  },

  toggleFavorite: async (exerciseId) => {
    const exercises = get().exercises.map((exercise) =>
      exercise.id === exerciseId
        ? { ...exercise, isFavorite: !exercise.isFavorite }
        : exercise,
    );
    const updated = exercises.find((exercise) => exercise.id === exerciseId);
    if (updated) await dbPut("exercises", updated);
    set({ exercises });
  },

  updateExercise: async (exerciseId, patch) => {
    const exercises = get().exercises.map((exercise) =>
      exercise.id === exerciseId ? { ...exercise, ...patch } : exercise,
    );
    const updated = exercises.find((exercise) => exercise.id === exerciseId);
    if (updated) await dbPut("exercises", updated);
    set({ exercises });
  },

  addCustom: async (data) => {
    const exercise: Exercise = {
      ...data,
      id: uid(),
      isSystem: false,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };
    await dbPut("exercises", exercise);
    set({ exercises: [...get().exercises, exercise] });
    return exercise;
  },
}));
