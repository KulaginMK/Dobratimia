import { describe, expect, test } from '@jest/globals';
import { toFields, toForm, validate, type CardForm } from './form';

const form: CardForm = {
  name: 'Ольга Мирошник',
  title: 'Психолог',
  specializations: ['Тревога', 'Сон'],
  quote: 'Тревога перед экзаменом — не слабость',
  about: '',
  experience: '8 лет',
  education: '',
  formatOnline: true,
  formatOffline: true,
  city: 'Витебск',
  phone: '+375 29 555-12-34',
  telegram: '@miroshnik_psy',
  bookingUrl: '',
  consent: true,
};

describe('форма карточки специалиста', () => {
  test('заполненная форма проходит проверку и не меняется по дороге туда и обратно', () => {
    expect(validate(form)).toEqual({});
    expect(toForm(toFields(form))).toEqual(form);
  });

  test('имя и фамилия разделяются по последнему слову', () => {
    expect(toFields({ ...form, name: '  Анна  Мария Ковальская ' })).toMatchObject({
      firstName: 'Анна Мария',
      lastName: 'Ковальская',
    });
    expect(validate({ ...form, name: 'Ольга' }).name).toBeDefined();
  });

  test('без профессии и без формата карточку не отправить', () => {
    const errors = validate({ ...form, title: ' ', formatOnline: false, formatOffline: false });
    expect(Object.keys(errors).sort()).toEqual(['format', 'title']);
  });

  test('ссылка на запись — только обычная веб-страница', () => {
    expect(validate({ ...form, bookingUrl: 'javascript:alert(1)' }).bookingUrl).toBeDefined();
    expect(validate({ ...form, bookingUrl: 'example.com' }).bookingUrl).toBeDefined();
    expect(validate({ ...form, bookingUrl: ' https://example.com/ ' })).toEqual({});
  });

  test('Telegram приводится к виду @имя', () => {
    expect(toFields({ ...form, telegram: 'https://t.me/miroshnik_psy' }).telegram).toBe('@miroshnik_psy');
    expect(toFields({ ...form, telegram: ' miroshnik_psy ' }).telegram).toBe('@miroshnik_psy');
    expect(toFields({ ...form, telegram: '' }).telegram).toBe('');
    expect(validate({ ...form, telegram: 'имя с пробелом' }).telegram).toBeDefined();
  });

  test('телефон с буквами не проходит', () => {
    expect(validate({ ...form, phone: 'позвоните мне' }).phone).toBeDefined();
  });

  test('цитата уходит без кавычек и точки в конце: их добавляет карточка', () => {
    expect(toFields({ ...form, quote: ' «Давайте разберёмся». ' }).quote).toBe('Давайте разберёмся');
    expect(toFields({ ...form, quote: 'Давайте разберёмся...' }).quote).toBe('Давайте разберёмся...');
  });

  test('город остаётся только у тех, кто принимает очно', () => {
    expect(toFields({ ...form, formatOffline: false }).city).toBe('');
  });
});
