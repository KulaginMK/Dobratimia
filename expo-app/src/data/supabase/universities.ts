import type { University, UniversityId, UniversityStaff } from '@/data/repos/UniversitiesRepo';
import { request } from './client';

type UniversityRow = {
  id: string;
  short_name: string;
  full_name: string;
  city: string | null;
  service_name: string | null;
  service_address: string | null;
  service_hours: string | null;
  service_phone: string | null;
  verified_at: string | null;
};

type StaffRow = {
  id: string;
  university_id: string;
  name: string;
  name_dative: string | null;
  role: string | null;
  format: string | null;
  phone: string | null;
};

/** Вузы, которые приложение знает: от id зависят экраны SOS и выбор вуза. Незнакомые строки сервера пропускаем. */
const KNOWN_IDS: UniversityId[] = ['vsmu', 'bsmu', 'grsmu', 'gomsmu', 'other'];
const isKnown = (id: string): id is UniversityId => (KNOWN_IDS as string[]).includes(id);

/**
 * Строки universities и university_staff → справочник приложения.
 * Служба показывается, только если у неё есть и название, и телефон: иначе «контакты пока проверяются».
 */
export function toUniversities(rows: UniversityRow[], staff: StaffRow[]): University[] {
  return rows.flatMap((row) => {
    if (!isKnown(row.id)) return [];
    const people: UniversityStaff[] = staff
      .filter((person) => person.university_id === row.id && person.phone)
      .map((person) => ({
        id: person.id,
        name: person.name,
        nameDative: person.name_dative ?? undefined,
        role: person.role ?? '',
        format: person.format ?? '',
        phone: person.phone as string,
      }));
    const university: University = {
      id: row.id,
      shortName: row.short_name,
      fullName: row.full_name,
      city: row.city,
      service:
        row.service_name && row.service_phone
          ? {
              name: row.service_name,
              address: row.service_address ?? '',
              hours: row.service_hours ?? '',
              phone: row.service_phone,
              verifiedAt: row.verified_at ?? '',
              staff: people,
            }
          : null,
    };
    return [university];
  });
}

/** Свежий справочник вузов с сервера. Читается без входа: нужен SOS. */
export async function fetchUniversities(): Promise<University[]> {
  const [rows, staff] = await Promise.all([
    request<UniversityRow[]>((db) =>
      db
        .from('universities')
        .select('id, short_name, full_name, city, service_name, service_address, service_hours, service_phone, verified_at')
        .order('sort_order'),
    ),
    request<StaffRow[]>((db) =>
      db.from('university_staff').select('id, university_id, name, name_dative, role, format, phone').order('sort_order'),
    ),
  ]);
  return toUniversities(rows, staff);
}
