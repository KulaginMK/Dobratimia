import type { ReactElement } from 'react'
import type { DassHistoryEntry } from '@/lib/storage/types'
import type { MoodEntry } from '@/lib/storage/types'

const DASS_MAX = 42
const MOOD_MAX = 5
const W = 400
const H = 160
const PAD = { top: 16, right: 12, bottom: 28, left: 36 }
const CHART_W = W - PAD.left - PAD.right
const CHART_H = H - PAD.top - PAD.bottom

type Props = {
  dassEntries?: DassHistoryEntry[]
  moodEntries?: MoodEntry[]
  compact?: boolean
}

const DASS_COLORS = {
  depression: '#8b5cf6',
  anxiety: '#f59e0b',
  stress: '#ef4444',
} as const

const MOOD_COLOR = '#10b981'

function toX(i: number, count: number): number {
  if (count <= 1) return PAD.left + CHART_W / 2
  return PAD.left + (i / (count - 1)) * CHART_W
}

function toY(value: number, max: number): number {
  return PAD.top + CHART_H - (value / max) * CHART_H
}

function polyline(
  points: { x: number; y: number }[],
  color: string,
  dashed = false,
): ReactElement | null {
  if (points.length < 2) return null
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? '4 3' : undefined}
    />
  )
}

export function WellnessTrendChart({ dassEntries = [], moodEntries = [], compact }: Props) {
  const dass = [...dassEntries].reverse().slice(-10)
  const moods = [...moodEntries]
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .slice(-10)

  const hasDass = dass.length >= 2
  const hasMood = moods.length >= 2

  if (!hasDass && !hasMood) {
    return (
      <p className="text-sm text-muted">
        Недостаточно данных для графика — нужно минимум 2 записи.
      </p>
    )
  }

  const dassLines = hasDass
    ? (['depression', 'anxiety', 'stress'] as const).map((key) => ({
        key,
        points: dass.map((e, i) => ({
          x: toX(i, dass.length),
          y: toY(e[key], DASS_MAX),
        })),
      }))
    : []

  const moodPoints = hasMood
    ? moods.map((e, i) => ({
        x: toX(i, moods.length),
        y: toY(e.score, MOOD_MAX),
      }))
    : []

  const height = compact ? 120 : H

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="w-full"
        role="img"
        aria-label="График динамики DASS и настроения"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + CHART_H * (1 - t)
          return (
            <line
              key={t}
              x1={PAD.left}
              y1={y}
              x2={PAD.left + CHART_W}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          )
        })}

        {dassLines.map(({ key, points }) => polyline(points, DASS_COLORS[key]))}
        {polyline(moodPoints, MOOD_COLOR, true)}

        {dass.map((e, i) => (
          <text
            key={e.id}
            x={toX(i, dass.length)}
            y={H - 4}
            textAnchor="middle"
            className="fill-slate-400 text-[8px]"
          >
            {new Date(e.dateIso).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'numeric',
            })}
          </text>
        ))}
      </svg>

      {!compact && (
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-[#8b5cf6]" /> Депрессия
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-[#f59e0b]" /> Тревога
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-[#ef4444]" /> Стресс
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-[#10b981]" />{' '}
            Настроение
          </span>
        </div>
      )}
    </div>
  )
}
