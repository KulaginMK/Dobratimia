/** Экраны ленты слева направо. Ключ — значение параметра ?s= в адресе (docs/06). */
export const FEED_SCREENS = [
  { key: 'anatomy', label: 'Анатомия' },
  { key: 'techniques', label: 'Техники' },
  { key: 'home', label: 'Главная' },
  { key: 'match', label: 'Специалисты' },
  { key: 'word', label: 'Слово' },
] as const;

export type FeedKey = (typeof FEED_SCREENS)[number]['key'];

export const FEED_LABELS = FEED_SCREENS.map((screen) => screen.label);

export const HOME_INDEX = 2;
export const TECHNIQUES_INDEX = 1;
export const MATCH_INDEX = 3;

/** Индекс экрана по параметру ?s=. Нет параметра или он неизвестен — Главная. */
export function feedIndex(key: string | string[] | undefined): number {
  const index = FEED_SCREENS.findIndex((screen) => screen.key === key);
  return index === -1 ? HOME_INDEX : index;
}

export function feedKey(index: number): FeedKey {
  return FEED_SCREENS[index].key;
}
