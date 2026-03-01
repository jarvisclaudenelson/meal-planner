import { NavLink } from 'react-router-dom'
import { Sun, CalendarDays, BookOpen, ShoppingCart } from 'lucide-react'

const navItems = [
  { to: '/today', icon: Sun, label: 'Today' },
  { to: '/plan', icon: CalendarDays, label: 'Plan' },
  { to: '/recipes', icon: BookOpen, label: 'Recipes' },
  { to: '/shopping', icon: ShoppingCart, label: 'Shopping' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
                isActive ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={isActive ? 'text-emerald-600' : 'text-gray-400'}
                />
                <span className={isActive ? 'font-semibold' : ''}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
