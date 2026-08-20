import { getDB } from '../lib/db'

const STORES = [
  'routines',
  'routineDays',
  'routineExercises',
  'exercises',
  'workoutSessions',
  'workoutExercises',
  'workoutSets',
  'measurements',
  'links',
  'settings',
  'photos',
]

export async function collectAllData(): Promise<string> {
  const db = await getDB()
  const data: Record<string, unknown[]> = {}
  for (const store of STORES) {
    data[store] = await db.getAll(store)
  }
  return JSON.stringify(
    { app: 'gymtracker-pro', version: 1, exportedAt: new Date().toISOString(), data },
    null,
    2
  )
}

export async function exportAllData(): Promise<void> {
  const json = await collectAllData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `gymtracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function importAllData(json: string): Promise<void> {
  const parsed = JSON.parse(json) as { app?: string; data?: Record<string, { id: string }[]> }
  if (parsed.app !== 'gymtracker-pro' || !parsed.data) {
    throw new Error('Archivo de respaldo inválido')
  }
  const db = await getDB()
  for (const store of STORES) {
    const rows = parsed.data[store]
    if (!rows) continue
    const tx = db.transaction(store, 'readwrite')
    await tx.store.clear()
    await Promise.all(rows.map((row) => tx.store.put(row)))
    await tx.done
  }
}