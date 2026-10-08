import type { Specialist, SpecialistContacts } from './SpecialistsRepo';

/** Всё, что специалист правит в кабинете (эталон CabEdit). «Сохранить» отправляет эти поля черновиком на проверку. */
export type CardFields = {
  firstName: string;
  lastName: string;
  /** «Кто вы»: «Психолог». */
  title: string;
  /** До пяти. */
  specializations: string[];
  /** До 140 знаков, без кавычек. */
  quote: string;
  about: string;
  /** Свободный текст: «8 лет». */
  experience: string;
  education: string;
  formatOnline: boolean;
  formatOffline: boolean;
  city: string;
  phone: string;
  /** «@miroshnik_psy». */
  telegram: string;
  bookingUrl: string;
  /** «Согласие на публикацию контактов»: без него контакты не показываются никому. */
  consent: boolean;
};

/** Отклики «Нравится»: только числа, без имён (docs/08). */
export type LikeStats = {
  total: number;
  /** Восемь календарных недель с понедельника, от самой давней к текущей. */
  weeks: number[];
};

export type Cabinet = {
  /** Опубликованная версия карточки: её видят студенты, пока черновик не одобрен. */
  card: Specialist;
  /** false — карточку студентам ещё не показывают. */
  published: boolean;
  /** Правки на проверке у администратора или возвращённые с замечаниями; null — правок нет. */
  draft: { status: 'pending' | 'changes_requested'; comment?: string } | null;
  /** С чем открывается редактирование: опубликованная версия вместе с правками из черновика. */
  fields: CardFields;
  stats: LikeStats;
};

/** Кабинет специалиста. Работает только с сетью (docs/08); заглушка — src/data/mocks/specialists.ts. */
export interface CabinetRepo {
  /** Карточка, черновик и статистика вошедшего специалиста. */
  load(): Promise<Cabinet>;
  /** «Сохранить»: черновик уходит администратору, студенты видят прежнюю версию. */
  submit(fields: CardFields): Promise<void>;
}

/** Поля редактирования из опубликованной карточки и контактов. */
export function cardFields(card: Specialist, contacts: SpecialistContacts | null, consent: boolean): CardFields {
  return {
    firstName: card.firstName,
    lastName: card.lastName,
    title: card.title,
    specializations: card.specializations,
    quote: card.quote ?? '',
    about: card.about ?? '',
    experience: card.experience ?? '',
    education: card.education ?? '',
    formatOnline: card.formatOnline,
    formatOffline: card.formatOffline,
    city: card.city ?? '',
    phone: contacts?.phone ?? '',
    telegram: contacts?.telegram ?? '',
    bookingUrl: contacts?.bookingUrl ?? '',
    consent,
  };
}
