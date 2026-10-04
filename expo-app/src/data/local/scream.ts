import AsyncStorage from '@react-native-async-storage/async-storage';
import { userKey } from './session';

/**
 * Итог одного замера КРИКа. Хранится только на устройстве и только ради «рекорда недели» (docs/07, docs/08).
 * Самого звука здесь нет и быть не может: голос не записывается.
 */
export type ScreamRecord = {
  /** День замера: «2026-09-24». */
  date: string;
  /** Пик, усл. дБ. */
  peak: number;
  /** Среднее, усл. дБ. */
  avg: number;
  durationSec: number;
};

// «2» — шкала громкости изменилась 2026-10-04: записи в прежних числах с новыми сравнивать нельзя.
const KEY = 'scream2';

function isRecord(value: unknown): value is ScreamRecord {
  const record = value as Partial<ScreamRecord> | null;
  return (
    !!record &&
    typeof record.date === 'string' &&
    typeof record.peak === 'number' &&
    typeof record.avg === 'number' &&
    typeof record.durationSec === 'number'
  );
}

export async function loadScreamRecords(userId: string): Promise<ScreamRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(userKey(userId, KEY));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch {
    return [];
  }
}

export async function saveScreamRecords(userId: string, records: ScreamRecord[]): Promise<void> {
  await AsyncStorage.setItem(userKey(userId, KEY), JSON.stringify(records));
}
