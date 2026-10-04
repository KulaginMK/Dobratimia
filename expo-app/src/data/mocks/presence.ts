// ЗАГЛУШКА: число «Сегодня вы не одни» демонстрационное (handoff/docs/10-placeholders.md).
// На этапе 12 его будет считать сервер: уникальные пользователи за день, часовой пояс Europe/Minsk.
import type { PresenceRepo } from '@/data/repos/PresenceRepo';

export const mockPresenceRepo: PresenceRepo = {
  todayCount: async () => 128,
};
