import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/context/ToastContext'
import { downloadReminderIcs, loadReminderSettings, saveReminderSettings } from '@/lib/reminders'
import { ReminderSettingsPanel } from '@/components/ReminderSettingsPanel'
import {
  MOOD_EMOJIS,
  MOOD_LABELS,
  clearMoodDiary,
  formatMoodDate,
  getTodayEntry,
  loadMoodDiary,
  saveMoodEntry,
} from '@/lib/storage/mood-diary'

export function MoodPage() {
  const { showToast } = useToast()
  const todayEntry = getTodayEntry()
  const [score, setScore] = useState(todayEntry?.score ?? 3)
  const [note, setNote] = useState(todayEntry?.note ?? '')
  const [entries, setEntries] = useState(() => loadMoodDiary())
  const [reminders, setReminders] = useState(() => loadReminderSettings())

  const handleSave = () => {
    saveMoodEntry(score, note)
    setEntries(loadMoodDiary())
    showToast('Настроение сохранено')
  }

  const handleClear = () => {
    clearMoodDiary()
    setEntries([])
    showToast('Дневник очищен')
  }

  const handleReminderChange = (next: typeof reminders) => {
    saveReminderSettings(next)
    setReminders(next)
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="📓 Дневник настроения"
        subtitle="Отметка за день — только на этом устройстве"
      />

      <Card>
        <h3 className="font-semibold">Как вы сегодня?</h3>
        <div className="mt-4 flex justify-between gap-2">
          {([1, 2, 3, 4, 5] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScore(s)}
              className={`flex flex-1 flex-col items-center rounded-xl border-2 p-3 transition ${
                score === s
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span className="text-2xl">{MOOD_EMOJIS[s]}</span>
              <span className="mt-1 text-[0.65rem] text-muted">{s}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-sm font-medium text-primary">
          {MOOD_EMOJIS[score]} {MOOD_LABELS[score]}
        </p>
        <label className="mt-4 block text-sm font-medium">
          Заметка (необязательно)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Что повлияло на настроение?"
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <Button className="mt-4 w-full" onClick={handleSave}>
          {todayEntry ? 'Обновить запись за сегодня' : 'Сохранить'}
        </Button>
      </Card>

      <ReminderSettingsPanel
        settings={reminders}
        onChange={handleReminderChange}
        onDownloadIcs={() => {
          downloadReminderIcs(reminders)
          showToast('Файл календаря скачан')
        }}
      />

      {entries.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Последние записи</h3>
            <Button variant="ghost" className="text-xs" onClick={handleClear}>
              Очистить
            </Button>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {entries.slice(0, 14).map((e) => (
              <li key={e.id} className="flex items-start gap-3 py-3">
                <span className="text-2xl">{MOOD_EMOJIS[e.score]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {formatMoodDate(e.dateKey)} — {MOOD_LABELS[e.score]}
                  </p>
                  {e.note && (
                    <p className="mt-1 text-sm text-muted">{e.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
