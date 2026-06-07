import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

type Phase = 'inhale' | 'hold' | 'exhale'

const MODES = [
  { label: '4-6', inhale: 4, hold: 0, exhale: 6 },
  { label: '4-7-8', inhale: 4, hold: 7, exhale: 8 },
  { label: '5-5-5', inhale: 5, hold: 5, exhale: 5 },
] as const

const AMBIENT = [
  { id: 'rain', label: 'Дождь', emoji: '🌧️', src: '/assets/sounds/ambient/rain.mp3' },
  { id: 'wind', label: 'Ветер', emoji: '💨', src: '/assets/sounds/ambient/wind.mp3' },
  { id: 'forest', label: 'Лес', emoji: '🌲', src: '/assets/sounds/ambient/forest.mp3' },
]

export function MeditationPage() {
  const [mode, setMode] = useState(0)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>('inhale')
  const [count, setCount] = useState(4)
  const [cycles, setCycles] = useState(0)
  const [ambient, setAmbient] = useState<HTMLAudioElement | null>(null)
  const timerRef = useRef<number | null>(null)

  const cfg = MODES[mode]

  useEffect(() => {
    if (!running) return

    const tick = () => {
      setCount((c) => {
        if (c > 1) return c - 1
        setPhase((p) => {
          if (p === 'inhale') return cfg.hold > 0 ? 'hold' : 'exhale'
          if (p === 'hold') return 'exhale'
          setCycles((n) => n + 1)
          return 'inhale'
        })
        return phase === 'inhale' ? (cfg.hold > 0 ? cfg.hold : cfg.exhale) : phase === 'hold' ? cfg.exhale : cfg.inhale
      })
    }

    timerRef.current = window.setInterval(tick, 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [running, phase, cfg])

  const toggleAmbient = (src: string, id: string) => {
    if (ambient) {
      ambient.pause()
      setAmbient(null)
      if (ambient.dataset.id === id) return
    }
    const a = new Audio(src)
    a.loop = true
    a.volume = 0.4
    a.dataset.id = id
    a.play().catch(() => undefined)
    setAmbient(a)
  }

  const phaseLabel = phase === 'inhale' ? 'Вдох' : phase === 'hold' ? 'Задержка' : 'Выдох'

  return (
    <div>
      <PageHeader
        title="🧘 Медитации"
        subtitle="Дыхательные практики и ambient-звуки"
      />

      <Card className="mb-6 text-center">
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {MODES.map((m, i) => (
            <button
              key={m.label}
              type="button"
              onClick={() => { setMode(i); setRunning(false) }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                mode === i ? 'bg-primary text-white' : 'bg-slate-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div
          className={`mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-full border-4 transition ${
            running ? 'border-primary bg-emerald-50 scale-105' : 'border-slate-200'
          }`}
        >
          <span className="text-lg font-semibold text-primary">{phaseLabel}</span>
          <span className="text-5xl font-bold">{count}</span>
          <span className="text-sm text-muted">Циклов: {cycles}</span>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => setRunning((r) => !r)}>{running ? '⏸ Пауза' : '▶️ Начать'}</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRunning(false)
              setPhase('inhale')
              setCount(cfg.inhale)
              setCycles(0)
            }}
          >
            🔄 Сброс
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 font-semibold">🎧 Ambient</h3>
        <p className="mb-4 text-sm text-muted">Добавьте MP3 в public/assets/sounds/ambient/</p>
        <div className="flex flex-wrap gap-2">
          {AMBIENT.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAmbient(a.src, a.id)}
              className="rounded-xl border px-4 py-3 text-center hover:border-primary"
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="mt-1 block text-sm">{a.label}</span>
            </button>
          ))}
          {ambient && (
            <Button variant="secondary" onClick={() => { ambient.pause(); setAmbient(null) }}>
              ⏹ Стоп
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
