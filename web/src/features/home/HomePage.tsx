import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HOME_SLIDES } from '@/config/navigation'
import { Button } from '@/components/ui/Button'

export function HomePage() {
  const [index, setIndex] = useState(0)
  const slide = HOME_SLIDES[index]

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % HOME_SLIDES.length),
      6000,
    )
    return () => window.clearInterval(id)
  }, [])

  return (
    <div>
      <header className="mb-8 text-center">
        <h2 className="text-2xl font-bold">Добро пожаловать</h2>
        <p className="mt-2 text-muted">Выберите раздел в карусели или быстрых карточках</p>
      </header>

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
