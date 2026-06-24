import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HOME_SLIDES } from '@/config/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { WellnessTrendChart } from '@/components/WellnessTrendChart'
import { RecommendationCards } from '@/components/RecommendationCards'
import { getDassRecommendations } from '@/lib/recommendations'
import { formatEntryDate, getLatestEntry, loadHistory } from '@/lib/storage/dass-history'
import { getWeeklyAverage, hasEntryForToday, loadMoodDiary } from '@/lib/storage/mood-diary'

export function HomePage() {
  const [index, setIndex] = useState(0)
  const [latest] = useState(() => getLatestEntry())
  const slide = HOME_SLIDES[index]

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % HOME_SLIDES.length),
      6000,
    )
    return () => window.clearInterval(id)
  }, [])

  const dassHistory = loadHistory()
  const moodDiary = loadMoodDiary()
  const weeklyMood = getWeeklyAverage()

  const recommendations = latest
    ? getDassRecommendations({
        depression: latest.depression,
        anxiety: latest.anxiety,
        stress: latest.stress,
        levels: latest.levels,
      })
    : []

  return (
    <div>
      <header className="mb-8 text-center">
        <h2 className="text-2xl font-bold">Добро пожаловать</h2>
      </header>

      {!hasEntryForToday() && (
        <Card className="mb-8 border-l-4 border-amber-400 bg-amber-50/50">
          <p className="text-sm font-medium">Сегодня вы ещё не отмечали настроение</p>
          <Link to="/mood" className="mt-3 inline-block">
            <Button variant="secondary">Отметить сейчас</Button>
          </Link>
        </Card>
      )}

      {latest && (
        <Card className="mb-8 border-l-4 border-primary">
          <h3 className="font-semibold">📊 Ваше состояние</h3>
          <p className="mt-2 text-sm text-muted">
            Последний DASS-21: {formatEntryDate(latest.dateIso)}
          </p>
          <p className="mt-1 text-sm">
            Стресс — {latest.levels.stress.text.toLowerCase()}, тревога —{' '}
            {latest.levels.anxiety.text.toLowerCase()}, депрессия —{' '}
            {latest.levels.depression.text.toLowerCase()}
          </p>
          {weeklyMood !== null && (
            <p className="mt-2 text-sm text-muted">
              Среднее настроение за неделю: {weeklyMood} / 5
            </p>
          )}
          {(dassHistory.length >= 2 || moodDiary.length >= 2) && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Динамика</p>
              <WellnessTrendChart
                dassEntries={dassHistory}
                moodEntries={moodDiary}
                compact
              />
            </div>
          )}
          {recommendations.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Что может помочь:</p>
              <RecommendationCards items={recommendations.slice(0, 2)} />
            </div>
          )}
          <Link to="/dass" className="mt-4 inline-block">
            <Button variant="secondary">Пройти снова</Button>
          </Link>
        </Card>
      )}

      <div className="relative mx-auto mb-8 max-w-lg">
        <button
          type="button"
          aria-label="Назад"
          className="absolute top-1/2 left-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow"
          onClick={() => setIndex((i) => (i - 1 + HOME_SLIDES.length) % HOME_SLIDES.length)}
        >
          ‹
        </button>
        <article
          className="rounded-2xl bg-white p-8 text-center shadow-lg"
          style={{ borderTop: `4px solid ${slide.color}` }}
        >
          <span className="text-5xl">{slide.icon}</span>
          <h3 className="mt-4 text-xl font-bold">{slide.title}</h3>
          <p className="mt-2 text-muted">{slide.desc}</p>
          <Link to={slide.path} className="mt-6 inline-block">
            <Button>Перейти →</Button>
          </Link>
        </article>
        <button
          type="button"
          aria-label="Вперёд"
          className="absolute top-1/2 right-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow"
          onClick={() => setIndex((i) => (i + 1) % HOME_SLIDES.length)}
        >
          ›
        </button>
        <div className="mt-4 flex justify-center gap-2">
          {HOME_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Слайд ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full ${i === index ? 'bg-primary scale-110' : 'bg-slate-300'}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {HOME_SLIDES.map((s) => (
          <Link
            key={s.path}
            to={s.path}
            className="rounded-xl bg-white p-4 text-center shadow transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-3xl">{s.icon}</span>
            <p className="mt-2 text-sm font-semibold">{s.title}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
