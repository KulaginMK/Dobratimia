import type { DassResult } from '@/lib/dass-scoring'

export type DassHistoryEntry = {
  id: string
  dateIso: string
  depression: number
  anxiety: number
  stress: number
  levels: DassResult['levels']
}

export type MoodEntry = {
  id: string
  dateKey: string
  dateIso: string
  score: number
  note?: string
}
