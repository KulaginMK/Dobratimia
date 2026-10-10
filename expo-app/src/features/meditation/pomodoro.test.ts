import { describe, expect, test } from '@jest/globals';
import { BREAK_MS, FOCUS_MS, INITIAL_POMODORO, TOMATOES, catchUp, clock, pause, remainingMs, skip, start } from './pomodoro';

const T0 = 1_000_000;

describe('таймер Pomodoro', () => {
  test('пауза запоминает остаток, «Продолжить» досчитывает его', () => {
    const running = start(INITIAL_POMODORO, T0);
    const paused = pause(running, T0 + 60_000);
    expect(paused.endsAt).toBeNull();
    expect(paused.remainingMs).toBe(FOCUS_MS - 60_000);
    const resumed = start(paused, T0 + 600_000);
    expect(remainingMs(resumed, T0 + 600_000)).toBe(FOCUS_MS - 60_000);
  });

  test('пока приложение было свёрнуто, фазы сменяются сами', () => {
    const running = start(INITIAL_POMODORO, T0);
    // Фокус и перерыв прошли целиком, второй фокус идёт минуту.
    const later = catchUp(running, T0 + FOCUS_MS + BREAK_MS + 60_000);
    expect(later).toMatchObject({ mode: 'focus', tomato: 2 });
    expect(remainingMs(later, T0 + FOCUS_MS + BREAK_MS + 60_000)).toBe(FOCUS_MS - 60_000);
    // Таймер, который не успел закончить фазу, не меняется.
    expect(catchUp(running, T0 + 1000)).toBe(running);
  });

  test('после перерыва четвёртого «помидора» круг закончен: таймер в начале и стоит', () => {
    const running = start(INITIAL_POMODORO, T0);
    expect(catchUp(running, T0 + TOMATOES * (FOCUS_MS + BREAK_MS))).toBe(INITIAL_POMODORO);
  });

  test('«Пропустить»: идущий таймер идёт дальше, стоящий — стоит', () => {
    const skipped = skip(start(INITIAL_POMODORO, T0), T0 + 5000);
    expect(skipped).toMatchObject({ mode: 'break', tomato: 1, endsAt: T0 + 5000 + BREAK_MS });
    expect(skip(INITIAL_POMODORO, T0)).toMatchObject({ mode: 'break', endsAt: null, remainingMs: BREAK_MS });
  });

  test('время на циферблате округляется вверх: 16:05, а в конце — 00:00', () => {
    expect(clock(16 * 60_000 + 4_200)).toBe('16:05');
    expect(clock(0)).toBe('00:00');
  });
});
