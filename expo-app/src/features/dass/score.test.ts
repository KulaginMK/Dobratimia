import { describe, expect, test } from '@jest/globals';
import { DASS_COUNT } from '@/data/dass';
import {
  DASS_MAX,
  SCALE_ITEMS,
  dassAdvice,
  dassLevels,
  dassTips,
  isComplete,
  scaleLevel,
  scalesFrom,
  scoreDass,
  worstLevel,
  type DassScale,
} from './score';

const blank = () => Array<number>(DASS_COUNT).fill(0);

/** Ответы, в которых пункты одной шкалы получили заданные баллы, остальные — 0. */
function answersFor(scale: DassScale, points: number[]): number[] {
  const answers = blank();
  SCALE_ITEMS[scale].forEach((item, i) => {
    answers[item - 1] = points[i] ?? 0;
  });
  return answers;
}

describe('ключ DASS-21', () => {
  test('в каждой шкале семь пунктов, каждый пункт входит ровно в одну шкалу', () => {
    const all = [...SCALE_ITEMS.stress, ...SCALE_ITEMS.anxiety, ...SCALE_ITEMS.depression];
    expect(SCALE_ITEMS.stress).toHaveLength(7);
    expect(SCALE_ITEMS.anxiety).toHaveLength(7);
    expect(SCALE_ITEMS.depression).toHaveLength(7);
    expect([...all].sort((a, b) => a - b)).toEqual(Array.from({ length: DASS_COUNT }, (_, i) => i + 1));
  });

  test('пункты шкал — как в docs/07', () => {
    expect(SCALE_ITEMS.stress).toEqual([1, 6, 8, 11, 12, 14, 18]);
    expect(SCALE_ITEMS.anxiety).toEqual([2, 4, 7, 9, 15, 19, 20]);
    expect(SCALE_ITEMS.depression).toEqual([3, 5, 10, 13, 16, 17, 21]);
  });
});

describe('scoreDass', () => {
  test('все ответы 0 — все шкалы 0', () => {
    expect(scoreDass(blank())).toEqual({ stress: 0, anxiety: 0, depression: 0 });
  });

  test('все ответы 3 — все шкалы 42', () => {
    expect(scoreDass(Array<number>(DASS_COUNT).fill(3))).toEqual({
      stress: DASS_MAX,
      anxiety: DASS_MAX,
      depression: DASS_MAX,
    });
  });

  test('балл шкалы — сумма её пунктов × 2, чужие пункты не влияют', () => {
    expect(scoreDass(answersFor('stress', [3, 2, 1, 0, 3, 2, 1]))).toEqual({ stress: 24, anxiety: 0, depression: 0 });
    expect(scoreDass(answersFor('anxiety', [1, 1, 1, 1, 1, 1, 1]))).toEqual({ stress: 0, anxiety: 14, depression: 0 });
    expect(scoreDass(answersFor('depression', [3, 3, 3, 3, 3, 3, 3]))).toEqual({ stress: 0, anxiety: 0, depression: 42 });
  });

  test('пункт 2 относится к тревоге, пункт 1 — к стрессу, пункт 3 — к депрессии', () => {
    const answers = blank();
    answers[0] = 1;
    answers[1] = 2;
    answers[2] = 3;
    expect(scoreDass(answers)).toEqual({ stress: 2, anxiety: 4, depression: 6 });
  });
});

describe('isComplete', () => {
  test('21 ответ от 0 до 3 — тест пройден', () => {
    expect(isComplete(blank())).toBe(true);
  });

  test('пропуск, лишний ответ или балл вне 0…3 — нет', () => {
    const skipped: (number | null)[] = blank();
    skipped[20] = null;
    expect(isComplete(skipped)).toBe(false);
    expect(isComplete(Array<number>(20).fill(0))).toBe(false);
    expect(isComplete(Array<number>(22).fill(0))).toBe(false);
    const wrong = blank();
    wrong[4] = 4;
    expect(isComplete(wrong)).toBe(false);
  });
});

