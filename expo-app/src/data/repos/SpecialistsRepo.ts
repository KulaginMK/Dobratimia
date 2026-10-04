/** Опубликованная карточка специалиста — её видят студенты (таблица specialists, docs/08). */
export type Specialist = {
  id: string;
  firstName: string;
  lastName: string;
  /** «Ольге Мирошник» — для подписи «Позвонить …». */
  nameDative: string;
  /** Для «добавлена / добавлен». */
  gender: 'f' | 'm';
  /** «Психолог», «Психотерапевт». */
  title: string;
  /** «8 лет». */
  experience?: string;
  /** «магистр психологии». */
  education?: string;
  /** До пяти. */
  specializations: string[];
  /** До 140 знаков, без кавычек. */
  quote?: string;
  about?: string;
  formatOnline: boolean;
  formatOffline: boolean;
  city?: string;
  /** Фото в хранилище. Пока его нет — силуэт. */
  photoUri?: string;
};

/** Контакты специалиста (таблица specialist_contacts): отдаются только после «Нравится». */
export type SpecialistContacts = {
  phone?: string;
  /** «@miroshnik_psy». */
  telegram?: string;
  /** Ссылка на онлайн-запись. */
  bookingUrl?: string;
};

export interface SpecialistsRepo {
  /** Все опубликованные специалисты. */
  published(): Promise<Specialist[]>;
  /**
   * Контакты специалиста. Сервер отдаёт их только пользователю, который отметил его «Нравится»,
   * и только с согласия специалиста; иначе — null (docs/07, docs/08).
   */
  contacts(userId: string, specialistId: string): Promise<SpecialistContacts | null>;
}
