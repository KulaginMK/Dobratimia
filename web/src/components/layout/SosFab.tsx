import { Link } from 'react-router-dom'

export function SosFab() {
  return (
    <Link
      to="/resources"
      aria-label="Помощь и ресурсы"
      className="fixed right-4 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-2xl text-white shadow-lg shadow-red-600/40 transition hover:scale-105 hover:bg-red-700 lg:bottom-8"
    >
      🆘
    </Link>
  )
}
