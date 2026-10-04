import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '@/theme';

// Общий ключ, без id пользователя: тема остаётся после выхода из аккаунта (docs/08).
const KEY = 'app:theme';

function isPreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

/** Настройка «Тема» из профиля. Пока ничего не сохранено — «Как в системе». */
export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return isPreference(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(KEY, preference);
}
