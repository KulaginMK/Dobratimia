import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, Platform } from 'react-native';
import { loadPomodoro, savePomodoro } from '@/data/local/pomodoro';
import {
  INITIAL_POMODORO,
  catchUp,
  durationOf,
  pause,
  remainingMs,
  selectMode,
  skip,
  start,
  type PomodoroMode,
  type PomodoroState,
} from './pomodoro';

const TICK_MS = 500;

/** Как называется фаза — на чипах и в объявлении скринридеру. */
export const MODE_LABEL: Record<PomodoroMode, string> = {
  focus: 'Фокус · 25 мин',
  break: 'Перерыв · 5 мин',
};

/**
 * Таймер Pomodoro. Состояние хранится на устройстве, время считается от endsAt:
 * таймер идёт, пока приложение свёрнуто или экран заблокирован, и догоняет время при возвращении.
 */
export function usePomodoro() {
  const [state, setState] = useState<PomodoroState>(INITIAL_POMODORO);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    loadPomodoro().then((stored) => {
      if (!alive) return;
      const at = Date.now();
      setNow(at);
      setState(catchUp(stored, at));
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (state.endsAt === null) return;
    const tick = () => {
      const at = Date.now();
      const caught = catchUp(state, at);
      if (caught !== state) {
        setState(caught);
        savePomodoro(caught).catch(() => {});
        // Фаза закончилась, пока экран открыт: говорим об этом скринридеру и вибрацией.
        AccessibilityInfo.announceForAccessibility(MODE_LABEL[caught.mode]);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
      }
      setNow(at);
    };
    const timer = setInterval(tick, TICK_MS);
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') tick();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [state]);

  const commit = (next: PomodoroState) => {
    setNow(Date.now());
    setState(next);
    savePomodoro(next).catch(() => {});
  };

  const duration = durationOf(state.mode);
  const remaining = Math.min(duration, remainingMs(state, now));
  const running = state.endsAt !== null;

  return {
    ready,
    state,
    running,
    /** Таймер ещё не запускали в этой фазе: кнопка «Начать», а не «Продолжить». */
    untouched: !running && remaining === duration,
    remaining,
    /** Доля оставшегося времени — для кольца. */
    remainingShare: remaining / duration,
    toggle: () => commit(running ? pause(state, Date.now()) : start(state, Date.now())),
    skip: () => commit(skip(state, Date.now())),
    select: (mode: PomodoroMode) => commit(selectMode(state, mode, Date.now())),
  };
}
