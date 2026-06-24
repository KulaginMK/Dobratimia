import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

export function AboutPage() {
  return (
    <div>
      <PageHeader title="ℹ️ О проекте" subtitle="Платформа самопомощи для студентов медвузов" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card className="text-center">
          <p className="text-4xl font-bold text-primary">89,6%</p>
          <p className="mt-2 text-sm text-muted">студентов с тревогой и стрессом</p>
        </Card>
        <Card className="text-center">
          <p className="text-4xl font-bold text-secondary">23%</p>
          <p className="mt-2 text-sm text-muted">высокий уровень стресса</p>
        </Card>
      </div>

      <Card className="space-y-4 text-muted leading-relaxed">
        <p>
          <strong className="text-text">Добратимия</strong> — бесплатная платформа самодиагностики и
          самопомощи для обучения в условиях повышенной стрессогенности (медицинские вузы).
        </p>
        <p>
          Включает DASS-21, пространство «Крик», медитации, психообразование, техники совладания и
          карту поддерживающих мест.
        </p>
        <p className="rounded-lg bg-amber-50 p-3 text-amber-900 text-sm">
          ⚠️ Не заменяет профессиональную медицинскую или психологическую помощь.
        </p>
      </Card>
    </div>
  )
}
