import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-slate-200 text-text hover:bg-slate-300',
  danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg',
  ghost: 'bg-transparent text-muted hover:bg-slate-100',
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: Variant
}) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
