import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/config/navigation'

export function TopNav() {
  return (
    <nav className="sticky top-0 z-40 hidden overflow-x-auto border-b border-slate-200 bg-white shadow-sm lg:block">
      <ul className="mx-auto flex max-w-5xl gap-1 px-4 py-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  item.accent === 'scream'
                    ? isActive
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                    : isActive
                      ? 'bg-primary text-white'
                      : 'text-text hover:bg-slate-100'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
