import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/context/ToastContext'
import { GOODWORD_PHRASES, type GoodwordPhrase } from '@/data/goodword'

export function GoodwordPage() {
  const { showToast } = useToast()
  const [mode, setMode] = useState<'sweet' | 'spicy'>('sweet')
  const [item, setItem] = useState<GoodwordPhrase | null>(null)
  const [lastIdx, setLastIdx] = useState(-1)

  const draw = () => {
    const list = GOODWORD_PHRASES[mode]
    let idx = Math.floor(Math.random() * list.length)
    if (list.length > 1) {
      while (idx === lastIdx) idx = Math.floor(Math.random() * list.length)
    }
    setLastIdx(idx)
    setItem(list[idx])
  }

  const share = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(
      () => showToast('📤 Ссылка скопирована'),
      () => showToast(url),
    )
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <PageHeader title="💌 Доброе слово" subtitle="Рандомайзер тёплых сообщений" />

      <div className="mb-6 flex justify-center gap-2">
        {(['sweet', 'spicy'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setItem(null) }}
            className={`rounded-full px-5 py-2 font-medium ${
              mode === m ? 'bg-primary text-white' : 'bg-slate-200'
            }`}
          >
            {m === 'sweet' ? '🍬 Сахарный' : '🌶️ С перчиком'}
          </button>
        ))}
      </div>

      <Button className="w-full max-w-xs" onClick={draw}>
        🫶 Хочу поддержку
      </Button>

      {item && (
        <Card className="mt-8 animate-fade-in">
          <span className="text-5xl">{item.emoji}</span>
          <p className="mt-4 text-lg leading-relaxed">{item.text}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={draw}>🔀 Ещё одно</Button>
            <Button variant="secondary" onClick={share}>
              📤 Поделиться
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
