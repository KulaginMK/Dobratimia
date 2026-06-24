import type { MoodEntry } from './types'

export type { MoodEntry } from './types'

const STORAGE_KEY = 'dobratimia_mood_diary'
const MAX_ENTRIES = 90

export function getTodayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function loadMoodDiary(): MoodEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MoodEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveMoodEntry(score: number, note?: string): MoodEntry {
  const dateKey = getTodayKey()
  const trimmedNote = note?.trim() || undefined
  const existing = loadMoodDiary()
  const idx = existing.findIndex((e) => e.dateKey === dateKey)

  const entry: MoodEntry = {
    id: idx >= 0 ? existing[idx].id : crypto.randomUUID(),
    dateKey,
    dateIso: new Date().toISOString(),
    score: Math.min(5, Math.max(1, Math.round(score))),
    note: trimmedNote,
  }

  const next =
    idx >= 0
      ? existing.map((e, i) => (i === idx ? entry : e))
      : [entry, ...existing].slice(0, MAX_ENTRIES)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return entry
}

export function hasEntryForToday(): boolean {
  const today = getTodayKey()
  return loadMoodDiary().some((e) => e.dateKey === today)
}

export function getTodayEntry(): MoodEntry | null {
  const today = getTodayKey()
  return loadMoodDiary().find((e) => e.dateKey === today) ?? null
}

export function clearMoodDiary(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function formatMoodDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

export function getWeeklyAverage(): number | null {
  const entries = loadMoodDiary()
  if (entries.length === 0) return null

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recent = entries.filter((e) => new Date(e.dateIso).getTime() >= weekAgo)
  if (recent.length === 0) return null

  const sum = recent.reduce((acc, e) => acc + e.score, 0)
  return Math.round((sum / recent.length) * 10) / 10
}

export const MOOD_LABELS: Record<number, string> = {
  1: 'Очень плохо',
  2: 'Плохо',
  3: 'Нормально',
  4: 'Хорошо',
  5: 'Отлично',
}

export const MOOD_EMOJIS: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
}
