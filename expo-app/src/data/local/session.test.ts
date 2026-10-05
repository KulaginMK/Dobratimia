import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  adoptGuestData,
  clearUserData,
  loadOnboarded,
  loadSessionUser,
  saveOnboarded,
  saveSessionUser,
} from './session';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const anna = { id: 'anna', name: 'Анна Кравец', email: 'anna.kravets@gmail.com', role: 'student' as const };

beforeEach(() => AsyncStorage.clear());

describe('вход и флаг онбординга', () => {
  test('пока ничего не сохранено — никто не вошёл и онбординг не показан', async () => {
    expect(await loadSessionUser()).toBeNull();
    expect(await loadOnboarded()).toBe(false);
  });

  test('вход переживает перезапуск, выход его стирает, а флаг онбординга остаётся', async () => {
    await saveSessionUser(anna);
    await saveOnboarded();
    expect(await loadSessionUser()).toEqual(anna);

    await saveSessionUser(null);
    expect(await loadSessionUser()).toBeNull();
    expect(await loadOnboarded()).toBe(true);
  });

  test('испорченная запись о входе не считается входом', async () => {
    await AsyncStorage.setItem('app:session', '{"id":1}');
    expect(await loadSessionUser()).toBeNull();
  });
});

describe('«Удалить мои данные»', () => {
  test('стирает личные данные пользователя, вход, вуз и флаг онбординга', async () => {
    await AsyncStorage.multiSet([
      ['user:anna:mood', '[]'],
      ['user:anna:dass', '[]'],
      ['user:anna:scream2', '[]'],
      ['user:anna:rejected', '[]'],
      ['mock:likes:anna', '[]'],
      ['mock:phraseLikes:anna', '[]'],
      ['app:session', JSON.stringify(anna)],
      ['app:onboarded', '1'],
      ['app:university', 'vsmu'],
      ['app:reminders', '{}'],
      ['app:pomodoro', '{}'],
    ]);

    await clearUserData('anna');

    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test('оставляет тему, данные другого аккаунта и чужие ключи', async () => {
    await AsyncStorage.multiSet([
      ['user:anna:mood', '[]'],
      ['app:theme', 'dark'],
      ['user:boris:mood', '[]'],
      ['mock:likes:boris', '[]'],
      ['mock:phraseLikes:boris', '[]'],
      // В вебе хранилище общее на весь сайт: ключи других страниц трогать нельзя.
      ['other-app:settings', '{}'],
    ]);

    await clearUserData('anna');

    expect([...(await AsyncStorage.getAllKeys())].sort()).toEqual([
      'app:theme',
      'mock:likes:boris',
      'mock:phraseLikes:boris',
      'other-app:settings',
      'user:boris:mood',
    ]);
  });
});

describe('первый настоящий вход после входа-заглушки', () => {
  test('дневник и тесты гостя переходят к вошедшему, остальное гостевое стирается', async () => {
    await AsyncStorage.multiSet([
      ['user:guest:mood', '[1]'],
      ['user:guest:dass', '[2]'],
      ['user:guest:scream2', '[3]'],
      ['user:guest:rejected', '["olga-miroshnik"]'],
      ['mock:likes:guest', '["olga-miroshnik"]'],
      ['mock:phraseLikes:guest', '["sweet-1"]'],
      ['app:theme', 'dark'],
    ]);

    await adoptGuestData('anna');

    expect(await AsyncStorage.getItem('user:anna:mood')).toBe('[1]');
    expect(await AsyncStorage.getItem('user:anna:dass')).toBe('[2]');
    expect(await AsyncStorage.getItem('user:anna:scream2')).toBe('[3]');
    expect([...(await AsyncStorage.getAllKeys())].sort()).toEqual([
      'app:theme',
      'user:anna:dass',
      'user:anna:mood',
      'user:anna:scream2',
    ]);
  });

  test('свои данные аккаунта гостевыми не перезаписываются', async () => {
    await AsyncStorage.multiSet([
      ['user:guest:mood', '["гость"]'],
      ['user:anna:mood', '["анна"]'],
    ]);

    await adoptGuestData('anna');

    expect(await AsyncStorage.getItem('user:anna:mood')).toBe('["анна"]');
    expect(await AsyncStorage.getItem('user:guest:mood')).toBeNull();
  });

  test('вход-заглушка свои же данные не трогает', async () => {
    await AsyncStorage.setItem('user:guest:mood', '[1]');
    await adoptGuestData('guest');
    expect(await AsyncStorage.getItem('user:guest:mood')).toBe('[1]');
  });
});
