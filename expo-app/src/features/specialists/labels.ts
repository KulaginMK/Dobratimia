import type { Specialist } from '@/data/repos';

// Подписи специалиста для разных экранов. Собираются из полей карточки (docs/08), а не хранятся готовыми.

// «Очно — в Витебске»: города медицинских вузов в предложном падеже.
const CITY_IN: Record<string, string> = {
  Витебск: 'в Витебске',
  Минск: 'в Минске',
  Гродно: 'в Гродно',
  Гомель: 'в Гомеле',
};

export function fullName(specialist: Specialist): string {
  return `${specialist.firstName} ${specialist.lastName}`;
}

/** «ОМ» — для аватара. */
export function initials(specialist: Specialist): string {
  return `${specialist.firstName[0]}${specialist.lastName[0]}`;
}

/** «онлайн и очно», «онлайн», «очно». */
function formatWords(specialist: Specialist): string {
  if (specialist.formatOnline && specialist.formatOffline) return 'онлайн и очно';
  return specialist.formatOnline ? 'онлайн' : 'очно';
}

/** Город нужен только тем, кто принимает очно. */
function offlineCity(specialist: Specialist): string | undefined {
  return specialist.formatOffline ? specialist.city : undefined;
}

const capitalize = (text: string) => `${text[0].toUpperCase()}${text.slice(1)}`;

/** Карточка в подборе: «Психолог · опыт 8 лет». */
export function roleAndExperience(specialist: Specialist): string {
  return specialist.experience ? `${specialist.title} · опыт ${specialist.experience}` : specialist.title;
}

/** Карточка в подборе, строка формата: «Онлайн и очно · Витебск». */
export function formatAndCity(specialist: Specialist): string {
  const city = offlineCity(specialist);
  return city ? `${capitalize(formatWords(specialist))} · ${city}` : capitalize(formatWords(specialist));
}

/** Профиль и шторка автора: «Психолог · опыт 8 лет · онлайн и очно». */
export function roleExperienceFormat(specialist: Specialist): string {
  return `${roleAndExperience(specialist)} · ${formatWords(specialist)}`;
}

/** Избранные: «Психолог · онлайн и очно, Витебск». */
export function roleAndFormat(specialist: Specialist): string {
  const city = offlineCity(specialist);
  return `${specialist.title} · ${formatWords(specialist)}${city ? `, ${city}` : ''}`;
}

/** Профиль, «Опыт и формат»: «8 лет практики, магистр психологии. Онлайн — по видеосвязи; очно — в Витебске.» */
export function experienceAndFormat(specialist: Specialist): string {
  const experience = [specialist.experience ? `${specialist.experience} практики` : null, specialist.education ?? null]
    .filter(Boolean)
    .join(', ');
  const city = offlineCity(specialist);
  const offline = city ? `очно — ${CITY_IN[city] ?? city}` : 'очно';
  const format = [specialist.formatOnline ? 'онлайн — по видеосвязи' : null, specialist.formatOffline ? offline : null]
    .filter((part): part is string => part !== null)
    .join('; ');
  return [experience, format].filter(Boolean).map((part) => `${capitalize(part)}.`).join(' ');
}

/** «Ольга добавлена в избранные» / «Дмитрий добавлен в избранные». */
export function addedToFavorites(specialist: Specialist): string {
  return `${specialist.firstName} ${specialist.gender === 'f' ? 'добавлена' : 'добавлен'} в избранные.`;
}
