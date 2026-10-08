import { useRouter, type Href } from 'expo-router';
// ponytail: части модуля подключены по отдельности, а не через `from 'expo-notifications'`: в SDK 57 общий вход
// роняет Expo Go на Android уже при импорте (expo/expo#49044, исправлено в SDK 58). После перехода на SDK 58 —
// заменить на обычный импорт.
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { clearLastNotificationResponse } from 'expo-notifications/build/NotificationsEmitter';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { cancelAllScheduledNotificationsAsync } from 'expo-notifications/build/cancelAllScheduledNotificationsAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { useLastNotificationResponse } from 'expo-notifications/build/useLastNotificationResponse';
import { useEffect } from 'react';

/** Каналы Android: человек может настроить звук напоминаний и таймера по отдельности. */
export type NotificationChannel = 'reminders' | 'pomodoro';

export type LocalNotification = {
  /** Постоянный id: новое уведомление с тем же id заменяет прежнее. */
  id: string;
  at: Date;
  title: string;
  body: string;
  /** Экран, который откроется по нажатию (docs/06, «Глубокие ссылки»). */
  url: string;
  channel: NotificationChannel;
};

// Уведомление показывается, даже когда приложение открыто: таймер Pomodoro может закончиться на другом экране.
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Разрешены ли уведомления сейчас. Ничего не спрашивает. */
export async function notificationsAllowed(): Promise<boolean> {
  try {
    return (await getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Спросить разрешение на уведомления. Вызывается, только когда человек сам включил переключатель. */
export async function allowNotifications(): Promise<boolean> {
  // Свои каналы создаются до запроса: Android 13+ показывает его, только когда у приложения есть хотя бы один.
  // В Expo Go создать их нельзя (модуль отвечает ошибкой) — там уведомления идут через канал по умолчанию.
  await Promise.all([
    setNotificationChannelAsync('reminders', { name: 'Напоминания', importance: AndroidImportance.DEFAULT }),
    setNotificationChannelAsync('pomodoro', { name: 'Таймер Pomodoro', importance: AndroidImportance.HIGH }),
  ]).catch(() => {});
  try {
    if (await notificationsAllowed()) return true;
    const answer = await requestPermissionsAsync();
    // При разработке причина отказа видна в терминале сервера: на телефоне её иначе не узнать.
    if (__DEV__ && !answer.granted) console.warn('Уведомления: разрешение не дано', JSON.stringify(answer));
    return answer.granted;
  } catch (error) {
    if (__DEV__) console.warn('Уведомления: запрос разрешения не удался', error);
    return false;
  }
}

export async function scheduleNotification({ id, at, title, body, url, channel }: LocalNotification): Promise<void> {
  await scheduleNotificationAsync({
    identifier: id,
    content: { title, body, data: { url } },
    trigger: { type: SchedulableTriggerInputTypes.DATE, date: at, channelId: channel },
  });
}

export async function cancelNotifications(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => cancelScheduledNotificationAsync(id)));
}

export async function cancelAllNotifications(): Promise<void> {
  await cancelAllScheduledNotificationsAsync();
}

/** Нажатие на уведомление открывает нужный экран. ready — навигация уже на экране. */
export function useNotificationTaps(ready: boolean) {
  const router = useRouter();
  const response = useLastNotificationResponse();
  useEffect(() => {
    if (!ready || !response) return;
    const url: unknown = response.notification.request.content.data?.url;
    // Система помнит последнее нажатие: без очистки оно сработало бы снова при следующем запуске.
    clearLastNotificationResponse();
    if (typeof url !== 'string') return;
    // Лента лежит в основании стека: к ней возвращаемся, остальные экраны открываем поверх.
    if (url.startsWith('/?')) router.dismissTo(url as Href);
    else router.push(url as Href);
  }, [ready, response, router]);
}
