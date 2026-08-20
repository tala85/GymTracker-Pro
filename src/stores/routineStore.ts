import { create } from "zustand";
import type { Routine, RoutineDay, RoutineExercise } from "../types";
import { dbBulkPut, dbDelete, dbGetAll, dbPut } from "../lib/db";
import { uid } from "../utils/helpers";
import { TEMPLATES } from "../data/templates";
import { exerciseId } from "../data/exercises";

interface RoutineState {
  routines: Routine[];
  daysByRoutine: Record<string, RoutineDay[]>;
  exercisesByDay: Record<string, RoutineExercise[]>;
  loaded: boolean;
  load: () => Promise<void>;
  createFromTemplate: (templateKey: string) => Promise<Routine>;
  createBlank: (name: string) => Promise<Routine>;
  updateRoutine: (routineId: string, patch: Partial<Routine>) => Promise<void>;
  duplicateRoutine: (routineId: string) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
  setActive: (routineId: string) => Promise<void>;
  addDay: (
    routineId: string,
    name: string,
    weekday: number,
  ) => Promise<RoutineDay>;
  updateDay: (dayId: string, patch: Partial<RoutineDay>) => Promise<void>;
  deleteDay: (dayId: string) => Promise<void>;
  addExerciseToDay: (dayId: string, exerciseIdValue: string) => Promise<void>;
  updateRoutineExercise: (
    id: string,
    patch: Partial<RoutineExercise>,
  ) => Promise<void>;
  removeRoutineExercise: (id: string) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  daysByRoutine: {},
  exercisesByDay: {},
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    const [routines, days, exercises] = await Promise.all([
      dbGetAll<Routine>("routines"),
      dbGetAll<RoutineDay>("routineDays"),
      dbGetAll<RoutineExercise>("routineExercises"),
    ]);
    const daysByRoutine: Record<string, RoutineDay[]> = {};
    for (const day of days) {
      (daysByRoutine[day.routineId] ??= []).push(day);
    }
    for (const key of Object.keys(daysByRoutine)) {
      daysByRoutine[key].sort((a, b) => a.dayNumber - b.dayNumber);
    }
    const exercisesByDay: Record<string, RoutineExercise[]> = {};
    for (const exercise of exercises) {
      (exercisesByDay[exercise.routineDayId] ??= []).push(exercise);
    }
    for (const key of Object.keys(exercisesByDay)) {
      exercisesByDay[key].sort((a, b) => a.order - b.order);
    }
    routines.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    set({ routines, daysByRoutine, exercisesByDay, loaded: true });
  },

  createFromTemplate: async (templateKey) => {
    const template = TEMPLATES.find((t) => t.key === templateKey);
    if (!template) throw new Error("Plantilla no encontrada");
    const isFirst = get().routines.length === 0;
    const routine: Routine = {
      id: uid(),
      name: template.name,
      description: template.description,
      goal: template.goal,
      split: template.split,
      isActive: isFirst,
      createdAt: new Date().toISOString(),
    };
    const days: RoutineDay[] = template.days.map((day, index) => ({
      id: uid(),
      routineId: routine.id,
      dayNumber: index + 1,
      weekday: day.weekday,
      name: day.name,
      targetMuscles: day.muscles,
      isRestDay: false,
    }));
    const routineExercises: RoutineExercise[] = [];
    days.forEach((day, dayIndex) => {
      template.days[dayIndex].exercises.forEach(
        ([name, sets, reps, rir, rest], orderIndex) => {
          routineExercises.push({
            id: uid(),
            routineDayId: day.id,
            exerciseId: exerciseId(name),
            order: orderIndex + 1,
            setsTarget: sets,
            repsTarget: reps,
            rirTarget: rir,
            restSeconds: rest,
          });
        },
      );
    });
    await dbPut("routines", routine);
    await dbBulkPut("routineDays", days);
    await dbBulkPut("routineExercises", routineExercises);
    set({ loaded: false });
    await get().load();
    return routine;
  },

  createBlank: async (name) => {
    const isFirst = get().routines.length === 0;
    const routine: Routine = {
      id: uid(),
      name,
      goal: "hipertrofia",
      split: "personalizado",
      isActive: isFirst,
      createdAt: new Date().toISOString(),
    };
    await dbPut("routines", routine);
    set({ loaded: false });
    await get().load();
    return routine;
  },

  updateRoutine: async (routineId, patch) => {
    const routine = get().routines.find((r) => r.id === routineId);
    if (!routine) return;
    const updated = { ...routine, ...patch };
    await dbPut("routines", updated);
    set({
      routines: get().routines.map((r) => (r.id === routineId ? updated : r)),
    });
  },

  duplicateRoutine: async (routineId) => {
    const routine = get().routines.find((r) => r.id === routineId);
    if (!routine) return;
    const copy: Routine = {
      ...routine,
      id: uid(),
      name: `${routine.name} (copia)`,
      isActive: false,
      createdAt: new Date().toISOString(),
    };
    const originalDays = get().daysByRoutine[routineId] ?? [];
    const newDays: RoutineDay[] = [];
    const newExercises: RoutineExercise[] = [];
    for (const day of originalDays) {
      const newDay: RoutineDay = { ...day, id: uid(), routineId: copy.id };
      newDays.push(newDay);
      for (const exercise of get().exercisesByDay[day.id] ?? []) {
        newExercises.push({ ...exercise, id: uid(), routineDayId: newDay.id });
      }
    }
    await dbPut("routines", copy);
    await dbBulkPut("routineDays", newDays);
    await dbBulkPut("routineExercises", newExercises);
    set({ loaded: false });
    await get().load();
  },

  deleteRoutine: async (routineId) => {
    const days = get().daysByRoutine[routineId] ?? [];
    for (const day of days) {
      for (const exercise of get().exercisesByDay[day.id] ?? []) {
        await dbDelete("routineExercises", exercise.id);
      }
      await dbDelete("routineDays", day.id);
    }
    await dbDelete("routines", routineId);
    set({ loaded: false });
    await get().load();
  },

  setActive: async (routineId) => {
    for (const routine of get().routines) {
      const shouldBeActive = routine.id === routineId;
      if (routine.isActive !== shouldBeActive) {
        await dbPut("routines", { ...routine, isActive: shouldBeActive });
      }
    }
    set({
      routines: get().routines.map((r) => ({
        ...r,
        isActive: r.id === routineId,
      })),
    });
  },

  addDay: async (routineId, name, weekday) => {
    const existing = get().daysByRoutine[routineId] ?? [];
    const day: RoutineDay = {
      id: uid(),
      routineId,
      dayNumber: existing.length + 1,
      weekday,
      name,
      targetMuscles: [],
      isRestDay: false,
    };
    await dbPut("routineDays", day);
    set({ loaded: false });
    await get().load();
    return day;
  },

  updateDay: async (dayId, patch) => {
    for (const [routineId, days] of Object.entries(get().daysByRoutine)) {
      const day = days.find((d) => d.id === dayId);
      if (day) {
        const updated = { ...day, ...patch };
        await dbPut("routineDays", updated);
        set({
          daysByRoutine: {
            ...get().daysByRoutine,
            [routineId]: days.map((d) => (d.id === dayId ? updated : d)),
          },
        });
        return;
      }
    }
  },

  deleteDay: async (dayId) => {
    for (const exercise of get().exercisesByDay[dayId] ?? []) {
      await dbDelete("routineExercises", exercise.id);
    }
    await dbDelete("routineDays", dayId);
    set({ loaded: false });
    await get().load();
  },

  addExerciseToDay: async (dayId, exerciseIdValue) => {
    const existing = get().exercisesByDay[dayId] ?? [];
    const routineExercise: RoutineExercise = {
      id: uid(),
      routineDayId: dayId,
      exerciseId: exerciseIdValue,
      order: existing.length + 1,
      setsTarget: 3,
      repsTarget: "8-12",
      rirTarget: 1,
      restSeconds: 90,
    };
    await dbPut("routineExercises", routineExercise);
    set({ loaded: false });
    await get().load();
  },

  updateRoutineExercise: async (id, patch) => {
    for (const [dayId, exercises] of Object.entries(get().exercisesByDay)) {
      const exercise = exercises.find((e) => e.id === id);
      if (exercise) {
        const updated = { ...exercise, ...patch };
        await dbPut("routineExercises", updated);
        set({
          exercisesByDay: {
            ...get().exercisesByDay,
            [dayId]: exercises.map((e) => (e.id === id ? updated : e)),
          },
        });
        return;
      }
    }
  },

  removeRoutineExercise: async (id) => {
    await dbDelete("routineExercises", id);
    set({ loaded: false });
    await get().load();
  },
}));
