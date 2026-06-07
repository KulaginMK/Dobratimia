export function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex gap-3 rounded-xl border-l-4 border-warning bg-amber-50 p-4 text-amber-900">
      <span className="text-xl" aria-hidden>
        ⚠️
      </span>
      <p className="text-sm font-medium leading-relaxed">{children}</p>
    </div>
  )
}
