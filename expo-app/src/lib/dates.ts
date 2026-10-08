// Даты дневника — в местном времени телефона: «сегодня» меняется в полночь у пользователя, а не по UTC.

export const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

/** Для подписей графика: «24 сен». */
export const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/** С понедельника, как в календаре дневника. */
export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Ключ дня: «2026-09-24». */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Время отметки: «14:20». */
export function toTimeLabel(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function addDays(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** Индекс дня недели с понедельника: 0 — Пн, 6 — Вс. */
export function weekdayIndex(key: string): number {
  return (fromDateKey(key).getDay() + 6) % 7;
}

/** «24 сентября». */
export function dayAndMonth(key: string): string {
  const date = fromDateKey(key);
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
}

/** «24 сен». */
export function dayAndShortMonth(key: string): string {
  const date = fromDateKey(key);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** «3.08» — короткая дата под столбиком графика. */
export function dayDotMonth(key: string): string {
  const date = fromDateKey(key);
  return `${date.getDate()}.${pad(date.getMonth() + 1)}`;
}

/** «Сегодня», «Вчера» или «22 сентября». */
export function relativeDay(key: string, todayKey: string): string {
  if (key === todayKey) return 'Сегодня';
  if (key === addDays(todayKey, -1)) return 'Вчера';
  return dayAndMonth(key);
}