describe('scaleLevel: границы уровней из docs/07', () => {
  // [балл, уровень] — последний балл уровня и первый балл следующего.
  const BOUNDS: Record<DassScale, [number, string][]> = {
    depression: [
      [0, 'normal'],
      [9, 'normal'],
      [10, 'mild'],
      [13, 'mild'],
      [14, 'moderate'],
      [20, 'moderate'],
      [21, 'high'],
      [27, 'high'],
      [28, 'extreme'],
      [42, 'extreme'],
    ],
    anxiety: [
      [0, 'normal'],
      [7, 'normal'],
      [8, 'mild'],
      [9, 'mild'],
      [10, 'moderate'],
      [14, 'moderate'],
      [15, 'high'],
      [19, 'high'],
      [20, 'extreme'],
      [42, 'extreme'],
    ],
    stress: [
      [0, 'normal'],
      [14, 'normal'],
      [15, 'mild'],
      [18, 'mild'],
      [19, 'moderate'],
      [25, 'moderate'],
      [26, 'high'],
      [33, 'high'],
      [34, 'extreme'],
      [42, 'extreme'],
    ],
  };

  for (const scale of Object.keys(BOUNDS) as DassScale[]) {
    test.each(BOUNDS[scale])(`${scale}: %i → %s`, (score, level) => {
      expect(scaleLevel(scale, score)).toBe(level);
    });
  }

  test('макет DassResult: стресс 28 и тревога 18 — «Высокий», депрессия 12 — «Лёгкий»', () => {
    expect(dassLevels({ stress: 28, anxiety: 18, depression: 12 })).toEqual({
      stress: 'high',
      anxiety: 'high',
      depression: 'mild',
    });
  });
});

describe('что показать на экране результата', () => {
  const normal = { stress: 'normal', anxiety: 'normal', depression: 'normal' } as const;

  test('самый высокий уровень из трёх шкал', () => {
    expect(worstLevel(normal)).toBe('normal');
    expect(worstLevel({ ...normal, anxiety: 'moderate' })).toBe('moderate');
    expect(worstLevel({ stress: 'mild', anxiety: 'high', depression: 'extreme' })).toBe('extreme');
  });

  test('карточка «поговорить со специалистом» — при «Высоком» и «Крайне высоком»', () => {
    expect(dassAdvice({ ...normal, stress: 'high' })).toBe('talk');
    expect(dassAdvice({ ...normal, depression: 'extreme' })).toBe('talk');
  });

  test('мягкая карточка — когда самый высокий уровень «Умеренный»', () => {
    expect(dassAdvice({ ...normal, anxiety: 'moderate' })).toBe('gentle');
    expect(dassAdvice({ stress: 'mild', anxiety: 'moderate', depression: 'normal' })).toBe('gentle');
  });

  test('без карточки — при «Норме» и «Лёгком»', () => {
    expect(dassAdvice(normal)).toBe('none');
    expect(dassAdvice({ ...normal, stress: 'mild' })).toBe('none');
  });

  test('шкалы с высоким уровнем: сначала выше уровень, при равенстве — тревога, стресс, депрессия', () => {
    expect(scalesFrom({ stress: 'high', anxiety: 'high', depression: 'mild' }, 'high')).toEqual(['anxiety', 'stress']);
    expect(scalesFrom({ stress: 'extreme', anxiety: 'high', depression: 'high' }, 'high')).toEqual([
      'stress',
      'anxiety',
      'depression',
    ]);
    expect(scalesFrom(normal, 'high')).toEqual([]);
  });

  test('советы: все шкалы в норме — «Дыхание 4-7-8» и Pomodoro', () => {
    expect(dassTips(normal)).toEqual(['breath-4-7-8', 'pomodoro']);
  });

  test('советы: по технике на каждую шкалу от «Лёгкого», как на макете DassResult', () => {
    expect(dassTips({ stress: 'high', anxiety: 'high', depression: 'mild' })).toEqual([
      'breath-4-7-8',
      'progressive-relaxation',
      'thought-diary',
    ]);
  });

  test('советы: порядок — по уровню', () => {
    expect(dassTips({ stress: 'mild', anxiety: 'normal', depression: 'high' })).toEqual([
      'thought-diary',
      'progressive-relaxation',
    ]);
    expect(dassTips({ ...normal, stress: 'mild' })).toEqual(['progressive-relaxation']);
  });
});
