import { describe, expect, test } from '@jest/globals';
import type { Specialist } from '@/data/repos';
import { deckOrder } from './deck';
import { addedToFavorites, experienceAndFormat, formatAndCity, roleAndFormat, roleExperienceFormat } from './labels';

const person = (id: string, over: Partial<Specialist> = {}): Specialist => ({
  id,
  firstName: 'Ольга',
  lastName: 'Мирошник',
  nameDative: 'Ольге Мирошник',
  gender: 'f',
  title: 'Психолог',
  specializations: [],
  formatOnline: true,
  formatOffline: false,
  ...over,
});

describe('deckOrder', () => {
  const local = person('local', { formatOnline: false, formatOffline: true, city: 'Витебск' });
  const both = person('both', { formatOffline: true, city: 'Витебск' });
  const online = person('online');
  const far = person('far', { formatOnline: false, formatOffline: true, city: 'Гомель' });
  const all = [far, online, local, both];

  test('сначала те, кто принимает очно в городе вуза, затем онлайн, затем остальные', () => {
    const ids = deckOrder(all, 'Витебск', '2026-10-04').map((item) => item.id);
    expect(ids.slice(0, 2).sort()).toEqual(['both', 'local']);
    expect(ids.slice(2)).toEqual(['online', 'far']);
  });

  test('вуз не выбран — впереди те, кто принимает онлайн', () => {
    const ids = deckOrder(all, null, '2026-10-04').map((item) => item.id);
    expect(ids.slice(0, 2).sort()).toEqual(['both', 'online']);
    expect(ids.slice(2).sort()).toEqual(['far', 'local']);
  });

  test('в пределах дня порядок не меняется и не зависит от порядка на входе', () => {
    const first = deckOrder(all, 'Витебск', '2026-10-04').map((item) => item.id);
    const again = deckOrder([...all].reverse(), 'Витебск', '2026-10-04').map((item) => item.id);
    expect(again).toEqual(first);
  });

  test('исходный список не меняется', () => {
    const copy = [...all];
    deckOrder(all, 'Витебск', '2026-10-04');
    expect(all).toEqual(copy);
  });
});

describe('подписи специалиста — как в макетах', () => {
  const olga = person('olga', {
    experience: '8 лет',
    education: 'магистр психологии',
    formatOffline: true,
    city: 'Витебск',
  });
  const dmitry = person('dmitry', { firstName: 'Дмитрий', gender: 'm', title: 'Психотерапевт', experience: '12 лет' });

  test('карточка подбора', () => {
    expect(formatAndCity(olga)).toBe('Онлайн и очно · Витебск');
    expect(formatAndCity(dmitry)).toBe('Онлайн');
  });

  test('профиль', () => {
    expect(roleExperienceFormat(olga)).toBe('Психолог · опыт 8 лет · онлайн и очно');
    expect(experienceAndFormat(olga)).toBe(
      '8 лет практики, магистр психологии. Онлайн — по видеосвязи; очно — в Витебске.',
    );
    expect(experienceAndFormat(dmitry)).toBe('12 лет практики. Онлайн — по видеосвязи.');
  });

  test('избранные', () => {
    expect(roleAndFormat(olga)).toBe('Психолог · онлайн и очно, Витебск');
    expect(roleAndFormat(dmitry)).toBe('Психотерапевт · онлайн');
  });

  test('род в плашке «Контакты открыты»', () => {
    expect(addedToFavorites(olga)).toBe('Ольга добавлена в избранные.');
    expect(addedToFavorites(dmitry)).toBe('Дмитрий добавлен в избранные.');
  });
});
