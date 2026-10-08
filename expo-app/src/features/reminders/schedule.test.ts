import { describe, expect, jest, test } from '@jest/globals';
import { BREAK_MS, FOCUS_MS, INITIAL_POMODORO } from '@/features/meditation/pomodoro';
import { toDateKey } from '@/lib/dates';
import { dassReminder, diaryAnchor, diaryPlan, pomodoroBreaks } from './schedule';
import { DIARY_DAILY, DIARY_MISSED } from './texts';

// Расписание берёт «14 дней» из истории тестов, а та читает хранилище устройства.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const noon = new Date(2026, 9, 8, 12, 0);

describe('diaryPlan', () => {
  test('после отметки сегодня: завтра обычное напоминание, дальше — по тексту на каждый пропущенный день', () => {
    const plan = diaryPlan('2026-10-08', noon);
    expect(plan.map((n) => toDateKey(n.at))).toEqual([
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
    ]);
    expect(plan.every((n) => n.at.getHours() === 21 && n.at.getMinutes() === 0)).toBe(true);
    expect(DIARY_DAILY).toContainEqual({ title: plan[0].title, body: plan[0].body });
    expect(plan.slice(1).map((n) => n.title)).toEqual(DIARY_MISSED.map((text) => text.title));
  });

  test('сегодня не отмечено: напоминание придёт сегодня вечером, а после 21:00 — уже нет', () => {
    expect(toDateKey(diaryPlan('2026-10-07', noon)[0].at)).toBe('2026-10-08');
    expect(toDateKey(diaryPlan('2026-10-07', new Date(2026, 9, 8, 21, 30))[0].at)).toBe('2026-10-09');
  });

  test('обычное напоминание каждый день другое', () => {
    const titles = Array.from({ length: DIARY_DAILY.length }, (_, i) => diaryPlan(`2026-10-${10 + i}`, noon)[0].title);
    expect(new Set(titles).size).toBe(DIARY_DAILY.length);
  });

  test('после прощального напоминания — тишина', () => {
    expect(diaryPlan('2026-09-01', noon)).toEqual([]);
  });
});

test('diaryAnchor: старая отметка не считается — пропуски идут со дня включения', () => {
  expect(diaryAnchor(null, '2026-10-08')).toBe('2026-10-07');
  expect(diaryAnchor('2026-09-01', '2026-10-08')).toBe('2026-10-07');
  expect(diaryAnchor('2026-10-08', '2026-10-08')).toBe('2026-10-08');
});

test('dassReminder: накануне следующего теста в 19:00; прошедшее не ставится', () => {
  const reminder = dassReminder('2026-10-08', noon);
  expect(reminder && toDateKey(reminder.at)).toBe('2026-10-21');
  expect(reminder?.at.getHours()).toBe(19);
  expect(dassReminder('2026-09-01', noon)).toBeNull();
});

describe('pomodoroBreaks', () => {
  const start = noon.getTime();

  test('таймер стоит — уведомлений нет', () => {
    expect(pomodoroBreaks(INITIAL_POMODORO)).toEqual([]);
  });

  test('идёт второй фокус: уведомления на конец второго, третьего и четвёртого', () => {
    const breaks = pomodoroBreaks({ mode: 'focus', tomato: 2, endsAt: start + 60_000, remainingMs: FOCUS_MS });
    expect(breaks.map((n) => n.id)).toEqual(['pomodoro-2', 'pomodoro-3', 'pomodoro-4']);
    expect(breaks.map((n) => n.at.getTime() - start)).toEqual([
      60_000,
      60_000 + BREAK_MS + FOCUS_MS,
      60_000 + 2 * (BREAK_MS + FOCUS_MS),
    ]);
  });

  test('идёт последний перерыв: круг закончится, уведомлять не о чем', () => {
    expect(pomodoroBreaks({ mode: 'break', tomato: 4, endsAt: start + 60_000, remainingMs: BREAK_MS })).toEqual([]);
  });
});
