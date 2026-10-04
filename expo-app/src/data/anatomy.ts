import { TEXT_NEEDED } from './placeholders';

export type OrganId = 'brain' | 'heart' | 'lungs' | 'stomach' | 'adrenals';

export type Organ = {
  id: OrganId;
  name: string;
  /** «Что происходит» — что стресс делает с органом. Без диагнозов: это нормальные реакции тела. */
  what: string;
  /** «Как помочь себе». */
  help: string[];
  /** Связанная техника и подпись ссылки на неё. */
  technique?: { id: string; linkLabel: string };
};

/** Орган, выбранный при открытии экрана. */
export const DEFAULT_ORGAN: OrganId = 'heart';

// Готов текст только для «Сердца» (макет Anatomy). Остальные органы должен написать и проверить
// врач или преподаватель физиологии (docs/07, docs/10).
export const ORGANS: Organ[] = [
  { id: 'brain', name: 'Мозг', what: TEXT_NEEDED, help: [TEXT_NEEDED] },
  {
    id: 'heart',
    name: 'Сердце',
    what: 'Надпочечники выбрасывают адреналин, сердце бьётся чаще, давление поднимается. Это нормальная реакция: тело готовится действовать.',
    help: [
      'Выдох длиннее вдоха — например, дыхание 4-7-8',
      'Пройтись или подняться по лестнице: дать энергии выход',
    ],
    technique: { id: 'breath-4-7-8', linkLabel: 'Открыть дыхание 4-7-8 →' },
  },
  { id: 'lungs', name: 'Лёгкие', what: TEXT_NEEDED, help: [TEXT_NEEDED] },
  { id: 'stomach', name: 'Желудок', what: TEXT_NEEDED, help: [TEXT_NEEDED] },
  { id: 'adrenals', name: 'Надпочечники', what: TEXT_NEEDED, help: [TEXT_NEEDED] },
];
