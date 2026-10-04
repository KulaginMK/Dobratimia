export type UniversityId = 'vsmu' | 'bsmu' | 'grsmu' | 'gomsmu' | 'other';

/** Сотрудник психологической службы вуза («Специалисты службы» на экране SOS вуза). */
export type UniversityStaff = {
  id: string;
  name: string;
  /** Имя в дательном падеже для подписи «Позвонить …». В схеме docs/08 его пока нет — добавить на этапе 12. */
  nameDative?: string;
  /** «Психолог». */
  role: string;
  /** «очно», «очно и онлайн». */
  format: string;
  phone: string;
};

export type UniversityService = {
  /** «Психологическая служба ВГМУ». */
  name: string;
  address: string;
  hours: string;
  phone: string;
  /** Когда администратор проверил контакты, ГГГГ-ММ-ДД. */
  verifiedAt: string;
  staff: UniversityStaff[];
};

export type University = {
  id: UniversityId;
  /** «ВГМУ». */
  shortName: string;
  fullName: string;
  /** Город вуза; у пункта «Другой вуз» города нет. */
  city: string | null;
  /** Контакты службы. null — службы нет или её контакты ещё не проверены. */
  service: UniversityService | null;
};

/**
 * Справочник вузов. Зашит в приложение, чтобы SOS работал без входа и без сети;
 * на этапе 12 будет обновляться с сервера (docs/08).
 */
export interface UniversitiesRepo {
  all(): University[];
  byId(id: string | null): University | null;
}
