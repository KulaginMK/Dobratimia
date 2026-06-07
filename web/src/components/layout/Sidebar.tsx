import { RESOURCES } from '@/data/resources'

export function Sidebar() {
  return (
    <aside className="hidden w-80 shrink-0 overflow-y-auto bg-sidebar p-6 text-white lg:block">
      <div className="mb-6 border-b border-white/10 pb-6">
        <p className="text-xl font-bold">Добратимия</p>
        <p className="mt-1 text-sm text-white/70">Территория гармонии</p>
      </div>

      {RESOURCES.map((block) => (
        <section key={block.title} className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
            {block.title}
          </h2>
          {block.items.map((item) => (
            <div
              key={item.title}
              className="mb-2 rounded-lg border-l-2 border-transparent bg-white/5 p-3 text-sm transition hover:border-primary hover:bg-white/10"
            >
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1 text-white/70">{item.content}</p>
              {item.phone && (
                <a
                  href={item.href}
                  className="mt-2 block font-bold text-primary"
                >
                  {item.phone}
                </a>
              )}
            </div>
          ))}
        </section>
      ))}

      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
        ⚠️ Платформа не заменяет профессиональную помощь. При кризисе звоните на линию доверия.
      </p>
    </aside>
  )
}
