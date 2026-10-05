// ЗАГЛУШКА: вымышленные специалисты и их контакты из макетов (handoff/docs/10-placeholders.md).
// Имена, телефоны и Telegram взяты из макетов Match, SpecialistProfile, Favorites и GoodWordAuthor;
// новые телефоны не выдумываем. Специализации Дмитрия Гайдука и Елены Савчук, ссылки на запись (example.com)
// придуманы для заглушки. Перед публикацией здесь будут настоящие специалисты — с сервера (этап 12).
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LikesRepo } from '@/data/repos/LikesRepo';
import type { Specialist, SpecialistContacts, SpecialistsRepo } from '@/data/repos/SpecialistsRepo';

const SPECIALISTS: Specialist[] = [
  {
    id: 'olga-miroshnik',
    firstName: 'Ольга',
    lastName: 'Мирошник',
    nameDative: 'Ольге Мирошник',
    gender: 'f',
    title: 'Психолог',
    experience: '8 лет',
    education: 'магистр психологии',
    specializations: ['Тревога', 'Выгорание', 'Сон', 'Перфекционизм'],
    quote: 'Тревога перед экзаменом — не слабость. Давайте спокойно разберёмся, что за ней стоит',
    about:
      'Работаю со студентами и молодыми врачами. Помогаю справиться с тревогой перед сессией, выгоранием на практике и бессонницей после ночных смен. Подход — когнитивно-поведенческая терапия.',
    formatOnline: true,
    formatOffline: true,
    city: 'Витебск',
  },
  {
    id: 'dmitry-gaiduk',
    firstName: 'Дмитрий',
    lastName: 'Гайдук',
    nameDative: 'Дмитрию Гайдуку',
    gender: 'm',
    title: 'Психотерапевт',
    experience: '12 лет',
    specializations: ['Стресс', 'Выгорание'],
    formatOnline: true,
    formatOffline: false,
  },
  {
    id: 'elena-savchuk',
    firstName: 'Елена',
    lastName: 'Савчук',
    nameDative: 'Елене Савчук',
    gender: 'f',
    title: 'Психолог',
    specializations: ['Адаптация', 'Отношения'],
    formatOnline: false,
    formatOffline: true,
    city: 'Витебск',
  },
  {
    id: 'irina-rakovich',
    firstName: 'Ирина',
    lastName: 'Ракович',
    nameDative: 'Ирине Ракович',
    gender: 'f',
    title: 'Психотерапевт',
    experience: '12 лет',
    specializations: ['Тревога', 'Выгорание', 'Перфекционизм'],
    about:
      'Работает со студентами и молодыми врачами: тревога, выгорание, перфекционизм. Пишет фразы для «Доброго слова» с перчинкой — чтобы встряхнуть, а не погладить.',
    formatOnline: true,
    formatOffline: false,
  },
];

const CONTACTS: Record<string, SpecialistContacts> = {
  'olga-miroshnik': {
    phone: '+375 29 555-12-34',
    telegram: '@miroshnik_psy',
    bookingUrl: 'https://example.com/',
  },
  'dmitry-gaiduk': { phone: '+375 44 555-09-87' },
  'elena-savchuk': { phone: '+375 33 555-44-11' },
  // Телефона Ирины Ракович в макетах нет.
  'irina-rakovich': { bookingUrl: 'https://example.com/' },
};

// Вместо таблицы likes на сервере — хранилище устройства. На этапе 12 отметки уйдут на сервер.
const likesKey = (userId: string) => `mock:likes:${userId}`;

async function readLikes(userId: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(likesKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export const mockLikesRepo: LikesRepo = {
  list: readLikes,
  add: async (userId, specialistId) => {
    const likes = await readLikes(userId);
    if (likes.includes(specialistId)) return;
    await AsyncStorage.setItem(likesKey(userId), JSON.stringify([...likes, specialistId]));
  },
  remove: async (userId, specialistId) => {
    const likes = await readLikes(userId);
    await AsyncStorage.setItem(likesKey(userId), JSON.stringify(likes.filter((id) => id !== specialistId)));
  },
  flush: async () => {},
};

export const mockSpecialistsRepo: SpecialistsRepo = {
  published: async () => SPECIALISTS,
  // Как и сервер, заглушка не отдаёт контакты без отметки «Нравится».
  contacts: async (userId, specialistId) => {
    const likes = await readLikes(userId);
    return likes.includes(specialistId) ? (CONTACTS[specialistId] ?? null) : null;
  },
};
