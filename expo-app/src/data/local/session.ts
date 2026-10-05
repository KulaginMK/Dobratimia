import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionUser } from '@/data/repos/AuthRepo';

/**
 * До появления входа личные данные лежали под ключом гостя. Вход-имитация этапа 11 оставляет тот же ключ,
 * чтобы уже накопленные на телефоне данные не пропали. С настоящим входом (этап 12) ключом станет
 * id пользователя: другой аккаунт на том же телефоне этих данных не увидит (docs/08).
 */
export const GUEST_USER_ID = 'guest';

/** Ключ личных данных: user:<id>:mood, user:<id>:dass. */
export function userKey(userId: string, name: string): string {
  return `user:${userId}:${name}`;
}

// Общие ключи, без id пользователя (docs/08).
const ONBOARDED_KEY = 'app:onboarded';
const SESSION_KEY = 'app:session';
// Настройка темы — не личные данные: «Удалить мои данные» её не трогает, иначе экран мигнёт другой темой.
const KEPT_ON_DELETE = ['app:theme'];

function isUser(value: unknown): value is SessionUser {
  const user = value as Partial<SessionUser> | null;
  return (
    !!user &&
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    (user.role === 'student' || user.role === 'specialist')
  );
}

/** Онбординг показывается один раз: флаг ставится при первом входе. */
export async function loadOnboarded(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDED_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function saveOnboarded(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDED_KEY, '1');
}

/** Кто вошёл на этом устройстве. null — никто. */
export async function loadSessionUser(): Promise<SessionUser | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveSessionUser(user: SessionUser | null): Promise<void> {
  if (user) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else await AsyncStorage.removeItem(SESSION_KEY);
}

/**
 * «Удалить мои данные»: стирает с устройства всё, что приложение сохранило об этом пользователе —
 * дневник, тесты, КРИК, отметки и фразы, выбранный вуз, вход и флаг онбординга. Остаётся только тема.
 * Данные других аккаунтов на этом телефоне не трогаем. Чужие ключи тоже: в вебе хранилище общее на весь сайт.
 */
export async function clearUserData(userId: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const own = keys.filter(
    (key) =>
      key.startsWith(`user:${userId}:`) ||
      // Отметки «Нравится» заглушки (src/data/mocks/specialists.ts); на этапе 12 они уйдут на сервер.
      key === `mock:likes:${userId}` ||
      (key.startsWith('app:') && !KEPT_ON_DELETE.includes(key)),
  );
  await AsyncStorage.multiRemove(own);
}
