import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionUser } from '@/data/repos/AuthRepo';

/**
 * До появления входа личные данные лежали под ключом гостя, и вход-заглушка оставляет тот же ключ.
 * С настоящим входом ключом становится id пользователя: другой аккаунт на том же телефоне этих данных
 * не увидит (docs/08). Данные гостя при первом настоящем входе переходят к вошедшему — adoptGuestData.
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
    (user.role === 'student' || user.role === 'specialist' || user.role === 'admin')
  );
}

/** Онбординг показывается один раз: флаг ставится при первом входе или по «Продолжить без входа». */
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

// Что из накопленного гостем переходит в аккаунт: дневник, тесты и рекорды КРИКа.
// Отметки специалистам и фразам не переносим: в заглушках у них другие id, чем на сервере.
const ADOPTED = ['mood', 'dass', 'scream2'];

/**
 * Первый настоящий вход на устройстве, где приложением пользовались с входом-заглушкой:
 * дневник и тесты гостя становятся данными вошедшего, остальное гостевое стирается.
 * Если у аккаунта на этом устройстве уже есть свои данные, они не перезаписываются.
 */
export async function adoptGuestData(userId: string): Promise<void> {
  if (userId === GUEST_USER_ID) return;
  const keys = await AsyncStorage.getAllKeys();
  const guestKeys = keys.filter(
    (key) => key.startsWith(`user:${GUEST_USER_ID}:`) || key.startsWith('mock:') && key.endsWith(`:${GUEST_USER_ID}`),
  );
  if (guestKeys.length === 0) return;
  for (const name of ADOPTED) {
    const from = userKey(GUEST_USER_ID, name);
    const to = userKey(userId, name);
    if (!keys.includes(from) || keys.includes(to)) continue;
    const value = await AsyncStorage.getItem(from);
    if (value !== null) await AsyncStorage.setItem(to, value);
  }
  await AsyncStorage.multiRemove(guestKeys);
}

/**
 * «Удалить мои данные»: стирает с устройства всё, что приложение сохранило об этом пользователе —
 * дневник, тесты, КРИК, отметки специалистам и фразам, выбранный вуз, вход и флаг онбординга. Остаётся только тема.
 * Данные других аккаунтов на этом телефоне не трогаем. Чужие ключи тоже: в вебе хранилище общее на весь сайт.
 */
export async function clearUserData(userId: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const own = keys.filter(
    (key) =>
      key.startsWith(`user:${userId}:`) ||
      // Отметки «Нравится» специалистам и сердечки фраз из заглушек (src/data/mocks); на этапе 12 они уйдут на сервер.
      key === `mock:likes:${userId}` ||
      key === `mock:phraseLikes:${userId}` ||
      (key.startsWith('app:') && !KEPT_ON_DELETE.includes(key)),
  );
  await AsyncStorage.multiRemove(own);
}
