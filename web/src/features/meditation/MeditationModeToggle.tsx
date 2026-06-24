import { NavLink } from 'react-router-dom'

export function MeditationModeToggle() {
  return (
    <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
      <NavLink
        to="/meditation"
        end
        className={({ isActive }) =>
          `rounded-lg px-4 py-2 text-sm font-medium transition ${
            isActive ? 'bg-white text-text shadow-sm' : 'text-muted hover:text-text'
          }`
        }
      >
        🫁 Дыхание
      </NavLink>
      <NavLink
        to="/meditation?pomodoro=1"
        className={({ isActive }) =>
          `rounded-lg px-4 py-2 text-sm font-medium transition ${
            isActive ? 'bg-white text-text shadow-sm' : 'text-muted hover:text-text'
          }`
        }
      >
        ⏰ Pomodoro
      </NavLink>
    </div>
  )
}
