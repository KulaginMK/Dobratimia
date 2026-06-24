import { getLatestEntry } from '@/lib/storage/dass-history'
import { hasEntryForToday } from '@/lib/storage/mood-diary'

export type ReminderSettings = {
  dassEnabled: boolean
  dassIntervalDays: number
  moodEnabled: boolean
  dismissedUntil?: string
}

export type ActiveReminder = {
  id: 'dass' | 'mood'
  title: string
  description: string
  href: string
  cta: string
}

const STORAGE_KEY = 'dobratimia_reminders'

const DEFAULT_SETTINGS: ReminderSettings = {
  dassEnabled: true,
  dassIntervalDays: 14,
  moodEnabled: true,
}

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as ReminderSettings
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

function getTodayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function isDismissed(settings: ReminderSettings): boolean {
  if (!settings.dismissedUntil) return false
  return settings.dismissedUntil >= getTodayKey()
}

export function dismissRemindersForToday(): void {
  const settings = loadReminderSettings()
  saveReminderSettings({ ...settings, dismissedUntil: getTodayKey() })
}

export function getActiveReminders(): ActiveReminder[] {
  const settings = loadReminderSettings()
  if (isDismissed(settings)) return []

  const items: ActiveReminder[] = []

  if (settings.dassEnabled) {
    const latest = getLatestEntry()
    const intervalMs = settings.dassIntervalDays * 24 * 60 * 60 * 1000
    const due =
      !latest || Date.now() - new Date(latest.dateIso).getTime() >= intervalMs

    if (due) {
      items.push({
        id: 'dass',
        title: 'Пора пройти DASS-21',
        description: `Рекомендуем проходить опросник раз в ${settings.dassIntervalDays} дней`,
        href: '/dass',
        cta: 'Пройти опрос',
      })
    }
  }

  if (settings.moodEnabled) {
    if (!hasEntryForToday()) {
      items.push({
        id: 'mood',
        title: 'Отметьте настроение',
        description: 'Короткая отметка помогает замечать динамику между опросами',
        href: '/mood',
        cta: 'Открыть дневник',
      })
    }
  }

  return items
}

function formatIcsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function downloadReminderIcs(settings: ReminderSettings): void {
  const now = new Date()
  const start = new Date(now)
  start.setHours(20, 0, 0, 0)
  if (start <= now) start.setDate(start.getDate() + 1)

  const end = new Date(start.getTime() + 15 * 60 * 1000)
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dobratimia//RU', 'CALSCALE:GREGORIAN']

  if (settings.moodEnabled) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:mood-${start.getTime()}@dobratimia`,
      `DTSTAMP:${formatIcsDate(now)}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      'SUMMARY:Добратимия — отметить настроение',
      'DESCRIPTION:Откройте приложение и отметьте настроение за день',
      'END:VEVENT',
    )
  }

  if (settings.dassEnabled) {
    const dassStart = new Date(start)
    dassStart.setDate(dassStart.getDate() + settings.dassIntervalDays)
    const dassEnd = new Date(dassStart.getTime() + 30 * 60 * 1000)
    lines.push(
      'BEGIN:VEVENT',
      `UID:dass-${dassStart.getTime()}@dobratimia`,
      `DTSTAMP:${formatIcsDate(now)}`,
      `DTSTART:${formatIcsDate(dassStart)}`,
      `DTEND:${formatIcsDate(dassEnd)}`,
      'SUMMARY:Добратимия — пройти DASS-21',
      'DESCRIPTION:Скрининг депрессии, тревоги и стресса',
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dobratimia-reminders.ics'
  a.click()
  URL.revokeObjectURL(url)
}
