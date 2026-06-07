import { useToast } from '@/context/ToastContext'

export function Toast() {
  const { message } = useToast()
  if (!message) return null

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-[100] max-w-sm -translate-x-1/2 rounded-xl bg-sidebar px-5 py-3 text-sm text-white shadow-xl lg:bottom-8"
    >
      {message}
    </div>
  )
}
