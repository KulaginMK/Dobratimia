import { describe, expect, test } from '@jest/globals';
import { MIN_SCALE, breathPosition, parseCycles, parseScheme, totalMs } from './breath';

describe('дыхание по схеме 4-7-8', () => {
  test('фазы сменяются строго по секундам', () => {
    expect(breathPosition(0, '4-7-8', 4)).toMatchObject({ cycle: 1, kind: 'inhale', secondsLeft: 4, scale: MIN_SCALE });
    expect(breathPosition(3999, '4-7-8', 4)).toMatchObject({ kind: 'inhale', secondsLeft: 1 });
    expect(breathPosition(4000, '4-7-8', 4)).toMatchObject({ kind: 'hold', secondsLeft: 7, scale: 1 });
    expect(breathPosition(11_000, '4-7-8', 4)).toMatchObject({ kind: 'exhale', secondsLeft: 8, scale: 1 });
    // Второй цикл начинается через 19 секунд.
    expect(breathPosition(19_000, '4-7-8', 4)).toMatchObject({ cycle: 2, kind: 'inhale', secondsLeft: 4 });
  });

  test('после последнего цикла практика закончена, круг сжат', () => {
    expect(totalMs('4-7-8', 4)).toBe(76_000);
    expect(breathPosition(75_999, '4-7-8', 4).done).toBe(false);
    expect(breathPosition(76_000, '4-7-8', 4)).toMatchObject({ done: true, cycle: 4, scale: MIN_SCALE });
  });

  test('схема и число циклов из адреса: всё незнакомое заменяется обычным', () => {
    expect(parseScheme('5-5-5')).toBe('5-5-5');
    expect(parseScheme('9-9-9')).toBe('4-7-8');
    expect(parseCycles('6')).toBe(6);
    expect(parseCycles('0')).toBe(4);
    expect(parseCycles('1000')).toBe(4);
    expect(parseCycles(undefined)).toBe(4);
  });
});
