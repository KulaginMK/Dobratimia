import { describe, expect, jest, test } from '@jest/globals';
import { parseCallbackUrl } from './auth';
import { toCabinet, toPayload } from './cabinet';
import { toContacts, toSpecialist } from './specialists';
import { toUniversities } from './universities';

// Сам клиент Supabase этим тестам не нужен: проверяется только разбор ответов сервера.
jest.mock('./client', () => ({}));
jest.mock('expo-web-browser', () => ({}));
jest.mock('expo-linking', () => ({}));

describe('адрес возврата после входа через Google', () => {
  test('код входа — из параметров адреса', () => {
    expect(parseCallbackUrl('dobratimia://auth/callback?code=abc-123')).toEqual({ code: 'abc-123' });
    expect(parseCallbackUrl('exp://192.168.0.5:8081/--/auth/callback?code=abc&state=x')).toEqual({ code: 'abc' });
  });

  test('отказ — с описанием, в параметрах или после решётки', () => {
    expect(parseCallbackUrl('dobratimia://auth/callback?error=access_denied&error_description=User+denied')).toEqual({
      error: 'User denied',
    });
    expect(parseCallbackUrl('dobratimia://auth/callback#error=server_error')).toEqual({ error: 'server_error' });
  });

  test('адрес без параметров — ни кода, ни ошибки', () => {
    expect(parseCallbackUrl('dobratimia://auth/callback')).toEqual({});
  });
});

describe('строки сервера', () => {
  test('карточка специалиста: пустые поля — «нет значения», а не пустые строки', () => {
    const specialist = toSpecialist({
      id: 'id-1',
      first_name: 'Елена',
      last_name: 'Савчук',
      name_dative: 'Елене Савчук',
      gender: 'f',
      title: 'Психолог',
      experience: null,
      education: null,
      specializations: null,
      quote: null,
      about: null,
      format_online: false,
      format_offline: true,
      city: 'Витебск',
    });
    expect(specialist).toMatchObject({ firstName: 'Елена', nameDative: 'Елене Савчук', specializations: [] });
    expect(specialist.quote).toBeUndefined();
    expect(specialist.experience).toBeUndefined();
  });

  test('контакты: нет строки — контакты закрыты', () => {
    expect(toContacts(null)).toBeNull();
    expect(toContacts({ phone: '+375 29 555-12-34', telegram: null, booking_url: null })).toEqual({
      phone: '+375 29 555-12-34',
      telegram: undefined,
      bookingUrl: undefined,
    });
  });

  test('вуз без проверенного телефона службы показывается без службы', () => {
    const base = { full_name: 'Университет', service_address: null, service_hours: null, verified_at: null };
    const universities = toUniversities(
      [
        { ...base, id: 'vsmu', short_name: 'ВГМУ', city: 'Витебск', service_name: 'Служба', service_phone: '+375 212 00-00-00' },
        { ...base, id: 'bsmu', short_name: 'БГМУ', city: 'Минск', service_name: 'Служба', service_phone: null },
        { ...base, id: 'unknown', short_name: '?', city: null, service_name: null, service_phone: null },
      ],
      [
        { id: 's1', university_id: 'vsmu', name: 'Наталья Бусько', name_dative: null, role: 'Психолог', format: 'очно', phone: '+375 212 00-00-01' },
        { id: 's2', university_id: 'vsmu', name: 'Без телефона', name_dative: null, role: null, format: null, phone: null },
      ],
    );
    expect(universities.map((university) => university.id)).toEqual(['vsmu', 'bsmu']);
    expect(universities[0].service?.staff.map((person) => person.name)).toEqual(['Наталья Бусько']);
    expect(universities[1].service).toBeNull();
  });

  test('кабинет: редактирование открывается с черновиком, а превью остаётся опубликованным', () => {
    const card = {
      id: 'id-1',
      first_name: 'Ольга',
      last_name: 'Мирошник',
      name_dative: 'Ольге Мирошник',
      gender: 'f' as const,
      title: 'Психолог',
      experience: '8 лет',
      education: null,
      specializations: ['Тревога'],
      quote: 'Прежняя цитата',
      about: null,
      format_online: true,
      format_offline: true,
      city: 'Витебск',
      published: true,
    };
    const contacts = { phone: '+375 29 555-12-34', telegram: null, booking_url: null, consent: true };
    const stats = { total: 37, weeks: [2, 4, 3, 5, 6, 4, 8, 5] };

    const clean = toCabinet(card, contacts, null, stats);
    expect(clean.draft).toBeNull();
    expect(clean.fields).toMatchObject({ quote: 'Прежняя цитата', phone: '+375 29 555-12-34', consent: true, education: '' });

    // Черновик: цитата изменена, город очищен (null), согласие снято; телефона в черновике нет — остаётся прежний.
    const payload = { quote: 'Новая цитата', city: null, consent: false, specializations: ['Сон', 'Утрата'] };
    const edited = toCabinet(card, contacts, { payload, status: 'changes_requested', admin_comment: 'Короче' }, stats);
    expect(edited.draft).toEqual({ status: 'changes_requested', comment: 'Короче' });
    expect(edited.card.quote).toBe('Прежняя цитата');
    expect(edited.fields).toMatchObject({
      quote: 'Новая цитата',
      city: '',
      consent: false,
      specializations: ['Сон', 'Утрата'],
      phone: '+375 29 555-12-34',
      firstName: 'Ольга',
    });
    expect(edited.stats.weeks).toHaveLength(8);
  });

  test('кабинет: очищенное поле уходит в черновик как null, названия — как колонки', () => {
    const { fields } = toCabinet(
      {
        id: 'id-1',
        first_name: 'Ольга',
        last_name: 'Мирошник',
        name_dative: 'Ольге Мирошник',
        gender: 'f',
        title: 'Психолог',
        experience: null,
        education: null,
        specializations: [],
        quote: null,
        about: null,
        format_online: true,
        format_offline: false,
        city: null,
        published: false,
      },
      null,
      null,
      { total: 0, weeks: null },
    );
    expect(toPayload({ ...fields, bookingUrl: 'https://example.com/' })).toEqual({
      first_name: 'Ольга',
      last_name: 'Мирошник',
      title: 'Психолог',
      experience: null,
      education: null,
      specializations: [],
      quote: null,
      about: null,
      format_online: true,
      format_offline: false,
      city: null,
      phone: null,
      telegram: null,
      booking_url: 'https://example.com/',
      consent: false,
    });
  });
});
