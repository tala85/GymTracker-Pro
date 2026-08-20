import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useHistoryStore } from '../../stores/historyStore'
import { useExerciseStore } from '../../stores/exerciseStore'
import { estimateOneRm, formatDateEs, formatDuration } from '../../utils/helpers'
import { Card } from '../../components/ui/Card'

const nowAtLoad = Date.now()

const SELECT_CLASS =
  'rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white'

export function HistoryTab() {
  const sessions = useHistoryStore((state) => state.sessions)
  const workoutExercises = useHistoryStore((state) => state.workoutExercises)
  const workoutSets = useHistoryStore((state) => state.workoutSets)
  const load = useHistoryStore((state) => state.load)
  const library = useExerciseStore((state) => state.exercises)

  const [range, setRange] = useState<'7' | '30' | 'all'>('all')
  const [chosenExerciseId, setChosenExerciseId] = useState('')
  const [openSessionId, setOpenSessionId] = useState<string | null>(null)

  useEffect(() => {
    load(true)
  }, [load])

  const nameOf = (exerciseId: string) =>
    library.find((e) => e.id === exerciseId)?.name ?? 'Ejercicio'

  const exercisedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const wex of workoutExercises) {
      if (workoutSets.some((s) => s.workoutExerciseId === wex.id && s.isCompleted)) {
        ids.add(wex.exerciseId)
      }
    }
    return [...ids]
  }, [workoutExercises, workoutSets])

  const selectedExerciseId = exercisedIds.includes(chosenExerciseId)
    ? chosenExerciseId
    : exercisedIds[0] ?? ''

  const strengthChart = useMemo(() => {
    if (!selectedExerciseId) return []
    return [...sessions]
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
      .map((session) => {
        const wex = workoutExercises.find(
          (we) => we.workoutSessionId === session.id && we.exerciseId === selectedExerciseId
        )
        if (!wex) return null
        const sets = workoutSets.filter((s) => s.workoutExerciseId === wex.id && s.isCompleted)
        if (sets.length === 0) return null
        const maxWeight = Math.max(...sets.map((s) => s.weightKg))
        const best1Rm = Math.max(...sets.map((s) => estimateOneRm(s.weightKg, s.reps)))
        return { label: formatDateEs(session.startedAt), maxWeight, best1Rm }
      })
      .filter((point): point is { label: string; maxWeight: number; best1Rm: number } => point !== null)
  }, [sessions, workoutExercises, workoutSets, selectedExerciseId])

  const records = useMemo(() => {
    const byExercise = new Map<string, { weight: number; date: string }>()
    for (const session of sessions) {
      for (const wex of workoutExercises.filter((we) => we.workoutSessionId === session.id)) {
        for (const set of workoutSets.filter((st) => st.workoutExerciseId === wex.id && st.isCompleted)) {
          const current = byExercise.get(wex.exerciseId)
          if (!current || set.weightKg > current.weight) {
            byExercise.set(wex.exerciseId, { weight: set.weightKg, date: session.startedAt })
          }
        }
      }
    }
    return [...byExercise.entries()]
      .map(([exerciseId, value]) => ({ exerciseId, ...value }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
  }, [sessions, workoutExercises, workoutSets])

  const comparison = useMemo(() => {
    const now = new Date(nowAtLoad)
    const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const stats = (monthKey: string) => {
      const list = sessions.filter((s) => key(new Date(s.startedAt)) === monthKey)
      return {
        count: list.length,
        volume: list.reduce((acc, s) => acc + (s.totalVolumeKg ?? 0), 0),
      }
    }
    return { current: stats(key(now)), previous: stats(key(lastMonthDate)) }
  }, [sessions])

  const filteredSessions = useMemo(() => {
    if (range === 'all') return sessions
    const days = range === '7' ? 7 : 30
    const cutoff = nowAtLoad - days * 86400000
    return sessions.filter((s) => new Date(s.startedAt).getTime() >= cutoff)
  }, [sessions, range])

  if (sessions.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Todavía no hay entrenamientos guardados. Terminá tu primera sesión para verla acá.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {records.length > 0 && (
        <Card className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Trophy size={16} className="text-amber-400" /> Récords personales
          </h2>
          {records.map((record) => (
            <div key={record.exerciseId} className="flex items-center justify-between text-sm">
              <span>{nameOf(record.exerciseId)}</span>
              <span className="font-bold text-emerald-500">{record.weight} kg</span>
            </div>
          ))}
        </Card>
      )}

      <Card className="flex flex-col gap-2">
        <h2 className="text-sm font-bold">Este mes vs mes pasado</h2>
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
            <p className="font-bold">{comparison.current.count}</p>
            <p className="text-xs text-gray-500">Sesiones</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
            <p className="font-bold">{comparison.previous.count}</p>
            <p className="text-xs text-gray-500">Mes pasado</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
            <p className="font-bold">{comparison.current.volume.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Kg este mes</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
            <p className="font-bold">{comparison.previous.volume.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Kg mes pasado</p>
          </div>
        </div>
      </Card>

      {exercisedIds.length > 0 && (
        <Card className="flex flex-col gap-3">
          <select
            value={selectedExerciseId}
            onChange={(event) => setChosenExerciseId(event.target.value)}
            className={SELECT_CLASS}
          >
            {exercisedIds.map((id) => (
              <option key={id} value={id}>{nameOf(id)}</option>
            ))}
          </select>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={strengthChart}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#64748b" />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} stroke="#64748b" width={35} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }} />
              <Line type="monotone" dataKey="maxWeight" name="Peso máx (kg)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="best1Rm" name="1RM estimado" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Historial</h2>
        <select value={range} onChange={(event) => setRange(event.target.value as '7' | '30' | 'all')} className={SELECT_CLASS}>
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="all">Todo</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {filteredSessions.map((session) => {
          const open = openSessionId === session.id
          const sessionExercises = workoutExercises.filter((we) => we.workoutSessionId === session.id)
          const completedCount = workoutSets.filter(
            (s) => sessionExercises.some((we) => we.id === s.workoutExerciseId) && s.isCompleted
          ).length
          return (
            <Card key={session.id} className="flex flex-col gap-2">
              <button
                onClick={() => setOpenSessionId(open ? null : session.id)}
                className="flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-sm font-semibold">{session.dayName ?? 'Entrenamiento'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateEs(session.startedAt)} · {formatDuration(session.durationSeconds ?? 0)} ·{' '}
                    {completedCount} series · {(session.totalVolumeKg ?? 0).toLocaleString()} kg
                  </p>
                </div>
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {open && (
                <div className="flex flex-col gap-2 border-t border-gray-200 pt-2 dark:border-slate-700">
                  {sessionExercises.map((wex) => {
                    const sets = workoutSets.filter((s) => s.workoutExerciseId === wex.id && s.isCompleted)
                    if (sets.length === 0) return null
                    return (
                      <div key={wex.id}>
                        <p className="text-sm font-medium">{nameOf(wex.exerciseId)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {sets.map((s) => `${s.weightKg}kg×${s.reps}`).join(' · ')}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}