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
};

const DassHistoryContext = createContext<DassHistoryValue>({ entries: [], ready: false, add: () => {} });

/** История тестов DASS-21 пользователя. Живёт только на устройстве и на сервер не уходит (docs/08). */
export function DassHistoryProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [entries, setEntries] = useState<DassEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
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

  const add = (answers: number[]) => {
    const next = [...entries, { date: toDateKey(new Date()), answers, ...scoreDass(answers) }];
    setEntries(next);
    // Не сохранилось — результат всё равно виден до перезапуска.
    saveDassEntries(userId, next).catch(() => {});
  };

  return <DassHistoryContext.Provider value={{ entries, ready, add }}>{children}</DassHistoryContext.Provider>;
}

export function useDassHistory(): DassHistoryValue {
  return useContext(DassHistoryContext);
}
