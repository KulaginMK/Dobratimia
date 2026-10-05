import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineError } from '@/data/repos/errors';
import { createSyncedSet, type SetRemote } from './syncedSet';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/** Сервер-подделка: набор в памяти, сеть можно выключить, часть id сервер отвергает. */
function fakeServer(initial: string[] = []) {
  const state = { online: true, ids: new Set(initial), rejected: new Set<string>(), calls: [] as string[] };
  const online = () => {
    if (!state.online) throw new OfflineError();
  };
  const remote: SetRemote = {
    list: async () => {
      online();
      return [...state.ids];
    },
    add: async (_userId, id) => {
      online();
      state.calls.push(`+${id}`);
      if (state.rejected.has(id)) throw new Error('отказано');
      state.ids.add(id);
    },
    remove: async (_userId, id) => {
      online();
      state.calls.push(`-${id}`);
      state.ids.delete(id);
    },
  };
  return { state, remote };
}

const key = (userId: string) => `user:${userId}:likes`;

beforeEach(() => AsyncStorage.clear());

describe('очередь отметок', () => {
  test('при сети отметка сразу уходит на сервер', async () => {
    const { state, remote } = fakeServer();
    const likes = createSyncedSet(key, remote);

    await likes.set('anna', 'olga', true);

    expect([...state.ids]).toEqual(['olga']);
    expect(await likes.list('anna')).toEqual(['olga']);
  });

  test('без сети отметка не теряется: видна сразу и уходит, когда сеть вернулась', async () => {
    const { state, remote } = fakeServer();
    const likes = createSyncedSet(key, remote);
    state.online = false;

    await expect(likes.set('anna', 'olga', true)).rejects.toBeInstanceOf(OfflineError);
    expect(await likes.list('anna')).toEqual(['olga']);
    await expect(likes.flush('anna')).rejects.toBeInstanceOf(OfflineError);
    expect([...state.ids]).toEqual([]);

    state.online = true;
    await likes.flush('anna');
    expect([...state.ids]).toEqual(['olga']);
  });

  test('очередь переживает перезапуск приложения', async () => {
    const { state, remote } = fakeServer();
    state.online = false;
    await createSyncedSet(key, remote)
      .set('anna', 'olga', true)
      .catch(() => {});

    // Новый запуск: память пуста, осталось только хранилище устройства.
    state.online = true;
    const afterRestart = createSyncedSet(key, remote);
    expect(await afterRestart.list('anna')).toEqual(['olga']);
    expect([...state.ids]).toEqual(['olga']);
  });

  test('поставил и снял без сети — на сервер не уходит ничего', async () => {
    const { state, remote } = fakeServer();
    const likes = createSyncedSet(key, remote);
    state.online = false;
    await likes.set('anna', 'olga', true).catch(() => {});
    await likes.set('anna', 'olga', false).catch(() => {});

    state.online = true;
    await likes.flush('anna');
    expect(state.calls).toEqual([]);
    expect(await likes.list('anna')).toEqual([]);
  });

  test('снятая без сети отметка снимается на сервере позже', async () => {
    const { state, remote } = fakeServer(['olga']);
    const likes = createSyncedSet(key, remote);
    expect(await likes.list('anna')).toEqual(['olga']);

    state.online = false;
    await likes.set('anna', 'olga', false).catch(() => {});
    expect(await likes.list('anna')).toEqual([]);

    state.online = true;
    expect(await likes.list('anna')).toEqual([]);
    expect([...state.ids]).toEqual([]);
  });

  test('отказ сервера не застревает в очереди и не мешает остальным отметкам', async () => {
    const { state, remote } = fakeServer();
    state.rejected.add('hidden');
    const likes = createSyncedSet(key, remote);
    state.online = false;
    await likes.set('anna', 'hidden', true).catch(() => {});
    await likes.set('anna', 'olga', true).catch(() => {});

    state.online = true;
    await likes.flush('anna');
    expect(await likes.list('anna')).toEqual(['olga']);
    expect(state.calls).toEqual(['+hidden', '+olga']);
  });

  test('одновременные отметки не затирают друг друга, а у каждого пользователя своя очередь', async () => {
    const { state, remote } = fakeServer();
    const likes = createSyncedSet(key, remote);
    state.online = false;
    await Promise.allSettled([
      likes.set('anna', 'olga', true),
      likes.set('anna', 'dmitry', true),
      likes.set('boris', 'elena', true),
    ]);

    expect((await likes.list('anna')).sort()).toEqual(['dmitry', 'olga']);
    expect(await likes.list('boris')).toEqual(['elena']);
  });
});
