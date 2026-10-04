// Pomodoro: фокус 25 минут, перерыв 5 минут, 4 «помидора» (docs/07).
export const FOCUS_MS = 25 * 60_000;
export const BREAK_MS = 5 * 60_000;
export const TOMATOES = 4;

export type PomodoroMode = 'focus' | 'break';

/**
 * Состояние таймера. Время считается от сохранённого endsAt, а не тиками:
 * таймер переживает сворачивание приложения и блокировку экрана.
 */
export type PomodoroState = {
  mode: PomodoroMode;
  /** Номер текущего «помидора» с единицы. */
  tomato: number;
  /** Когда закончится текущая фаза, мс от эпохи; null — таймер стоит. */
  endsAt: number | null;
  /** Сколько осталось, когда таймер стоит. */
  remainingMs: number;
};

export const INITIAL_POMODORO: PomodoroState = { mode: 'focus', tomato: 1, endsAt: null, remainingMs: FOCUS_MS };

export function durationOf(mode: PomodoroMode): number {
  return mode === 'focus' ? FOCUS_MS : BREAK_MS;
}

export function remainingMs(state: PomodoroState, now: number): number {
  return state.endsAt === null ? state.remainingMs : Math.max(0, state.endsAt - now);
}

/**
 * Следующая фаза: после фокуса — перерыв, после перерыва — следующий «помидор».
 * startAt — когда фаза начинается, если таймер идёт; null — следующая фаза ждёт запуска.
 * После перерыва четвёртого «помидора» круг закончен: таймер возвращается в начало и стоит.
 */
export function nextPhase(state: PomodoroState, startAt: number | null): PomodoroState {
  if (state.mode === 'break' && state.tomato >= TOMATOES) return INITIAL_POMODORO;
  const mode: PomodoroMode = state.mode === 'focus' ? 'break' : 'focus';
  const tomato = state.mode === 'focus' ? state.tomato : state.tomato + 1;
  const duration = durationOf(mode);
  return { mode, tomato, endsAt: startAt === null ? null : startAt + duration, remainingMs: duration };
}

/** Догоняет таймер до момента now: фазы, закончившиеся, пока приложение было свёрнуто, сменяются одна за другой. */
export function catchUp(state: PomodoroState, now: number): PomodoroState {
  let current = state;
  while (current.endsAt !== null && current.endsAt <= now) {
    current = nextPhase(current, current.endsAt);
  }
  return current;
}

export function start(state: PomodoroState, now: number): PomodoroState {
  return state.endsAt === null ? { ...state, endsAt: now + state.remainingMs } : state;
}

export function pause(state: PomodoroState, now: number): PomodoroState {
  return state.endsAt === null ? state : { ...state, endsAt: null, remainingMs: remainingMs(state, now) };
}

/** «Пропустить»: сразу к следующей фазе. Идущий таймер продолжает идти, стоящий — стоит. */
export function skip(state: PomodoroState, now: number): PomodoroState {
  return nextPhase(state, state.endsAt === null ? null : now);
}

/** Выбор «Фокус» или «Перерыв» вручную: фаза начинается заново, «помидор» тот же. */
export function selectMode(state: PomodoroState, mode: PomodoroMode, now: number): PomodoroState {
  if (state.mode === mode) return state;
  const duration = durationOf(mode);
  return { mode, tomato: state.tomato, endsAt: state.endsAt === null ? null : now + duration, remainingMs: duration };
}

/** «16:05». */
export function clock(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
