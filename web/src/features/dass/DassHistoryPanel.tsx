import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { levelToneClass, type LevelTone } from '@/lib/dass-scoring'
import { WellnessTrendChart } from '@/components/WellnessTrendChart'
import {
  clearHistory,
  formatEntryDate,
  loadHistory,
  type DassHistoryEntry,
} from '@/lib/storage/dass-history'
import { loadMoodDiary } from '@/lib/storage/mood-diary'

const SCALE_LABELS = {
  depression: 'Д',
  anxiety: 'Т',
  stress: 'С',
} as const

function HistoryRow({ entry }: { entry: DassHistoryEntry }) {
  const maxScore = Math.max(entry.depression, entry.anxiety, entry.stress, 42)

  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <p className="text-sm font-medium">{formatEntryDate(entry.dateIso)}</p>
      <div className="mt-2 flex gap-3 text-xs">
        {(['depression', 'anxiety', 'stress'] as const).map((key) => (
          <div key={key} className="flex-1">
            <span className="text-muted">{SCALE_LABELS[key]}</span>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(entry[key] / maxScore) * 100}%` }}
              />
            </div>
            <span
              className={`mt-1 inline-block rounded px-1.5 py-0.5 ${levelToneClass[entry.levels[key].tone as LevelTone]}`}
            >
              {entry[key]} — {entry.levels[key].text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DassHistoryPanel() {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState(() => loadHistory())

  if (history.length === 0) return null

  const handleClear = () => {
    clearHistory()
    setHistory([])
    setOpen(false)
  }

  return (
    <Card className="mt-6">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left font-semibold"
        onClick={() => setOpen((v) => !v)}
      >
        <span>📊 История прохождений ({history.length})</span>
        <span className="text-muted">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-4">
          <WellnessTrendChart
            dassEntries={history}
            moodEntries={loadMoodDiary()}
          />
          <div className="mt-4">
          {history.slice(0, 10).map((entry) => (
            <HistoryRow key={entry.id} entry={entry} />
          ))}
          <Button variant="secondary" className="mt-4" onClick={handleClear}>
            Очистить историю
          </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
