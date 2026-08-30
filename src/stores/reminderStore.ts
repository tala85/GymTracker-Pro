import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ReminderSettings {
  workoutEnabled: boolean
  workoutDays: number[]
  workoutTime: string
  waterEnabled: boolean
  waterIntervalHours: number
  nutritionEnabled: boolean
  nutritionTime: string
  sunEnabled: boolean
  sunTime: string
  airEnabled: boolean
  airTime: string
  temperanceEnabled: boolean
  temperanceTime: string
  restEnabled: boolean
  restTime: string
  trustEnabled: boolean
  trustTimes: string[]     // ✅ 3 momentos del día
}

interface ReminderState {
  settings: ReminderSettings
  updateSettings: (partial: Partial<ReminderSettings>) => void
}

const defaultSettings: ReminderSettings = {
  workoutEnabled: false,
  workoutDays: [1, 3, 5],
  workoutTime: '07:00',
  waterEnabled: false,
  waterIntervalHours: 2,
  nutritionEnabled: false,
  nutritionTime: '13:00',
  sunEnabled: false,
  sunTime: '08:00',
  airEnabled: false,
  airTime: '10:30',
  temperanceEnabled: false,
  temperanceTime: '21:00',
  restEnabled: false,
  restTime: '22:00',
  trustEnabled: false,
  trustTimes: ['08:00', '14:00', '20:00'],
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    {
      name: 'gymtracker-reminders',
      // Merge profundo: si ya había settings guardados, los nuevos campos
      // toman el default sin romperse
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ReminderState> | undefined
        return {
          ...currentState,
          ...persisted,
          settings: { ...currentState.settings, ...(persisted?.settings ?? {}) },
        }
      },
    },
  ),
)