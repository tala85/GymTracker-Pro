import { Loader2 } from 'lucide-react'

export function Spinner({ full = false }: { full?: boolean }) {
  const icon = <Loader2 className="animate-spin text-emerald-500" size={28} />
  if (!full) return icon
  return <div className="flex min-h-screen items-center justify-center">{icon}</div>
}