import AsyncStorage from '@react-native-async-storage/async-storage';
import { userKey } from './session';

// Отклонённые специалисты и сохранённые фразы хранятся только на устройстве: серверу они не нужны (docs/08).

async function loadIds(key: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/** Специалисты, отмеченные «Не подходит»: в колоду они не возвращаются, пока её не откроют заново. */
export function loadRejected(userId: string): Promise<string[]> {
  return loadIds(userKey(userId, 'rejected'));
}

export async function saveRejected(userId: string, ids: string[]): Promise<void> {
  await AsyncStorage.setItem(userKey(userId, 'rejected'), JSON.stringify(ids));
}

/** Фразы «Доброго слова», сохранённые сердечком. */
export function loadSavedPhrases(userId: string): Promise<string[]> {
  return loadIds(userKey(userId, 'phrases'));
}

export async function saveSavedPhrases(userId: string, ids: string[]): Promise<void> {
  await AsyncStorage.setItem(userKey(userId, 'phrases'), JSON.stringify(ids));
}
