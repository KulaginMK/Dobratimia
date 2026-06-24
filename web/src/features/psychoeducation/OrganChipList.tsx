import type { Organ } from './types'

export function OrganChipList({
  organs,
  selectedId,
  onSelect,
}: {
  organs: Organ[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {organs.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onSelect(o.id)}
          className={`rounded-full border px-3 py-1 text-sm transition ${
            selectedId === o.id
              ? 'border-primary bg-primary text-white'
              : 'border-slate-200 hover:border-primary/50'
          }`}
        >
          {o.emoji} {o.name}
        </button>
      ))}
    </div>
  )
}
