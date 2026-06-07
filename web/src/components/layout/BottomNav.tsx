import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/config/navigation'

const mobileTabs = NAV_ITEMS.filter((i) =>
  ['/', '/scream', '/dass', '/meditation', '/goodword'].includes(i.path),
)

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="flex justify-around">
        {mobileTabs.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex min-w-[4rem] flex-col items-center gap-0.5 px-2 py-2 text-[0.65rem] font-medium ${
                  isActive ? 'text-primary' : 'text-muted'
                } ${item.accent === 'scream' && isActive ? 'text-danger' : ''}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="truncate">{item.label.split(' ')[0]}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
