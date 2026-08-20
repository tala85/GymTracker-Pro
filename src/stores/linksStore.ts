import { create } from 'zustand'
import type { UserLink } from '../types'
import { dbBulkPut, dbDelete, dbGetAll, dbPut } from '../lib/db'
import { SYSTEM_LINKS } from '../data/links'
import { uid } from '../utils/helpers'

interface LinksState {
  links: UserLink[]
  loaded: boolean
  load: () => Promise<void>
  addCustom: (data: { title: string; url: string; category: string }) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  resetSystem: () => Promise<void>
}

export const useLinksStore = create<LinksState>((set, get) => ({
  links: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return
    let local = await dbGetAll<UserLink>('links')
    const missing = SYSTEM_LINKS.filter((sys) => !local.some((l) => l.id === sys.id))
    if (missing.length > 0) {
      await dbBulkPut('links', missing)
      local = [...local, ...missing]
    }
    if (local.length === 0) {
      await dbBulkPut('links', SYSTEM_LINKS)
      local = SYSTEM_LINKS
    }
    set({ links: local, loaded: true })
  },

  addCustom: async (data) => {
    const userLink: UserLink = {
      id: uid(),
      title: data.title,
      url: data.url,
      category: data.category,
      isFavorite: false,
      isSystem: false,
      createdAt: new Date().toISOString(),
    }
    await dbPut('links', userLink)
    set({ links: [...get().links, userLink] })
  },

  toggleFavorite: async (id) => {
    const links = get().links.map((l) => (l.id === id ? { ...l, isFavorite: !l.isFavorite } : l))
    const updated = links.find((l) => l.id === id)
    if (updated) await dbPut('links', updated)
    set({ links })
  },

  remove: async (id) => {
    await dbDelete('links', id)
    set({ links: get().links.filter((l) => l.id !== id) })
  },

  resetSystem: async () => {
    const systemIds = get().links.filter((l) => l.isSystem).map((l) => l.id)
    for (const id of systemIds) {
      await dbDelete('links', id)
    }
    const userLinks = get().links.filter((l) => !l.isSystem)
    await dbBulkPut('links', SYSTEM_LINKS)
    set({ links: [...userLinks, ...SYSTEM_LINKS] })
  },
}))