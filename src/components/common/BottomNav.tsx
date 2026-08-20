import { NavLink } from 'react-router-dom'
import { Home, CalendarDays, Dumbbell, TrendingUp, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/rutinas', label: 'Rutinas', icon: CalendarDays },
  { to: '/ejercicios', label: 'Ejercicios', icon: Dumbbell },
  { to: '/progreso', label: 'Progreso', icon: TrendingUp },
  { to: '/configuracion', label: 'Ajustes', icon: Settings },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white pb-safe dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto flex max-w-md items-stretch justify-between">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-emerald-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}