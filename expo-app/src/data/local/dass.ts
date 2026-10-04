import AsyncStorage from '@react-native-async-storage/async-storage';
import { DASS_COUNT } from '@/data/dass';
import { userKey } from './session';

/**
 * Пройденный тест DASS-21. Хранится только на устройстве (docs/08): это данные о здоровье.
 * Незаконченный тест сюда не попадает.
 */
export type DassEntry = {
  /** День теста: «2026-09-24». */
  date: string;
  /** 21 ответ по порядку пунктов, балл 0…3. */
  answers: number[];
  /** Баллы шкал, 0…42. */
  stress: number;
  anxiety: number;
  depression: number;
};

function isEntry(value: unknown): value is DassEntry {
  const entry = value as Partial<DassEntry> | null;
  return (
    !!entry &&
    typeof entry.date === 'string' &&
    Array.isArray(entry.answers) &&
    entry.answers.length === DASS_COUNT &&
    typeof entry.stress === 'number' &&
    typeof entry.anxiety === 'number' &&
    typeof entry.depression === 'number'
  );
}

/** Все пройденные тесты, от старых к новым. */
export async function loadDassEntries(userId: string): Promise<DassEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(userKey(userId, 'dass'));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

export async function saveDassEntries(userId: string, entries: DassEntry[]): Promise<void> {
  await AsyncStorage.setItem(userKey(userId, 'dass'), JSON.stringify(entries));
}
