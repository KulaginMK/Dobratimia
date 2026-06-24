import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ReminderSettings } from '@/lib/reminders'

type Props = {
  settings: ReminderSettings
  onChange: (settings: ReminderSettings) => void
  onDownloadIcs: () => void
}

export function ReminderSettingsPanel({ settings, onChange, onDownloadIcs }: Props) {
  return (
    <Card className="mt-6">
      <h3 className="font-semibold">Напоминания</h3>
      <p className="mt-1 text-sm text-muted">
        Напоминания появятся, когда вы снова откроете приложение.
      </p>

      <label className="mt-4 flex items-center gap-3">
        <input
          type="checkbox"
          checked={settings.moodEnabled}
          onChange={(e) => onChange({ ...settings, moodEnabled: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm">Напоминать отметить настроение, если сегодня ещё не отмечали</span>
      </label>

      <label className="mt-3 flex items-center gap-3">
        <input
          type="checkbox"
          checked={settings.dassEnabled}
          onChange={(e) => onChange({ ...settings, dassEnabled: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm">Напоминать пройти DASS-21</span>
      </label>

      {settings.dassEnabled && (
        <label className="mt-3 block text-sm">
          Интервал DASS (дней)
          <select
            value={settings.dassIntervalDays}
            onChange={(e) =>
              onChange({ ...settings, dassIntervalDays: Number(e.target.value) })
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          >
            {[7, 14, 21, 30].map((d) => (
              <option key={d} value={d}>
                {d} дней
              </option>
            ))}
          </select>
        </label>
      )}

      <Button variant="secondary" className="mt-4 w-full" onClick={onDownloadIcs}>
        Добавить в календарь
      </Button>
    </Card>
  )
}
