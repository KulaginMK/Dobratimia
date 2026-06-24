import { useEffect, useState } from 'react'
import { RecommendationCards } from '@/components/RecommendationCards'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { WarningBox } from '@/components/ui/WarningBox'
import { DASS_OPTIONS, DASS_QUESTIONS } from '@/data/dass'
import { getDassRecommendations } from '@/lib/recommendations'
import { levelToneClass, scoreDass, type DassResult } from '@/lib/dass-scoring'
import {
  formatEntryDate,
  getLatestEntry,
  loadHistory,
  saveEntry,
} from '@/lib/storage/dass-history'
import { DassHistoryPanel } from './DassHistoryPanel'

export function DassPage() {
  const [started, setStarted] = useState(false)
  const [q, setQ] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(21).fill(null))
  const [result, setResult] = useState<DassResult | null>(null)
  const [latest, setLatest] = useState(() => getLatestEntry())

  const pick = (value: number) => {
    const next = [...answers]
    next[q] = value
    setAnswers(next)
  }

  const finish = () => {
    const scored = scoreDass(answers)
    saveEntry(scored)
    setLatest(getLatestEntry())
    setResult(scored)
    setStarted(false)
  }

  const reset = () => {
    setAnswers(Array(21).fill(null))
    setQ(0)
    setResult(null)
    setStarted(false)
  }

  useEffect(() => {
    if (!result) setLatest(getLatestEntry())
  }, [result])

  if (result) {
    const recommendations = getDassRecommendations(result)
    const showSos = recommendations.some((r) => r.priority === 'sos')

    return (
      <div>
        <PageHeader title="📋 Результаты DASS-21" />
        {showSos && (
          <WarningBox className="mb-6">
            Баллы выше нормы. Рекомендуем обратиться к специалисту или позвонить на{' '}
            <a href="tel:88002000122" className="font-bold underline">
              8-800-2000-122
            </a>
            .
          </WarningBox>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          {(['depression', 'anxiety', 'stress'] as const).map((key) => (
            <Card key={key} className="text-center">
              <p className="text-sm text-muted capitalize">
                {key === 'depression' ? 'Депрессия' : key === 'anxiety' ? 'Тревога' : 'Стресс'}
              </p>
              <p className="mt-2 text-4xl font-bold">{result[key]}</p>
              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${levelToneClass[result.levels[key].tone]}`}
              >
                {result.levels[key].text}
              </span>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <h3 className="mb-4 font-semibold">Что попробовать сейчас</h3>
          <RecommendationCards items={recommendations} />
        </Card>

        <DassHistoryPanel key={loadHistory().length} />

        <Button className="mt-8" onClick={reset}>
          🔄 Пройти снова
        </Button>
      </div>
    )
  }

  if (!started) {
    return (
      <div>
        <PageHeader
          title="📋 DASS-21"
          subtitle="Шкала депрессии, тревоги и стресса. 21 вопрос, ~5 минут."
        />
        <WarningBox>
          Тест для самодиагностики не заменяет консультацию специалиста. Результаты сохраняются
          только на этом устройстве.
        </WarningBox>
        {latest && (
          <Card className="mb-4 border-l-4 border-primary">
            <p className="text-sm text-muted">Последнее прохождение</p>
            <p className="mt-1 font-medium">
              {formatEntryDate(latest.dateIso)} — стресс: {latest.levels.stress.text.toLowerCase()},
              тревога: {latest.levels.anxiety.text.toLowerCase()}
            </p>
          </Card>
        )}
        <Card>
          <p className="text-muted">
            Отвечайте, насколько каждое утверждение относилось к вам за последнюю неделю.
          </p>
          <Button className="mt-6" onClick={() => setStarted(true)}>
            Начать тест
          </Button>
        </Card>
        {latest && <DassHistoryPanel />}
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={`Вопрос ${q + 1} из 21`} />
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((q + 1) / 21) * 100}%` }}
        />
      </div>
      <Card>
        <p className="mb-6 text-lg font-medium">{DASS_QUESTIONS[q]}</p>
        <ul className="space-y-2">
          {DASS_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => pick(opt.value)}
                className={`w-full rounded-xl border-2 px-4 py-3 text-left transition ${
                  answers[q] === opt.value
                    ? 'border-primary bg-emerald-50 font-medium'
                    : 'border-slate-200 hover:border-primary/50'
                }`}
              >
                {opt.text}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="secondary" disabled={q === 0} onClick={() => setQ((x) => x - 1)}>
            ← Назад
          </Button>
          {q < 20 ? (
            <Button disabled={answers[q] === null} onClick={() => setQ((x) => x + 1)}>
              Далее →
            </Button>
          ) : (
            <Button disabled={answers[q] === null} onClick={finish}>
              ✅ Завершить
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
