import type { Organ, OrganModelConfig } from './types'
import type { OrganOverride } from './Anatomy3D/organLayout'
import { formatOrganJson, resolveOrganLayout } from './Anatomy3D/organLayout'

type Props = {
  organs: Organ[]
  manifestOrgans: Record<string, OrganModelConfig>
  selectedId: string | null
  overrides: Record<string, OrganOverride>
  onOverride: (id: string, patch: OrganOverride) => void
  onReset: (id: string) => void
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 flex justify-between text-muted">
        <span>{label}</span>
        <span className="font-mono text-slate-700">{value.toFixed(3)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-600"
      />
    </label>
  )
}

export function OrganAdjustPanel({
  organs,
  manifestOrgans,
  selectedId,
  overrides,
  onOverride,
  onReset,
}: Props) {
  const organ = organs.find((o) => o.id === selectedId)
  const cfg = selectedId ? manifestOrgans[selectedId] : null

  if (!organ || !cfg || !selectedId) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-muted">
        Выберите орган выше, затем двигайте ползунки.
      </div>
    )
  }

  const layout = resolveOrganLayout(cfg, overrides[selectedId])
  const organId = selectedId

  function patch(p: OrganOverride) {
    onOverride(organId, p)
  }

  async function copyJson() {
    const text = formatOrganJson(organId, layout.anchor, layout.scaleRatio)
    await navigator.clipboard.writeText(text)
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-teal-900">
          {organ.emoji} {organ.name}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onReset(organId)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
          >
            Сброс
          </button>
          <button
            type="button"
            onClick={() => void copyJson()}
            className="rounded-lg bg-teal-600 px-2 py-1 text-xs text-white hover:bg-teal-700"
          >
            Скопировать JSON
          </button>
        </div>
      </div>

      <p className="text-xs text-muted">
        X — влево/вправо, Y — вверх/вниз, Z — назад/вперёд. Размер — доля роста тела.
      </p>

      <SliderRow
        label="X (0 — левый край, 0.5 — центр, 1 — правый)"
        value={layout.anchor[0]}
        min={-0.3}
        max={1.3}
        step={0.01}
        onChange={(x) => patch({ anchor: [x, layout.anchor[1], layout.anchor[2]] })}
      />
      <SliderRow
        label="Y (0 — стопы, 1 — голова)"
        value={layout.anchor[1]}
        min={0}
        max={1}
        step={0.01}
        onChange={(y) => patch({ anchor: [layout.anchor[0], y, layout.anchor[2]] })}
      />
      <SliderRow
        label="Z (0 — спина, 1 — грудь)"
        value={layout.anchor[2]}
        min={0}
        max={1}
        step={0.01}
        onChange={(z) => patch({ anchor: [layout.anchor[0], layout.anchor[1], z] })}
      />
      <SliderRow
        label="Размер (scaleRatio)"
        value={layout.scaleRatio}
        min={0.02}
        max={0.25}
        step={0.005}
        onChange={(scaleRatio) => patch({ scaleRatio })}
      />
    </div>
  )
}
