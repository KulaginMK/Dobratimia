import type { PresenceRepo } from '@/data/repos/PresenceRepo';
import { request } from './client';

export const supabasePresenceRepo: PresenceRepo = {
  // «Я сегодня здесь» отправляется без лишних данных; сервер хранит только факт и считает разных людей (docs/07).
  todayCount: async () => {
    try {
      await request((db) => db.rpc('mark_presence'));
      return await request<number>((db) => db.rpc('today_count'));
    } catch {
      // Нет сети или человек не вошёл — строку на Главной прячем.
      return null;
    }
  },
};
