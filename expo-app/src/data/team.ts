// Почта, страницы и карта «Добратимии» — их завёл владелец (15 октября 2026 года).

export const TEAM_EMAIL = 'dobratimia@gmail.com';

/** Страницы проекта: «О проекте» → «Мы в соцсетях». */
export const SOCIAL_LINKS = [
  { title: 'Telegram-канал', handle: 't.me/dobratimia', url: 'https://t.me/dobratimia' },
  { title: 'Instagram', handle: '@dobratimia', url: 'https://www.instagram.com/dobratimia/' },
  { title: 'Threads', handle: '@dobratimia', url: 'https://www.threads.com/@dobratimia' },
];

/** Документы на сайте рядом с лендингом: landing/*.html, собираются из legal/*.md. У специалистов — свои. */
const DOCS = 'https://kulaginmk.github.io/Dobratimia/landing/';
export const PRIVACY_URL = `${DOCS}privacy.html`;
export const CONSENT_URL = `${DOCS}consent.html`;
export const SPECIALIST_PRIVACY_URL = `${DOCS}specialists-privacy.html`;
export const SPECIALIST_CONSENT_URL = `${DOCS}specialists-consent.html`;

/** «Карта бережных мест — Витебск» в Google My Maps. Ссылка на просмотр (viewer), а не на правку (edit). */
export const MAP_URL =
  'https://www.google.com/maps/d/viewer?mid=1H6Qy3gwxrJpn5sefDQM5pL_2hfu82IQ&ll=55.19037596305262%2C30.209224299999995&z=14';
