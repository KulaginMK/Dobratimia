import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadDassEntries, saveDassEntries, type DassEntry } from '@/data/local/dass';
import { toDateKey } from '@/lib/dates';
import { scoreDass } from './score';

/** На графике — последние тесты, не больше десяти (docs/07). */
export const HISTORY_MAX = 10;
/** Следующий тест — через 14 дней после последнего. */
export const NEXT_TEST_DAYS = 14;

type DassHistoryValue = {
  /** Все пройденные тесты, от старых к новым. */
  entries: DassEntry[];
  /** false, пока история читается с устройства. */
  ready: boolean;
  /** Сохранить законченный тест: 21 ответ по порядку пунктов. */
  add: (answers: number[]) => void;
  /** Заменить историю целиком — после загрузки из файла (features/backup). */
  setAll: (entries: DassEntry[]) => void;
};

const DassHistoryContext = createContext<DassHistoryValue>({ entries: [], ready: false, add: () => {}, setAll: () => {} });

/**
 * История тестов DASS-21 пользователя. Живёт только на устройстве и на сервер не уходит (docs/08).
 * userId null — человек не вошёл: результат виден до закрытия приложения и не сохраняется.
 */
export function DassHistoryProvider({ userId, children }: { userId: string | null; children: React.ReactNode }) {
  const [entries, setEntries] = useState<DassEntry[]>([]);
  const [ready, setReady] = useState(!userId);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    loadDassEntries(userId).then((stored) => {
      if (!alive) return;
      setEntries(stored);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  const commit = (next: DassEntry[]) => {
    setEntries(next);
    // Не сохранилось — результат всё равно виден до перезапуска.
    if (userId) saveDassEntries(userId, next).catch(() => {});
  };
  const add = (answers: number[]) => commit([...entries, { date: toDateKey(new Date()), answers, ...scoreDass(answers) }]);

  return <DassHistoryContext.Provider value={{ entries, ready, add, setAll: commit }}>{children}</DassHistoryContext.Provider>;
}

export function useDassHistory(): DassHistoryValue {
  return useContext(DassHistoryContext);
}
