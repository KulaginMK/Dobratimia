import AsyncStorage from '@react-native-async-storage/async-storage';
import { userKey } from './session';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

/** Отметка настроения за день. Хранится только на устройстве (docs/08): это данные о здоровье. */
export type MoodEntry = {
  /** День отметки: «2026-09-24». В день — одна отметка. */
  date: string;
  /** 1 Тяжело · 2 Грустно · 3 Ровно · 4 Хорошо · 5 Отлично. */
  level: MoodLevel;
  /** Время отметки: «14:20». */
  time: string;
  /** «Что повлияло?» — до 200 знаков. */
  note?: string;
};

export const MOOD_NOTE_MAX = 200;

function isEntry(value: unknown): value is MoodEntry {
  const entry = value as Partial<MoodEntry> | null;
  return (
    !!entry &&
    typeof entry.date === 'string' &&
    typeof entry.time === 'string' &&
    typeof entry.level === 'number' &&
    entry.level >= 1 &&
    entry.level <= 5
  );
}

/** Все отметки пользователя, от старых к новым. */
export async function loadMoodEntries(userId: string): Promise<MoodEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(userKey(userId, 'mood'));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry).sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

export async function saveMoodEntries(userId: string, entries: MoodEntry[]): Promise<void> {
  await AsyncStorage.setItem(userKey(userId, 'mood'), JSON.stringify(entries));
}
