import type { DassResult } from '@/lib/dass-scoring'
import type { DassHistoryEntry } from './types'

export type { DassHistoryEntry } from './types'

const STORAGE_KEY = 'dobratimia_dass_history'
const MAX_ENTRIES = 20

export function loadHistory(): DassHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DassHistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveEntry(result: DassResult): DassHistoryEntry {
  const entry: DassHistoryEntry = {
    id: crypto.randomUUID(),
    dateIso: new Date().toISOString(),
    depression: result.depression,
    anxiety: result.anxiety,
    stress: result.stress,
    levels: result.levels,
  }
  const history = [entry, ...loadHistory()].slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  return entry
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getLatestEntry(): DassHistoryEntry | null {
  return loadHistory()[0] ?? null
}

export function formatEntryDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
