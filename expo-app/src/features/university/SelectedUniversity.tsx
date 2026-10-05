import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadDirectory, loadUniversityId, saveDirectory, saveUniversityId } from '@/data/local/university';
import { universitiesRepo, type University, type UniversityId } from '@/data/repos';

type SelectedUniversityValue = {
  /** Выбранный вуз; null — ещё не выбран. */
  universityId: UniversityId | null;
  /** false, пока сохранённый выбор читается с устройства. */
  ready: boolean;
  /** Справочник вузов: зашитый в приложение, поверх него — последнее, что пришло с сервера. */
  universities: University[];
  byId: (id: string | null) => University | null;
  select: (id: UniversityId) => void;
  /** Забыть выбор в памяти: «Удалить мои данные» уже стёрло его с устройства. */
  reset: () => void;
};

const SelectedUniversityContext = createContext<SelectedUniversityValue>({
  universityId: null,
  ready: false,
  universities: [],
  byId: () => null,
  select: () => {},
  reset: () => {},
});

/**
 * Набор и порядок вузов задаёт приложение, а содержимое — сервер: так администратор правит контакты служб
 * без выпуска новой версии, а вуз, которого сервер почему-то не прислал, из списка не пропадает.
 */
function merge(received: University[]): University[] {
  return universitiesRepo.all().map((bundled) => received.find((item) => item.id === bundled.id) ?? bundled);
}

/**
 * Выбранный вуз и справочник вузов. Оба хранятся на устройстве: SOS вуза работает без входа и без сети.
 * Выбор уходит ещё и в профиль на сервере (SessionProvider), справочник обновляется с сервера при запуске.
 */
export function SelectedUniversityProvider({ children }: { children: React.ReactNode }) {
  const [universityId, setUniversityId] = useState<UniversityId | null>(null);
  const [ready, setReady] = useState(false);
  const [universities, setUniversities] = useState<University[]>(() => universitiesRepo.all());

  useEffect(() => {
    let alive = true;
    loadUniversityId().then((stored) => {
      if (!alive) return;
      setUniversityId(stored);
      setReady(true);
    });
    (async () => {
      const cached = await loadDirectory();
      if (alive && cached) setUniversities(merge(cached));
      // Нет сети или сервера — остаётся то, что есть.
      const fresh = await universitiesRepo.fresh().catch(() => null);
      if (!alive || !fresh || fresh.length === 0) return;
      setUniversities(merge(fresh));
      saveDirectory(fresh).catch(() => {});
    })();
    return () => {
      alive = false;
    };
  }, []);

  const select = (id: UniversityId) => {
    setUniversityId(id);
    // Не сохранилось — выбор всё равно действует до перезапуска.
    saveUniversityId(id).catch(() => {});
  };

  const value: SelectedUniversityValue = {
    universityId,
    ready,
    universities,
    byId: (id) => universities.find((university) => university.id === id) ?? null,
    select,
    reset: () => setUniversityId(null),
  };

  return <SelectedUniversityContext.Provider value={value}>{children}</SelectedUniversityContext.Provider>;
}

export function useSelectedUniversity(): SelectedUniversityValue {
  return useContext(SelectedUniversityContext);
}
