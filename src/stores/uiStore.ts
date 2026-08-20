import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  theme: 'dark' | 'light'
  isOnline: boolean
  toggleTheme: () => void
  setOnline: (value: boolean) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark',
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setOnline: (isOnline) => set({ isOnline }),
    }),
    { name: 'gymtracker-ui' }
  )
)