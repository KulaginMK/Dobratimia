import { describe, expect, test } from '@jest/globals';
import { MAX_LEVEL, calmLevel, keepWeek, summarize, toScreamDb, weekRecord } from './loudness';

describe('громкость КРИКа', () => {
  test('шкала: тишина — ноль, предел микрофона — 110, между ними растёт', () => {
    expect(toScreamDb(0)).toBe(0);
    expect(toScreamDb(0.0001)).toBe(0);
    expect(toScreamDb(1)).toBe(MAX_LEVEL);
    expect(toScreamDb(0.5)).toBeGreaterThan(toScreamDb(0.05));
  });

  test('итог: пик — самый громкий отсчёт, среднее — без тишины до и после крика', () => {
    expect(summarize([5, 10, 90, 100, 8], 4400)).toEqual({ peak: 100, avg: 95, durationSec: 4 });
    // Шёпот: ни одного громкого отсчёта — среднее по всем.
    expect(summarize([10, 20, 30], 300)).toEqual({ peak: 30, avg: 20, durationSec: 1 });
  });

  test('число «Сейчас»: среднее за законченные 0,3 с и стоит, пока не закончатся следующие', () => {
    expect(calmLevel([])).toBe(0);
    expect(calmLevel([60, 80])).toBe(70);
    const first = [70, 80, 90];
    expect(calmLevel(first)).toBe(80);
    // Новые отсчёты внутри следующего окна число не трогают.
    expect(calmLevel([...first, 20, 110])).toBe(80);
    expect(calmLevel([...first, 20, 20, 20])).toBe(20);
  });

  test('«рекорд недели» — за сегодня и шесть дней до него', () => {
    const record = (date: string, peak: number) => ({ date, peak, avg: peak, durationSec: 3 });
    const records = [record('2026-10-02', 105), record('2026-10-03', 80), record('2026-10-09', 90)];
    expect(keepWeek(records, '2026-10-09').map((item) => item.date)).toEqual(['2026-10-03', '2026-10-09']);
    expect(weekRecord(records, '2026-10-09')).toBe(90);
  });
});
