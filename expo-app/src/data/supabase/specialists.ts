import type { Specialist, SpecialistContacts, SpecialistsRepo } from '@/data/repos/SpecialistsRepo';
import type { SetRemote } from '@/data/sync/syncedSet';
import { request } from './client';

type SpecialistRow = {
  id: string;
  first_name: string;
  last_name: string;
  name_dative: string;
  gender: 'f' | 'm' | null;
  title: string | null;
  experience: string | null;
  education: string | null;
  specializations: string[] | null;
  quote: string | null;
  about: string | null;
  format_online: boolean;
  format_offline: boolean;
  city: string | null;
};

type ContactsRow = { phone: string | null; telegram: string | null; booking_url: string | null };

const CARD_COLUMNS =
  'id, first_name, last_name, name_dative, gender, title, experience, education, specializations, quote, about, format_online, format_offline, city';

/** Строка таблицы specialists → карточка приложения. Пустые поля сервера — это «нет значения». */
export function toSpecialist(row: SpecialistRow): Specialist {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    nameDative: row.name_dative,
    gender: row.gender ?? 'f',
    title: row.title ?? '',
    experience: row.experience ?? undefined,
    education: row.education ?? undefined,
    specializations: row.specializations ?? [],
    quote: row.quote ?? undefined,
    about: row.about ?? undefined,
    formatOnline: row.format_online,
    formatOffline: row.format_offline,
    city: row.city ?? undefined,
  };
}

export function toContacts(row: ContactsRow | null): SpecialistContacts | null {
  if (!row) return null;
  return {
    phone: row.phone ?? undefined,
    telegram: row.telegram ?? undefined,
    bookingUrl: row.booking_url ?? undefined,
  };
}

export const supabaseSpecialistsRepo: SpecialistsRepo = {
  published: async () => {
    const rows = await request<SpecialistRow[]>((db) =>
      db.from('specialists').select(CARD_COLUMNS).eq('published', true).order('last_name'),
    );
    return rows.map(toSpecialist);
  },
  // Сервер сам решает, отдавать ли контакты: строка видна только после отметки «Нравится» (правила доступа в базе).
  contacts: async (_userId, specialistId) => {
    const row = await request<ContactsRow | null>((db) =>
      db
        .from('specialist_contacts')
        .select('phone, telegram, booking_url')
        .eq('specialist_id', specialistId)
        .maybeSingle(),
    );
    return toContacts(row);
  },
};

// Повторная отметка — не ошибка: строка уже есть (код 23505 — «такая запись уже существует»).
const DUPLICATE = '23505';

/** Таблица likes: отметки «Нравится» специалистам. */
export const supabaseLikesRemote: SetRemote = {
  list: async (userId) => {
    const rows = await request<{ specialist_id: string }[]>((db) =>
      db.from('likes').select('specialist_id').eq('user_id', userId),
    );
    return rows.map((row) => row.specialist_id);
  },
  add: async (userId, specialistId) => {
    try {
      await request((db) => db.from('likes').insert({ user_id: userId, specialist_id: specialistId }));
    } catch (error) {
      if ((error as { code?: string }).code !== DUPLICATE) throw error;
    }
  },
  remove: async (userId, specialistId) => {
    await request((db) => db.from('likes').delete().eq('user_id', userId).eq('specialist_id', specialistId));
  },
};
