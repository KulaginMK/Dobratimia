import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

const TECHNIQUES = [
  {
    icon: '🫁',
    title: 'Дыхание 4-7-8',
    steps: ['Вдох 4 сек', 'Задержка 7 сек', 'Выдох 8 сек', '4–5 циклов'],
    action: { label: 'Начать в медитациях', href: '/meditation?mode=1' },
  },
  {
    icon: '🧘',
    title: 'Прогрессивная релаксация',
    steps: ['Напрягите кисти 5 сек', 'Расслабьте 10 сек', 'Пройдите по всем группам мышц'],
    action: { label: 'Анатомия: мышцы', href: '/psychoeducation' },
  },
  {
    icon: '📝',
    title: 'Дневник мыслей',
    steps: ['Запишите мысль', 'Оцените 0–100%', 'Найдите альтернативу'],
    action: { label: 'Дневник настроения', href: '/mood' },
  },
  {
    icon: '⏰',
    title: 'Pomodoro',
    steps: ['25 мин работы', '5 мин отдыха', 'Микропаузы каждые 50 мин'],
    action: { label: 'Открыть Pomodoro', href: '/meditation?pomodoro=1' },
  },
]

export function TechniquesPage() {
  return (
    <div>
      <PageHeader
        title="💡 Техники самопомощи"
        subtitle="Проверенные методы при стрессе и тревоге"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {TECHNIQUES.map((t) => (
          <Card key={t.title}>
            <span className="text-3xl">{t.icon}</span>
            <h3 className="mt-2 text-lg font-semibold text-primary">{t.title}</h3>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted">
              {t.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {t.action && (
              <Link
                to={t.action.href}
                className="mt-4 inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
              >
                {t.action.label} →
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
