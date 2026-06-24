import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { MeditationModeToggle } from './MeditationModeToggle'

type Phase = 'inhale' | 'hold' | 'exhale'
type PomodoroPhase = 'work' | 'break'

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

const POMODORO_WORK_SEC = 25 * 60
const POMODORO_BREAK_SEC = 5 * 60

export function MeditationPage() {
  const [searchParams] = useSearchParams()
  const pomodoroMode = searchParams.get('pomodoro') === '1'
  const initialMode = Math.min(Math.max(Number(searchParams.get('mode') ?? 0), 0), MODES.length - 1)

  const [mode, setMode] = useState(initialMode)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>('inhale')
  const [count, setCount] = useState<number>(MODES[initialMode].inhale)
  const [cycles, setCycles] = useState(0)
  const [ambientId, setAmbientId] = useState<string | null>(null)
  const ambientRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<number | null>(null)

  const stopAmbient = useCallback(() => {
    ambientRef.current?.pause()
    ambientRef.current = null
    setAmbientId(null)
  }, [])

  useEffect(() => () => stopAmbient(), [stopAmbient])

  useEffect(() => {
    if (pomodoroMode) stopAmbient()
    setRunning(false)
  }, [pomodoroMode, stopAmbient])

  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('work')
  const [pomodoroSec, setPomodoroSec] = useState(POMODORO_WORK_SEC)
  const [pomodoroRounds, setPomodoroRounds] = useState(0)

  const cfg = MODES[mode]

  useEffect(() => {
    const m = Math.min(Math.max(Number(searchParams.get('mode') ?? mode), 0), MODES.length - 1)
    if (searchParams.get('mode') !== null && !pomodoroMode) {
      setMode(m)
      setPhase('inhale')
      setCount(MODES[m].inhale)
      setRunning(false)
    }
  }, [searchParams, pomodoroMode, mode])

  useEffect(() => {
    if (pomodoroMode || !running) return

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
  }, [running, phase, cfg, pomodoroMode])

  useEffect(() => {
    if (!pomodoroMode || !running) return

    const tick = () => {
      setPomodoroSec((s) => {
        if (s > 1) return s - 1
        setPomodoroPhase((p) => {
          if (p === 'work') {
            setPomodoroRounds((r) => r + 1)
            return 'break'
          }
          return 'work'
        })
        return -1
      })
    }

    timerRef.current = window.setInterval(tick, 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [running, pomodoroMode])

  useEffect(() => {
    if (pomodoroSec === -1) {
      setPomodoroSec(pomodoroPhase === 'break' ? POMODORO_BREAK_SEC : POMODORO_WORK_SEC)
    }
  }, [pomodoroSec, pomodoroPhase])

  const toggleAmbient = (src: string, id: string) => {
    if (ambientRef.current?.dataset.id === id) {
      stopAmbient()
      return
    }
    stopAmbient()
    const a = new Audio(src)
    a.loop = true
    a.volume = 0.4
    a.dataset.id = id
    a.play().catch(() => undefined)
    ambientRef.current = a
    setAmbientId(id)
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (pomodoroMode) {
    return (
      <div>
        <PageHeader title="🧘 Медитации" subtitle="25 минут работы, 5 минут отдыха" />
        <MeditationModeToggle />
        <Card className="text-center">
          <p className="text-lg font-semibold text-primary">
            {pomodoroPhase === 'work' ? 'Работа' : 'Перерыв'}
          </p>
          <p className="mt-4 text-6xl font-bold tabular-nums">{formatTime(pomodoroSec)}</p>
          <p className="mt-2 text-sm text-muted">Завершено циклов: {pomodoroRounds}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={() => setRunning((r) => !r)}>{running ? '⏸ Пауза' : '▶️ Начать'}</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setRunning(false)
                setPomodoroPhase('work')
                setPomodoroSec(POMODORO_WORK_SEC)
                setPomodoroRounds(0)
              }}
            >
              🔄 Сброс
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const phaseLabel = phase === 'inhale' ? 'Вдох' : phase === 'hold' ? 'Задержка' : 'Выдох'

  return (
    <div>
      <PageHeader
        title="🧘 Медитации"
        subtitle="Дыхательные практики и звуки природы"
      />
      <MeditationModeToggle />

      <Card className="mb-6 text-center">
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {MODES.map((m, i) => (
            <button
              key={m.label}
              type="button"
              onClick={() => {
                setMode(i)
                setRunning(false)
                setPhase('inhale')
                setCount(MODES[i].inhale)
              }}
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
        <h3 className="mb-2 font-semibold">🎧 Фоновые звуки</h3>
        <p className="mb-4 text-sm text-muted">Выберите звук природы для расслабления во время практики.</p>
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
          {ambientId && (
            <Button variant="secondary" onClick={stopAmbient}>
              ⏹ Стоп
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
