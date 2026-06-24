import { RESOURCES } from '@/data/resources'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { WarningBox } from '@/components/ui/WarningBox'

export function ResourcesPage() {
  return (
    <div>
      <PageHeader
        title="🆘 Помощь и ресурсы"
        subtitle="Телефоны, службы и материалы — когда нужна поддержка"
      />

      <WarningBox>
        При угрозе жизни или острой кризисной ситуации звоните 112 или на линию доверия.
      </WarningBox>

      <div className="space-y-6">
        {RESOURCES.map((block) => (
          <section key={block.title}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              {block.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {block.items.map((item) => (
                <Card key={item.title}>
                  <p className="font-semibold text-primary-dark">{item.title}</p>
                  <p className="mt-2 text-sm text-muted">{item.content}</p>
                  {item.phone && item.href && (
                    <a
                      href={item.href}
                      className="mt-3 inline-block text-lg font-bold text-primary hover:underline"
                    >
                      {item.phone}
                    </a>
                  )}
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 rounded-xl bg-slate-100 p-4 text-center text-sm text-muted">
        Данные хранятся локально на вашем устройстве. Платформа не заменяет профессиональную
        помощь.
      </p>
    </div>
  )
}
