import AsyncStorage from '@react-native-async-storage/async-storage';
import { userKey } from './session';

// Отклонённые специалисты хранятся только на устройстве: серверу они не нужны (docs/08).

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

/** Избранные специалисты и их контакты, какими их в последний раз отдал сервер. */
export type FavoritesCache<Card, Contacts> = { cards: Card[]; contacts: Record<string, Contacts | null> };

/**
 * Копия избранных на устройстве: позвонить специалисту можно и без интернета.
 * Сюда попадают только те контакты, которые сервер уже открыл этому пользователю после «Нравится».
 */
export async function loadFavoritesCache<Card, Contacts>(userId: string): Promise<FavoritesCache<Card, Contacts>> {
  try {
    const raw = await AsyncStorage.getItem(userKey(userId, 'favorites'));
    const parsed = (raw ? JSON.parse(raw) : null) as Partial<FavoritesCache<Card, Contacts>> | null;
    return {
      cards: Array.isArray(parsed?.cards) ? parsed.cards : [],
      contacts: parsed?.contacts && typeof parsed.contacts === 'object' ? parsed.contacts : {},
    };
  } catch {
    return { cards: [], contacts: {} };
  }
}

export async function saveFavoritesCache<Card, Contacts>(
  userId: string,
  cache: FavoritesCache<Card, Contacts>,
): Promise<void> {
  await AsyncStorage.setItem(userKey(userId, 'favorites'), JSON.stringify(cache));
}
