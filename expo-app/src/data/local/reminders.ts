import AsyncStorage from '@react-native-async-storage/async-storage';

// Общий ключ, без id пользователя: уведомления — настройка телефона, как «Уведомить о перерыве» в Pomodoro.
const KEY = 'app:reminders';

/** Переключатели «Напоминания» в профиле. */
export type Reminders = {
  /** Дневник настроения — каждый день в 21:00. */
  diary: boolean;
  /** Тест DASS-21 — раз в 14 дней. */
  dass: boolean;
};

// По умолчанию выключены: разрешение на уведомления спрашиваем, когда человек сам включит переключатель (этап 14).
export const DEFAULT_REMINDERS: Reminders = { diary: false, dass: false };

export async function loadReminders(): Promise<Reminders> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = (raw ? JSON.parse(raw) : null) as Partial<Reminders> | null;
    return { diary: parsed?.diary === true, dass: parsed?.dass === true };
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export async function saveReminders(reminders: Reminders): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(reminders));
}
