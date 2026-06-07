import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'

export type Organ = {
  id: string
  name: string
  emoji: string
  during: string
  coping: string
}

const POSITIONS: Record<string, { cx: number; cy: number; r: number }> = {
  brain: { cx: 200, cy: 55, r: 38 },
  heart: { cx: 200, cy: 145, r: 28 },
  lungs: { cx: 200, cy: 130, r: 42 },
  stomach: { cx: 200, cy: 210, r: 32 },
  muscles: { cx: 200, cy: 280, r: 55 },
  adrenals: { cx: 175, cy: 195, r: 14 },
  immune: { cx: 225, cy: 195, r: 14 },
}

const BODY =
  'M 200 25 C 170 25 155 50 155 75 C 155 95 165 105 160 120 L 130 320 C 125 360 140 380 160 385 L 175 385 L 175 420 L 225 420 L 225 385 L 240 385 C 260 380 275 360 270 320 L 240 120 C 235 105 245 95 245 75 C 245 50 230 25 200 25 Z'

export function Anatomy2D() {
  const [organs, setOrgans] = useState<Organ[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/anatomy-stress.json')
      .then((r) => r.json())
      .then((d: { organs: Organ[] }) => {
        setOrgans(d.organs)
        setSelected(d.organs[0]?.id ?? null)
      })
      .catch(() => {
        const fallback: Organ[] = [
          {
            id: 'brain',
            name: 'Головной мозг',
            emoji: '🧠',
            during: 'Усиливается тревожная реакция.',
            coping: 'Дыхание, сон, паузы.',
          },
        ]
        setOrgans(fallback)
        setSelected('brain')
      })
  }, [])

  const organ = organs.find((o) => o.id === selected)

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <svg viewBox="0 0 400 440" className="mx-auto w-full max-w-sm" aria-label="Схема тела">
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
          </defs>
          <path d={BODY} fill="url(#bodyGrad)" stroke="#94a3b8" strokeWidth={2} />
          {organs.map((o) => {
            const p = POSITIONS[o.id]
            if (!p) return null
            return (
              <circle
                key={o.id}
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                className="cursor-pointer transition"
                fill={selected === o.id ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.25)'}
                stroke={selected === o.id ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                onClick={() => setSelected(o.id)}
                role="button"
                aria-label={o.name}
              />
            )
          })}
        </svg>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {organs.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelected(o.id)}
              className={`rounded-full border px-3 py-1 text-sm ${
                selected === o.id ? 'border-primary bg-primary text-white' : 'border-slate-200'
              }`}
            >
              {o.emoji} {o.name}
            </button>
          ))}
        </div>
      </div>

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
          </>
        ) : (
          <p className="text-muted">Загрузка…</p>
        )}
      </Card>
    </div>
  )
}
