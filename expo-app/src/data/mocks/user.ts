// ЗАГЛУШКА: вымышленный пользователь из макетов (handoff/docs/10-placeholders.md) и вход-имитация.
// На этапе 12 имя и почта придут из Google-аккаунта, а вместо mockAuthRepo будет вход через Supabase.
import { GUEST_USER_ID } from '@/data/local/session';
import type { AuthRepo, SessionUser } from '@/data/repos/AuthRepo';

export const mockUser: SessionUser = {
  // Тот же ключ, под которым данные лежали до появления входа: дневник и тесты с телефона не пропадают.
  id: GUEST_USER_ID,
  name: 'Анна Кравец',
  email: 'anna.kravets@gmail.com',
  role: 'student',
};

// Кнопка «Войти через Google» никуда не ходит: сразу «входит» вымышленный пользователь.
export const mockAuthRepo: AuthRepo = {
  signInWithGoogle: async () => mockUser,
  signOut: async () => {},
  // Отметки «Нравится» заглушки лежат на устройстве и стираются вместе с остальными данными.
  deleteAccount: async () => {},
};
