import type { CardFields } from '@/data/repos';
import { isWebUrl } from '@/lib/url';

// Форма редактирования карточки (эталон CabEdit, docs/05): фиксированный список специализаций, проверки и чистка полей.

export const SPECIALIZATIONS = [
  'Тревога',
  'Выгорание',
  'Сон',
  'Перфекционизм',
  'Учёба и экзамены',
  'Отношения',
  'Утрата',
];
export const MAX_SPECIALIZATIONS = 5;
export const QUOTE_MAX = 140;

/** Поля формы: как в карточке, только имя и фамилия — одним полем. */
export type CardForm = Omit<CardFields, 'firstName' | 'lastName'> & { name: string };

export type FormErrors = Partial<Record<'name' | 'title' | 'format' | 'phone' | 'telegram' | 'bookingUrl', string>>;

export function toForm({ firstName, lastName, ...rest }: CardFields): CardForm {
  return { ...rest, name: `${firstName} ${lastName}` };
}

const words = (text: string) => text.trim().split(/\s+/).filter(Boolean);

/** «https://t.me/miroshnik_psy», «miroshnik_psy», «@miroshnik_psy» → «@miroshnik_psy». */
function telegramName(value: string): string {
  const name = value.trim().replace(/^(https?:\/\/)?t\.me\//i, '').replace(/^@/, '');
  return name ? `@${name}` : '';
}

/** Без одной точки в конце; многоточие остаётся. */
const noDot = (text: string) => text.replace(/(?<!\.)\.$/, '');

/** Что исправить перед отправкой. Пустой объект — всё в порядке. */
export function validate(form: CardForm): FormErrors {
  const errors: FormErrors = {};
  if (words(form.name).length < 2) errors.name = 'Напишите имя и фамилию';
  if (!form.title.trim()) errors.title = 'Напишите, кто вы по профессии';
  if (!form.formatOnline && !form.formatOffline) errors.format = 'Выберите хотя бы один формат';
  if (form.phone.trim() && !/^\+?[\d\s()-]{7,}$/.test(form.phone.trim())) {
    errors.phone = 'Проверьте номер: в нём могут быть только цифры, пробелы, скобки, дефис и +';
  }
  if (form.telegram.trim() && !/^@\w{4,32}$/.test(telegramName(form.telegram))) {
    errors.telegram = 'Укажите имя пользователя в Telegram: латинские буквы, цифры и подчёркивание';
  }
  if (form.bookingUrl.trim() && !isWebUrl(form.bookingUrl.trim())) {
    errors.bookingUrl = 'Ссылка должна начинаться с https://';
  }
  return errors;
}

/** Форма → поля карточки для черновика. Вызывать после validate(). */
export function toFields({ name, ...form }: CardForm): CardFields {
  // ponytail: фамилия — последнее слово. Дательный падеж («Позвонить Ольге Мирошник») при смене имени
  // правит администратор; если понадобится — отдельное поле.
  const parts = words(name);
  const lastName = parts.pop() ?? '';
  return {
    ...form,
    firstName: parts.join(' '),
    lastName,
    title: form.title.trim(),
    specializations: form.specializations.slice(0, MAX_SPECIALIZATIONS),
    // Кавычки и точку в конце карточка добавляет сама: «…».
    quote: noDot(noDot(form.quote.trim()).replace(/^[«"“„]+|[»"”“]+$/g, '')).trim(),
    about: form.about.trim(),
    experience: form.experience.trim(),
    education: form.education.trim(),
    // Город нужен только тем, кто принимает очно.
    city: form.formatOffline ? form.city.trim() : '',
    phone: form.phone.trim(),
    telegram: telegramName(form.telegram),
    bookingUrl: form.bookingUrl.trim(),
  };
}
