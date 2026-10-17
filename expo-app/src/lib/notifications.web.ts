import type { LocalNotification } from './notifications';

// В вебе локальных уведомлений по расписанию нет (docs/07): разрешение «не дано», остальное ничего не делает.

export async function notificationsAllowed(): Promise<boolean> {
  return false;
}

export async function allowNotifications(): Promise<boolean> {
  return false;
}

export async function createChannels(): Promise<void> {}

export async function scheduleNotification(_notification: LocalNotification): Promise<void> {}

export async function cancelNotifications(_ids: string[]): Promise<void> {}

export async function dismissNotifications(_ids: string[]): Promise<void> {}

export async function cancelAllNotifications(): Promise<void> {}

export function useNotificationTaps(_ready: boolean) {}
