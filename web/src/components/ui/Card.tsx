import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl bg-card p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
      {children}
    </div>
  )
}
