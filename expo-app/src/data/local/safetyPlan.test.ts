import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearUserData } from './session';
import { PLAN_ITEM_MAX, PLAN_ITEMS_MAX, emptyPlan, filledSections, loadSafetyPlan, parsePlan, saveSafetyPlan } from './safetyPlan';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(() => AsyncStorage.clear());

describe('план на трудный момент', () => {
  test('сохранённый план читается обратно, другой аккаунт его не видит', async () => {
    const plan = { ...emptyPlan(), calm: ['Душ', 'Дыхание 4-6'], people: ['Мама +375 29 000-00-00'] };
    await saveSafetyPlan('anna', plan);
    expect(await loadSafetyPlan('anna')).toEqual(plan);
    expect(await loadSafetyPlan('oleg')).toEqual(emptyPlan());
    expect(filledSections(plan)).toBe(2);
  });

  test('испорченная запись даёт пустой план, лишнее отбрасывается', async () => {
    await AsyncStorage.setItem('user:anna:safetyPlan', '{не json');
    expect(await loadSafetyPlan('anna')).toEqual(emptyPlan());

    const parsed = parsePlan({
      calm: ['  Прогулка  ', '', 42, 'x'.repeat(PLAN_ITEM_MAX + 50)],
      reasons: Array.from({ length: PLAN_ITEMS_MAX + 5 }, (_, i) => `Пункт ${i}`),
      unknown: ['чужое'],
      signs: 'не список',
    });
    expect(parsed.calm).toEqual(['Прогулка', 'x'.repeat(PLAN_ITEM_MAX)]);
    expect(parsed.reasons).toHaveLength(PLAN_ITEMS_MAX);
    expect(parsed.signs).toEqual([]);
    expect(Object.keys(parsed)).not.toContain('unknown');
  });

  test('«Удалить мои данные» стирает и план', async () => {
    await saveSafetyPlan('anna', { ...emptyPlan(), notes: ['Это пройдёт'] });
    await clearUserData('anna');
    expect(await loadSafetyPlan('anna')).toEqual(emptyPlan());
  });
});
