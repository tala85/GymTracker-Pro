import { create } from "zustand";
import type { WorkoutExercise, WorkoutSession, WorkoutSet } from "../types";
import { dbGetAll } from "../lib/db";

interface HistoryState {
  sessions: WorkoutSession[];
  workoutExercises: WorkoutExercise[];
  workoutSets: WorkoutSet[];
  loaded: boolean;
  load: (force?: boolean) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  sessions: [],
  workoutExercises: [],
  workoutSets: [],
  loaded: false,

  load: async (force = false) => {
    if (get().loaded && !force) return;
    const [sessions, workoutExercises, workoutSets] = await Promise.all([
      dbGetAll<WorkoutSession>("workoutSessions"),
      dbGetAll<WorkoutExercise>("workoutExercises"),
      dbGetAll<WorkoutSet>("workoutSets"),
    ]);
    sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    set({ sessions, workoutExercises, workoutSets, loaded: true });
  },
}));
