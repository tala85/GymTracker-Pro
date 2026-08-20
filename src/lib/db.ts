import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'gymtracker-db'
const DB_VERSION = 2

const STORE_NAMES = [
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
  'syncQueue',
  'photos',
]

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const name of STORE_NAMES) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: 'id' })
          }
        }
      },
    })
  }
  return dbPromise
}

export async function dbPut<T extends { id: string }>(store: string, value: T): Promise<void> {
  const db = await getDB()
  await db.put(store, value)
}

export async function dbGet<T>(store: string, id: string): Promise<T | undefined> {
  const db = await getDB()
  return db.get(store, id) as Promise<T | undefined>
}

export async function dbGetAll<T>(store: string): Promise<T[]> {
  const db = await getDB()
  return db.getAll(store) as Promise<T[]>
}

export async function dbDelete(store: string, id: string): Promise<void> {
  const db = await getDB()
  await db.delete(store, id)
}

export async function dbBulkPut<T extends { id: string }>(store: string, values: T[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(store, 'readwrite')
  await Promise.all(values.map((value) => tx.store.put(value)))
  await tx.done
}