import { useCallback, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/context/ToastContext'
import { speechErrorMessage, useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { playScreamReleaseSound } from '@/hooks/useScreamReleaseSound'

type Particle = { id: number; x: number; y: number; tx: number; ty: number; color: string }

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981']

export function ScreamPage() {
  const { showToast } = useToast()
  const [phase, setPhase] = useState<'start' | 'input' | 'success'>('start')
  const [text, setText] = useState('')
  const [particles, setParticles] = useState<Particle[]>([])
  const baseRef = useRef('')
  const holdActiveRef = useRef(false)

  const appendTranscript = useCallback((chunk: string, isFinal: boolean) => {
    if (isFinal) {
      baseRef.current = `${baseRef.current} ${chunk}`.trim()
      setText(baseRef.current)
    } else {
      setText(`${baseRef.current} ${chunk}`.trim())
    }
  }, [])

  const { listening, supported, error, voiceUsed, start, stop, resetVoice } =
    useSpeechRecognition(appendTranscript)

  const openInput = () => {
    baseRef.current = ''
    setText('')
    resetVoice()
    setPhase('input')
  }

  const canRelease = Boolean(text.trim()) || voiceUsed

  const release = async () => {
    if (!canRelease) {
      showToast('✏️ Напишите или продиктуйте что-нибудь, затем нажмите «Отпустить»')
      return
    }
    stop()
    await playScreamReleaseSound()

    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    const next: Particle[] = Array.from({ length: 120 }, (_, id) => {
      const a = Math.random() * Math.PI * 2
      const d = 100 + Math.random() * 350
      return {
        id,
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 80,
        tx: Math.cos(a) * d,
        ty: Math.sin(a) * d,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }
    })
    setParticles(next)
    window.setTimeout(() => {
      setParticles([])
      setPhase('success')
      resetVoice()
    }, 1400)
  }

  const beginHold = async () => {
    if (holdActiveRef.current) return
    holdActiveRef.current = true
    await start()
  }

  const endHold = () => {
    if (!holdActiveRef.current) return
    holdActiveRef.current = false
    stop()
  }

  const statusMessage = listening
    ? '🔴 Слушаю… говорите, затем нажмите «Отпустить»'
    : speechErrorMessage(error) ??
      (supported
        ? '🎤 Нажмите «Голос» или удерживайте кнопку микрофона'
        : '🎤 Голос: Chrome или Edge на компьютере')

  return (
    <div className="relative pb-28 lg:pb-8">
      {particles.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {particles.map((p) => (
            <span
              key={p.id}
              className="absolute block h-2.5 w-2.5 animate-[explode_1.2s_ease-out_forwards] rounded-sm"
              style={
                {
                  left: p.x,
                  top: p.y,
                  background: p.color,
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      <PageHeader
        title="🔥 Крик"
        subtitle="Анонимное пространство для выражения эмоций. Напишите или скажите — и отпустите."
      />

      {phase === 'start' && (
        <div className="flex flex-col items-center py-12">
          <button
            type="button"
            onClick={openInput}
            className="flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-lg font-bold text-white shadow-xl shadow-red-500/40 transition hover:scale-105 active:scale-95"
          >
            <span className="text-4xl">📢</span>
            Выпустить пар
          </button>
        </div>
      )}

      {phase === 'input' && (
        <div className="mx-auto max-w-xl">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              baseRef.current = e.target.value
            }}
            rows={8}
            placeholder="Всё, что беспокоит, злит, расстраивает…"
            className="w-full resize-y rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-lg focus:border-danger focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              listening
                ? 'bg-red-50 text-red-600'
                : error
                  ? 'bg-amber-50 text-amber-900'
                  : 'text-muted'
            }`}
          >
            {statusMessage}
          </p>
          <div className="relative z-10 mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                stop()
                endHold()
                setPhase('start')
                setText('')
                resetVoice()
              }}
            >
              Отмена
            </Button>
            {!listening ? (
              <Button variant="secondary" onClick={() => void start()} disabled={!supported}>
                🎤 Голос
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => stop()}>
                ⏹ Стоп
              </Button>
            )}
            <button
              type="button"
              className={`inline-flex min-h-11 touch-manipulation select-none items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                listening ? 'bg-red-600' : 'bg-violet-600 hover:bg-violet-700'
              }`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                void beginHold()
              }}
              onPointerUp={endHold}
              onPointerCancel={endHold}
              onLostPointerCapture={endHold}
            >
              🎙 Удерживать
            </button>
            <Button variant="danger" onClick={() => void release()} className="min-w-[8.5rem]">
              💥 Отпустить
            </Button>
          </div>
        </div>
      )}

      {phase === 'success' && (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="text-6xl">✨</span>
          <p className="mt-4 text-2xl font-semibold text-primary">Отпущено. Стало легче?</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/dass">
              <Button variant="secondary">📋 Пройти DASS-21</Button>
            </Link>
            <Link to="/meditation?mode=0">
              <Button variant="secondary">🧘 Подышать 2 минуты</Button>
            </Link>
            <Link to="/techniques">
              <Button variant="secondary">💡 Техники</Button>
            </Link>
          </div>
          <Button className="mt-6" onClick={() => setPhase('start')}>
            🔄 Ещё раз
          </Button>
        </div>
      )}

      <p className="mt-12 rounded-xl bg-emerald-50 p-4 text-center text-sm text-primary-dark">
        🔒 Текст никуда не сохраняется — только на вашем устройстве до «Отпустить».
      </p>
    </div>
  )
}
