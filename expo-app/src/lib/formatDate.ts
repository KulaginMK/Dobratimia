import { MONTHS_GENITIVE } from './dates';

/** «2026-09-01» → «1 сентября 2026». Без «г.» в конце, как в макетах. */
export function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} ${MONTHS_GENITIVE[month - 1]} ${year}`;
}
