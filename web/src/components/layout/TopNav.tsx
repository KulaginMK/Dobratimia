import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/config/navigation'

export function TopNav() {
  return (
    <nav className="sticky top-0 z-40 hidden border-b border-slate-200/70 bg-white/85 shadow-sm backdrop-blur-md lg:block">
      <div className="scrollbar-hide overflow-x-auto">
        <ul className="mx-auto flex w-max min-w-full max-w-5xl justify-center gap-1.5 px-4 py-2.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.path} className="shrink-0">
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    item.accent === 'scream'
                      ? isActive
                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-500/25'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                      : isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                        : 'text-text hover:bg-slate-100/90'
                  }`
                }
              >
                <span aria-hidden className="text-base leading-none">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
