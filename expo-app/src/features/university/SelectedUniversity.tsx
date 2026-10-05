import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadUniversityId, saveUniversityId } from '@/data/local/university';
import type { UniversityId } from '@/data/repos';

type SelectedUniversityValue = {
  /** Выбранный вуз; null — ещё не выбран. */
  universityId: UniversityId | null;
  /** false, пока сохранённый выбор читается с устройства. */
  ready: boolean;
  select: (id: UniversityId) => void;
  /** Забыть выбор в памяти: «Удалить мои данные» уже стёрло его с устройства. */
  reset: () => void;
};

const SelectedUniversityContext = createContext<SelectedUniversityValue>({
  universityId: null,
  ready: false,
  select: () => {},
  reset: () => {},
});

/**
 * Выбранный вуз хранится на устройстве: SOS вуза работает без входа и без сети.
 * На этапе 12 выбор будет ещё и уходить в профиль на сервере.
 */
export function SelectedUniversityProvider({ children }: { children: React.ReactNode }) {
  const [universityId, setUniversityId] = useState<UniversityId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadUniversityId().then((stored) => {
      if (!alive) return;
      setUniversityId(stored);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const select = (id: UniversityId) => {
    setUniversityId(id);
    // Не сохранилось — выбор всё равно действует до перезапуска.
    saveUniversityId(id).catch(() => {});
  };

  return (
    <SelectedUniversityContext.Provider value={{ universityId, ready, select, reset: () => setUniversityId(null) }}>
      {children}
    </SelectedUniversityContext.Provider>
  );
}

export function useSelectedUniversity(): SelectedUniversityValue {
  return useContext(SelectedUniversityContext);
}
