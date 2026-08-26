interface MuscleMapProps {
  primary: string
  secondary: string[]
}

interface CellPosition {
  col: number
  row: number
  offsetX?: number // Positivo = derecha, Negativo = izquierda
  offsetY?: number // Positivo = abajo, Negativo = arriba
}

const CELLS: Record<string, CellPosition> = {
  Pecho: { col: 0, row: 0 },
  Bíceps: { col: 1, row: 0, offsetX: 2 },
  Hombros: { col: 2, row: 0, offsetX: 1 },
  Cuádriceps: { col: 3, row: 0 },
  Core: { col: 4, row: 0 },
  Trapecio: { col: 5, row: 0 },
  Trapecios: { col: 5, row: 0 }, 
  Espalda: { col: 0, row: 1, offsetY: -5 },
  Tríceps: { col: 2, row: 1, offsetX: 1, offsetY: -5 },
  Pantorrillas: { col: 3, row: 1, offsetX: 1, offsetY: -5 },
  Glúteos: { col: 4, row: 1, offsetY: -5 }, // Ejemplo: subí 2%
  Isquiotibiales: { col: 5, row: 1, offsetY: -5 },
}

function MiniFigure({ muscle, level }: { muscle: string; level: 'primary' | 'secondary' }) {
  const cell = CELLS[muscle]
  if (!cell) return null
  
  const baseX = cell.col * (100 / 5) + (cell.offsetX ?? 0)
  const baseY = cell.row * 100 + (cell.offsetY ?? 0)
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-40 w-28 overflow-hidden rounded-lg bg-white ${
          level === 'primary'
            ? 'ring-2 ring-emerald-500'
            : 'opacity-90 ring-1 ring-slate-300 dark:ring-slate-600'
        }`}
        style={{
          backgroundImage: 'url(/muscle-sprite.png)',
          backgroundSize: '600% 200%',
          backgroundPosition: `${baseX}% ${baseY}%`,
        }}
      />
      <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
        {level === 'primary' ? '★ ' : ''}
        {muscle}
      </p>
    </div>
  )
}

export function MuscleMap({ primary, secondary }: MuscleMapProps) {
  const shown = [
    { muscle: primary, level: 'primary' as const },
    ...secondary.map((m) => ({ muscle: m, level: 'secondary' as const })),
  ].filter((item) => CELLS[item.muscle])

  if (shown.length === 0) return null

  return (
    <div className="flex flex-wrap items-end justify-center gap-3 rounded-lg bg-slate-100 p-3 dark:bg-slate-700/40">
      {shown.map((item) => (
        <MiniFigure key={item.muscle} muscle={item.muscle} level={item.level} />
      ))}
    </div>
  )
}