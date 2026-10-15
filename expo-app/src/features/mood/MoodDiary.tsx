import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { MOOD_NOTE_MAX, loadMoodEntries, saveMoodEntries, type MoodEntry, type MoodLevel } from '@/data/local/mood';
import { toDateKey, toTimeLabel } from '@/lib/dates';

// Раз в минуту проверяем, не наступил ли новый день: после полуночи отметка за «сегодня» начинается заново.
const TODAY_CHECK_MS = 60_000;

export type MarkResult = { date: string; previous: MoodEntry | null };

type MoodDiaryValue = {
  /** Все отметки, от старых к новым. */
  entries: MoodEntry[];
  /** false, пока дневник читается с устройства. */
  ready: boolean;
  /** Сегодняшний день: «2026-09-24». */
  todayKey: string;
  /** Отметка за сегодня; null — ещё не отмечено. */
  today: MoodEntry | null;
  /**
   * Отметить настроение за сегодня. В день одна отметка: повторный тап по другому лицу её меняет.
   * Возвращает день и прежнюю отметку (null, если её не было) — для «Отменить»; null — ничего не изменилось.
   */
  mark: (level: MoodLevel) => MarkResult | null;
  /** «Отменить»: вернуть дню прежнюю отметку или убрать отметку совсем. */
  restore: (date: string, previous: MoodEntry | null) => void;
  /** Заметка «Что повлияло?» к отметке за день. Пустая строка убирает заметку. */
  setNote: (date: string, note: string) => void;
  /** Заменить дневник целиком — после загрузки из файла (features/backup). */
  setAll: (entries: MoodEntry[]) => void;
};

const MoodDiaryContext = createContext<MoodDiaryValue>({
  entries: [],
  ready: false,
  todayKey: '',
  today: null,
  mark: () => null,
  restore: () => {},
  setNote: () => {},
  setAll: () => {},
});

function useTodayKey(): string {
  const [key, setKey] = useState(() => toDateKey(new Date()));
  useEffect(() => {
    const refresh = () => setKey(toDateKey(new Date()));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    const timer = setInterval(refresh, TODAY_CHECK_MS);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, []);
  return key;
}

const byDate = (a: MoodEntry, b: MoodEntry) => a.date.localeCompare(b.date);

/** Дневник настроения пользователя. Живёт только на устройстве и на сервер не уходит (docs/08). */
export function MoodDiaryProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [ready, setReady] = useState(false);
  const todayKey = useTodayKey();

  useEffect(() => {
    let alive = true;
    loadMoodEntries(userId).then((stored) => {
      if (!alive) return;
      setEntries(stored);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  const commit = (next: MoodEntry[]) => {
    setEntries(next);
    // Не сохранилось — отметка всё равно видна до перезапуска.
    saveMoodEntries(userId, next).catch(() => {});
  };

  const mark = (level: MoodLevel) => {
    const now = new Date();
    const date = toDateKey(now);
    const previous = entries.find((entry) => entry.date === date) ?? null;
    if (previous?.level === level) return null;
    const entry: MoodEntry = { date, level, time: toTimeLabel(now), note: previous?.note };
    commit([...entries.filter((item) => item.date !== date), entry].sort(byDate));
    return { date, previous };
  };

  const restore = (date: string, previous: MoodEntry | null) => {
    const others = entries.filter((entry) => entry.date !== date);
    commit(previous ? [...others, previous].sort(byDate) : others);
  };

  const setNote = (date: string, note: string) => {
    const text = note.trim().slice(0, MOOD_NOTE_MAX);
    commit(entries.map((entry) => (entry.date === date ? { ...entry, note: text || undefined } : entry)));
  };

  const today = entries.find((entry) => entry.date === todayKey) ?? null;

  return (
    <MoodDiaryContext.Provider value={{ entries, ready, todayKey, today, mark, restore, setNote, setAll: commit }}>
      {children}
    </MoodDiaryContext.Provider>
  );
}

export function useMoodDiary(): MoodDiaryValue {
  return useContext(MoodDiaryContext);
}
