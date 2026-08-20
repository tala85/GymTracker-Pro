import { create } from 'zustand'
import type { ProgressPhoto } from '../types'
import { dbDelete, dbGetAll, dbPut } from '../lib/db'
import { uid } from '../utils/helpers'

interface PhotosState {
  photos: ProgressPhoto[]
  loaded: boolean
  load: () => Promise<void>
  add: (data: Omit<ProgressPhoto, 'id' | 'createdAt'>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const usePhotosStore = create<PhotosState>((set, get) => ({
  photos: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return
    const all = await dbGetAll<ProgressPhoto>('photos')
    all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    set({ photos: all, loaded: true })
  },

  add: async (data) => {
    const photo: ProgressPhoto = {
      ...data,
      id: uid(),
      createdAt: new Date().toISOString(),
    }
    await dbPut('photos', photo)
    set({ photos: [photo, ...get().photos] })
  },

  remove: async (id) => {
    await dbDelete('photos', id)
    set({ photos: get().photos.filter((p) => p.id !== id) })
  },
}))