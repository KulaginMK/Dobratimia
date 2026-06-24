import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import {
  dismissRemindersForToday,
  getActiveReminders,
  type ActiveReminder,
} from '@/lib/reminders'

export function ReminderBanner() {
  const [reminders] = useState<ActiveReminder[]>(() => getActiveReminders())
  const [visible, setVisible] = useState(reminders.length > 0)

  if (!visible || reminders.length === 0) return null

  const primary = reminders[0]

  const handleDismiss = () => {
    dismissRemindersForToday()
    setVisible(false)
  }

  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-primary">{primary.title}</p>
          <p className="mt-1 text-sm text-muted">{primary.description}</p>
          {reminders.length > 1 && (
            <p className="mt-2 text-xs text-muted">
              + ещё {reminders.length - 1} напоминание
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="Закрыть"
          className="text-muted hover:text-text"
          onClick={handleDismiss}
        >
          ✕
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={primary.href}>
          <Button>{primary.cta}</Button>
        </Link>
        {reminders[1] && (
          <Link to={reminders[1].href}>
            <Button variant="secondary">{reminders[1].cta}</Button>
          </Link>
        )}
        <Button variant="ghost" onClick={handleDismiss}>
          Напомнить завтра
        </Button>
      </div>
    </div>
  )
}
