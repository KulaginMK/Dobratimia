import { TEAM_EMAIL } from '@/data/team';
import { APP_VERSION } from '@/lib/appVersion';

/**
 * Письмо команде из приложения. Своего сервера для писем нет: форма открывает почту телефона
 * с готовым письмом, и человек отправляет его сам — так текст не хранится ни у нас, ни на сервере.
 */
export function feedbackMailUrl(message: string, platform: string): string {
  const body = `${message.trim()}\n\n—\nДобратимия ${APP_VERSION} · ${platform}`;
  return `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent('Добратимия: обратная связь')}&body=${encodeURIComponent(body)}`;
}
