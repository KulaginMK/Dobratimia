import { Link } from 'react-router-dom'
import type { Recommendation } from '@/lib/recommendations'

export function RecommendationCards({ items }: { items: Recommendation[] }) {
  if (items.length === 0) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.href}
          className={`block rounded-xl border-2 p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
            item.priority === 'sos'
              ? 'border-red-300 bg-red-50 hover:border-red-400'
              : 'border-slate-200 bg-white hover:border-primary'
          }`}
        >
          <span className="text-2xl">{item.icon}</span>
          <p className="mt-2 font-semibold text-text">{item.title}</p>
          <p className="mt-1 text-sm text-muted">{item.description}</p>
        </Link>
      ))}
    </div>
  )
}
