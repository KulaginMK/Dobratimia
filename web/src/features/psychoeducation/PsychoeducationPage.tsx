import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { OrganAdjustPanel } from './OrganAdjustPanel'
import { OrganChipList } from './OrganChipList'
import { OrganInfoPanel } from './OrganInfoPanel'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAnatomyData } from './useAnatomyData'
import { isWebGLAvailable } from './webgl'
import type { OrganOverride } from './Anatomy3D/organLayout'
import { Anatomy3DErrorBoundary } from './Anatomy3D/Anatomy3DErrorBoundary'
import { Button } from '@/components/ui/Button'

const Anatomy3D = lazy(() => import('./Anatomy3D/Anatomy3D'))

export function PsychoeducationPage() {
  const { organs, manifest, loading, error } = useAnatomyData()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adjust3d, setAdjust3d] = useState(false)
  const [organOverrides, setOrganOverrides] = useState<Record<string, OrganOverride>>({})
  const webglAvailable = useMemo(() => isWebGLAvailable(), [])

  const handleOrganOverride = useCallback((id: string, patch: OrganOverride) => {
    setOrganOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }))
  }, [])

  const handleResetOrganOverride = useCallback((id: string) => {
    setOrganOverrides((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  useEffect(() => {
    if (organs.length && !selectedId) {
      setSelectedId(organs[0].id)
    }
  }, [organs, selectedId])

  const selectedOrgan = organs.find((o) => o.id === selectedId) ?? null
  const organIds = useMemo(() => organs.map((o) => o.id), [organs])

  if (loading) {
    return (
      <div>
        <PageHeader title="🧬 Анатомия стресса" subtitle="Загрузка…" />
        <p className="text-muted">Подготавливаем 3D-модель.</p>
      </div>
    )
  }

  if (error || !manifest) {
    return (
      <div>
        <PageHeader title="🧬 Анатомия стресса" />
        <p className="text-red-600">Не удалось загрузить материалы. Попробуйте обновить страницу.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="🧬 Анатомия стресса"
        subtitle="Интерактивная 3D-схема для обучения — не медицинская визуализация. Нажмите на орган или выберите в списке."
      />

      {!webglAvailable && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          3D недоступен в этом браузере. Откройте страницу в Chrome или Edge на компьютере.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {webglAvailable ? (
            <Anatomy3DErrorBoundary
              key="anatomy-3d"
              fallback={
                <div className="flex h-[420px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                  <p className="text-red-800">Не удалось загрузить 3D-сцену.</p>
                  <Button variant="secondary" onClick={() => window.location.reload()}>
                    Обновить страницу
                  </Button>
                </div>
              }
            >
              <Suspense
                fallback={
                  <div className="flex h-[420px] items-center justify-center rounded-2xl bg-slate-200 text-muted">
                    Загрузка 3D…
                  </div>
                }
              >
                <Anatomy3D
                  manifest={manifest}
                  organIds={organIds}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  overrides={organOverrides}
                />
              </Suspense>
            </Anatomy3DErrorBoundary>
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-6 text-center text-muted">
              3D-схема недоступна
            </div>
          )}

          {import.meta.env.DEV && webglAvailable && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setAdjust3d((v) => !v)}
                className="text-sm text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-900"
              >
                {adjust3d ? 'Скрыть подстройку 3D' : 'Подстроить положение органов (3D)…'}
              </button>
              {adjust3d && (
                <OrganAdjustPanel
                  organs={organs}
                  manifestOrgans={manifest.organs}
                  selectedId={selectedId}
                  overrides={organOverrides}
                  onOverride={handleOrganOverride}
                  onReset={handleResetOrganOverride}
                />
              )}
            </div>
          )}

          <OrganChipList organs={organs} selectedId={selectedId} onSelect={setSelectedId} />

          {webglAvailable && (
            <p className="mt-3 text-center text-xs text-muted">
              Вращайте модель мышью или пальцем.
            </p>
          )}
        </div>

        <OrganInfoPanel organ={selectedOrgan} />
      </div>
    </div>
  )
}
