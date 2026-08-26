import { create } from "zustand";
import type { WellnessDay } from "../types";
import { dbGetAll, dbPut } from "../lib/db";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyDay(date: string): WellnessDay {
  return {
    id: date,
    date,
    waterGlasses: 0,
    sleepHours: 0,
    sunMinutes: 0,
    nutritionGood: false,
    temperanceGood: false,
    airGood: false,
    trustDone: false,
    exerciseManual: false,
  };
}

interface WellnessState {
  days: Record<string, WellnessDay>;
  loaded: boolean;
  load: () => Promise<void>;
  updateToday: (patch: Partial<WellnessDay>) => Promise<void>;
}

export const useWellnessStore = create<WellnessState>((set, get) => ({
  days: {},
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const all = await dbGetAll<WellnessDay>("wellness");
      const map: Record<string, WellnessDay> = {};
      for (const day of all) map[day.id] = day;
      set({ days: map, loaded: true });
    } catch (err) {
      console.error("No se pudo cargar bienestar", err);
      set({ days: {}, loaded: true });
    }
  },

  updateToday: async (patch) => {
    const key = todayKey();
    const current = get().days[key] ?? emptyDay(key);
    const next = { ...current, ...patch };
    await dbPut("wellness", next);
    set({ days: { ...get().days, [key]: next } });
  },
}));
