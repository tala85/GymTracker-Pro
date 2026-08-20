import { create } from 'zustand'
import type { Measurement } from '../types'
import { dbDelete, dbGetAll, dbPut } from '../lib/db'
import { uid } from '../utils/helpers'

interface MeasurementState {
  measurements: Measurement[]
  loaded: boolean
  load: () => Promise<void>
  add: (data: Omit<Measurement, 'id' | 'userId'>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  measurements: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return
    const all = await dbGetAll<Measurement>('measurements')
    all.sort((a, b) => b.date.localeCompare(a.date))
    set({ measurements: all, loaded: true })
  },

  add: async (data) => {
    const measurement: Measurement = { ...data, id: uid() }
    await dbPut('measurements', measurement)
    set({ loaded: false })
    await get().load()
  },

  remove: async (id) => {
    await dbDelete('measurements', id)
    set({ loaded: false })
    await get().load()
  },
}))