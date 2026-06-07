import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

const TECHNIQUES = [
  {
    icon: '🫁',
    title: 'Дыхание 4-7-8',
    steps: ['Вдох 4 сек', 'Задержка 7 сек', 'Выдох 8 сек', '4–5 циклов'],
  },
  {
    icon: '🧘',
    title: 'Прогрессивная релаксация',
    steps: ['Напрягите кисти 5 сек', 'Расслабьте 10 сек', 'Пройдите по всем группам мышц'],
  },
  {
    icon: '📝',
    title: 'Дневник мыслей',
    steps: ['Запишите мысль', 'Оцените 0–100%', 'Найдите альтернативу'],
  },
  {
    icon: '⏰',
    title: 'Pomodoro',
    steps: ['25 мин работы', '5 мин отдыха', 'Микропаузы каждые 50 мин'],
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
          </Card>
        ))}
      </div>
    </div>
  )
}
