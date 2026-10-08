import AsyncStorage from '@react-native-async-storage/async-storage';

// Общий ключ, без id пользователя: уведомления — настройка телефона, как «Уведомить о перерыве» в Pomodoro.
const KEY = 'app:reminders';

/** Переключатели «Напоминания» в профиле. */
export type Reminders = {
  /** Дневник настроения — каждый день в 21:00. */
  diary: boolean;
  /** Тест DASS-21 — раз в 14 дней. */
  dass: boolean;
  /** День, когда включили напоминание о дневнике: «2026-09-24». От него считаются пропуски, пока отметок нет. */
  diarySince: string | null;
};

// По умолчанию выключены: разрешение на уведомления спрашиваем, когда человек сам включит переключатель.
export const DEFAULT_REMINDERS: Reminders = { diary: false, dass: false, diarySince: null };

export async function loadReminders(): Promise<Reminders> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = (raw ? JSON.parse(raw) : null) as Partial<Reminders> | null;
    const diarySince = typeof parsed?.diarySince === 'string' ? parsed.diarySince : null;
    // Без дня включения напоминание считается выключенным: так было, пока переключатель только запоминал выбор.
    return { diary: parsed?.diary === true && diarySince !== null, dass: parsed?.dass === true, diarySince };
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export async function saveReminders(reminders: Reminders): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(reminders));
}
