import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { useToast } from '@/components/ui';
import { DEFAULT_REMINDERS, loadReminders, saveReminders, type Reminders } from '@/data/local/reminders';
import { useDassHistory } from '@/features/dass/DassHistory';
import type { PomodoroState } from '@/features/meditation/pomodoro';
import { useMoodDiary } from '@/features/mood/MoodDiary';
import {
  allowNotifications,
  cancelNotifications,
  notificationsAllowed,
  scheduleNotification,
  type LocalNotification,
} from '@/lib/notifications';
import { DASS_ID, DIARY_IDS, POMODORO_IDS, dassReminder, diaryAnchor, diaryPlan, pomodoroBreaks } from './schedule';

// Пересчёты идут строго по очереди: быстрые переключения не оставят лишних уведомлений.
let queue: Promise<void> = Promise.resolve();

/** Отменить прежние уведомления с этими id и поставить новые. */
function replace(ids: string[], plan: () => Promise<LocalNotification[]>): Promise<void> {
  const job = async () => {
    try {
      await cancelNotifications(ids);
      const planned = await plan();
      for (const notification of planned) await scheduleNotification(notification);
      // При разработке расписание видно в терминале сервера: иначе пришлось бы ждать самого уведомления.
      if (__DEV__) console.log('Уведомления:', ids[0], planned.map((n) => `${n.at.toLocaleString('ru')} — ${n.title}`));
    } catch (error) {
      // Не поставилось — приложение работает дальше, просто без этого напоминания.
      if (__DEV__) console.warn('Уведомления: не удалось поставить', error);
    }
  };
  queue = queue.then(job);
  return queue;
}

/** Пересчитать напоминания о дневнике. lastMarked — день последней отметки настроения. */
export function syncDiaryReminders(lastMarked: string | null): Promise<void> {
  return replace(DIARY_IDS, async () => {
    const { diary, diarySince } = await loadReminders();
    return diary && diarySince ? diaryPlan(diaryAnchor(lastMarked, diarySince), new Date()) : [];
  });
}

/** Пересчитать напоминание о тесте DASS-21. lastTest — день последнего теста. */
export function syncDassReminder(lastTest: string | null): Promise<void> {
  return replace([DASS_ID], async () => {
    const reminder = lastTest && (await loadReminders()).dass ? dassReminder(lastTest, new Date()) : null;
    return reminder ? [reminder] : [];
  });
}

/** «Уведомить о перерыве». null — переключатель выключен. */
export function syncPomodoroBreaks(state: PomodoroState | null): Promise<void> {
  return replace(POMODORO_IDS, async () => (state ? pomodoroBreaks(state) : []));
}

/** Никто не вошёл: личные напоминания не приходят. Таймер Pomodoro работает и без входа — его не трогаем. */
export function cancelPersonalReminders(): Promise<void> {
  return replace([...DIARY_IDS, DASS_ID], async () => []);
}

/** Держит напоминания в согласии с дневником и тестами: пересчитывает при запуске, после отметки и после теста. */
export function ReminderSync() {
  const mood = useMoodDiary();
  const dass = useDassHistory();
  const lastMarked = mood.entries[mood.entries.length - 1]?.date ?? null;
  const lastTest = dass.entries[dass.entries.length - 1]?.date ?? null;
  useEffect(() => {
    if (mood.ready) syncDiaryReminders(lastMarked);
  }, [mood.ready, lastMarked]);
  useEffect(() => {
    if (dass.ready) syncDassReminder(lastTest);
  }, [dass.ready, lastTest]);
  return null;
}

/** Спросить разрешение на уведомления, когда человек включает переключатель. Отказ — подсказка, где его дать. */
export function useAllowNotifications() {
  const toast = useToast();
  return async () => {
    if (await allowNotifications()) return true;
    toast.show({
      message: 'Уведомления запрещены. Разрешите их в настройках телефона.',
      actionLabel: 'Настройки',
      onAction: () => Linking.openSettings(),
    });
    return false;
  };
}

/** Переключатели «Напоминания» из профиля. */
export function useReminders() {
  const [reminders, setReminders] = useState<Reminders>(DEFAULT_REMINDERS);
  useEffect(() => {
    let alive = true;
    Promise.all([loadReminders(), notificationsAllowed()]).then(([stored, allowed]) => {
      // Уведомления запретили в настройках телефона — переключатели показаны выключенными: напоминания не придут.
      if (alive && allowed) setReminders(stored);
    });
    return () => {
      alive = false;
    };
  }, []);
  /** Сохраняет выбор. Напоминания после этого пересчитывает тот, кто вызвал. */
  const change = async (next: Reminders) => {
    setReminders(next);
    // Не сохранилось — выбор виден до перезапуска, но напоминания не поставятся.
    await saveReminders(next).catch(() => {});
  };
  return [reminders, change] as const;
}
