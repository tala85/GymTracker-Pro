interface PlaceholderPageProps {
  title: string
  phase: number
  description: string
}

export function PlaceholderPage({ title, phase, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        Se construye en la Fase {phase}
      </span>
    </div>
  )
}