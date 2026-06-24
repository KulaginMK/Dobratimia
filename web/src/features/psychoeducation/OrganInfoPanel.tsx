import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { getOrganActions } from '@/lib/recommendations'
import type { Organ } from './types'

export function OrganInfoPanel({ organ }: { organ: Organ | null }) {
  const actions = organ ? getOrganActions(organ.id) : []

  return (
    <Card className="min-h-[280px]">
      {organ ? (
        <>
          <h3 className="text-xl font-bold text-primary-dark">
            {organ.emoji} {organ.name}
          </h3>
          <section className="mt-4">
            <h4 className="text-xs font-semibold uppercase text-muted">При стрессе</h4>
            <p className="mt-2 leading-relaxed">{organ.during}</p>
          </section>
          <section className="mt-4 rounded-xl border-l-4 border-primary bg-emerald-50 p-4">
            <h4 className="text-xs font-semibold uppercase text-muted">Как помочь себе</h4>
            <p className="mt-2 leading-relaxed">{organ.coping}</p>
          </section>
          {actions.length > 0 && (
            <section className="mt-4 flex flex-wrap gap-2">
              {actions.map((action) => (
                <Link
                  key={action.id}
                  to={action.href}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  {action.icon} {action.title}
                </Link>
              ))}
            </section>
          )}
        </>
      ) : (
        <p className="text-muted">Выберите орган на схеме или в списке ниже.</p>
      )}
    </Card>
  )
}
