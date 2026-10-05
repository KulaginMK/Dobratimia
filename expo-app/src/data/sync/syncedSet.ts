import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineError } from '@/data/repos/errors';

/** Серверная сторона набора: отметки «Нравится» специалистам, сердечки фразам. */
export type SetRemote = {
  list(userId: string): Promise<string[]>;
  add(userId: string, id: string): Promise<void>;
  remove(userId: string, id: string): Promise<void>;
};

export type SyncedSet = {
  /** Набор id с учётом ещё не отправленных изменений. Без сети — последний известный. */
  list(userId: string): Promise<string[]>;
  /**
   * Добавить или убрать id. Изменение сразу запоминается на устройстве. Если отправить не удалось,
   * промис отклоняется с OfflineError, а изменение остаётся в очереди и уйдёт при следующем flush.
   */
  set(userId: string, id: string, on: boolean): Promise<void>;
  /** Отправить накопленное. Отклоняется с OfflineError, если сети всё ещё нет. */
  flush(userId: string): Promise<void>;
};

type Change = { id: string; on: boolean };
type Stored = {
  /** Что было на сервере, когда мы видели его в последний раз. */
  known: string[];
  /** Изменения, которые ещё не дошли до сервера, по порядку. */
  pending: Change[];
};

const isIds = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((id) => typeof id === 'string');
const isChange = (value: unknown): value is Change => {
  const change = value as Partial<Change> | null;
  return !!change && typeof change.id === 'string' && typeof change.on === 'boolean';
};

function apply(known: string[], pending: Change[]): string[] {
  const ids = new Set(known);
  for (const change of pending) {
    if (change.on) ids.add(change.id);
    else ids.delete(change.id);
  }
  return [...ids];
}

/**
 * Набор отметок, который живёт на сервере, но не теряется без сети: изменения сначала
 * записываются на устройстве (ключ storageKey(userId)), потом уходят на сервер по порядку.
 */
export function createSyncedSet(storageKey: (userId: string) => string, remote: SetRemote): SyncedSet {
  // Действия одного пользователя идут строго друг за другом: иначе два одновременных изменения затрут друг друга.
  const chains = new Map<string, Promise<unknown>>();
  const serial = <T>(userId: string, task: () => Promise<T>): Promise<T> => {
    const next = (chains.get(userId) ?? Promise.resolve()).then(task, task);
    chains.set(
      userId,
      next.catch(() => {}),
    );
    return next;
  };

  const load = async (userId: string): Promise<Stored> => {
    try {
      const raw = await AsyncStorage.getItem(storageKey(userId));
      const parsed = (raw ? JSON.parse(raw) : null) as Partial<Stored> | null;
      return {
        known: isIds(parsed?.known) ? parsed.known : [],
        pending: Array.isArray(parsed?.pending) ? parsed.pending.filter(isChange) : [],
      };
    } catch {
      return { known: [], pending: [] };
    }
  };
  const save = (userId: string, stored: Stored) => AsyncStorage.setItem(storageKey(userId), JSON.stringify(stored));

  const send = async (userId: string): Promise<Stored> => {
    let stored = await load(userId);
    while (stored.pending.length > 0) {
      const [change, ...rest] = stored.pending;
      try {
        if (change.on) await remote.add(userId, change.id);
        else await remote.remove(userId, change.id);
        stored = { known: apply(stored.known, [change]), pending: rest };
      } catch (error) {
        // Сети нет — очередь ждёт. Сервер ответил отказом (карточку сняли с публикации) — повторять бессмысленно.
        if (error instanceof OfflineError) throw error;
        stored = { known: stored.known, pending: rest };
      }
      await save(userId, stored);
    }
    return stored;
  };

  return {
    list: (userId) =>
      serial(userId, async () => {
        try {
          const sent = await send(userId);
          const known = await remote.list(userId);
          await save(userId, { known, pending: sent.pending });
          return known;
        } catch (error) {
          if (!(error instanceof OfflineError)) throw error;
          const stored = await load(userId);
          return apply(stored.known, stored.pending);
        }
      }),

    set: (userId, id, on) =>
      serial(userId, async () => {
        const stored = await load(userId);
        const pending = stored.pending.filter((change) => change.id !== id);
        if (stored.known.includes(id) !== on) pending.push({ id, on });
        await save(userId, { known: stored.known, pending });
        await send(userId);
      }),

    flush: (userId) => serial(userId, () => send(userId).then(() => {})),
  };
}
