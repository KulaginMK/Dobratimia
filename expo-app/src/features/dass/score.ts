import type { ScaleLevel } from '@/components/blocks/ScaleBar';

export type DassScale = 'stress' | 'anxiety' | 'depression';

export type DassScores = Record<DassScale, number>;
export type DassLevels = Record<DassScale, ScaleLevel>;

/** Наибольший балл шкалы: 7 пунктов × 3 балла × 2. */
export const DASS_MAX = 42;

/**
 * Номера пунктов (с 1) по шкалам — стандартный ключ DASS-21 (docs/07).
 * Считать можно только при стандартном порядке утверждений.
 */
export const SCALE_ITEMS: Record<DassScale, number[]> = {
  stress: [1, 6, 8, 11, 12, 14, 18],
  anxiety: [2, 4, 7, 9, 15, 19, 20],
  depression: [3, 5, 10, 13, 16, 17, 21],
};

/** От какого балла начинается уровень (docs/07). Норма — всё, что ниже «Лёгкого». */
const LEVEL_FROM: Record<DassScale, Record<Exclude<ScaleLevel, 'normal'>, number>> = {
  depression: { mild: 10, moderate: 14, high: 21, extreme: 28 },
  anxiety: { mild: 8, moderate: 10, high: 15, extreme: 20 },
  stress: { mild: 15, moderate: 19, high: 26, extreme: 34 },
};

const LEVELS: ScaleLevel[] = ['normal', 'mild', 'moderate', 'high', 'extreme'];

// При равных уровнях шкалы идут в этом порядке (docs/07).
const TIE_ORDER: DassScale[] = ['anxiety', 'stress', 'depression'];

/** Техника для шкалы с уровнем «Лёгкий» и выше. Сопоставление утверждает психолог (docs/07, [решить]). */
const TIP_FOR_SCALE: Record<DassScale, string> = {
  anxiety: 'breath-4-7-8',
  stress: 'progressive-relaxation',
  depression: 'thought-diary',
};
const TIPS_WHEN_NORMAL = ['breath-4-7-8', 'pomodoro'];

/** Все ли ответы даны: 21 балл от 0 до 3. */
export function isComplete(answers: (number | null)[]): answers is number[] {
  return (
    answers.length === SCALE_ITEMS.stress.length * 3 &&
    answers.every((answer) => answer !== null && Number.isInteger(answer) && answer >= 0 && answer <= 3)
  );
}

/** Баллы трёх шкал: сумма ответов по пунктам шкалы × 2 (0…42). Ответы — по порядку пунктов, первый — пункт 1. */
export function scoreDass(answers: number[]): DassScores {
  const sum = (items: number[]) => items.reduce((total, item) => total + answers[item - 1], 0) * 2;
  return {
    stress: sum(SCALE_ITEMS.stress),
    anxiety: sum(SCALE_ITEMS.anxiety),
    depression: sum(SCALE_ITEMS.depression),
  };
}

/** Уровень по баллу шкалы. Это ориентир, а не диагноз. */
export function scaleLevel(scale: DassScale, score: number): ScaleLevel {
  const from = LEVEL_FROM[scale];
  if (score >= from.extreme) return 'extreme';
  if (score >= from.high) return 'high';
  if (score >= from.moderate) return 'moderate';
  if (score >= from.mild) return 'mild';
  return 'normal';
}

export function dassLevels(scores: DassScores): DassLevels {
  return {
    stress: scaleLevel('stress', scores.stress),
    anxiety: scaleLevel('anxiety', scores.anxiety),
    depression: scaleLevel('depression', scores.depression),
  };
}

const rank = (level: ScaleLevel) => LEVELS.indexOf(level);

/** Самый высокий уровень из трёх шкал. */
export function worstLevel(levels: DassLevels): ScaleLevel {
  return LEVELS[Math.max(rank(levels.stress), rank(levels.anxiety), rank(levels.depression))];
}

/** Шкалы с уровнем не ниже заданного: сначала с более высоким уровнем, при равенстве — тревога, стресс, депрессия. */
export function scalesFrom(levels: DassLevels, from: ScaleLevel): DassScale[] {
  return TIE_ORDER.filter((scale) => rank(levels[scale]) >= rank(from)).sort(
    (a, b) => rank(levels[b]) - rank(levels[a]) || TIE_ORDER.indexOf(a) - TIE_ORDER.indexOf(b),
  );
}

/**
 * «Что может помочь сейчас»: по технике на каждую шкалу с уровнем «Лёгкий» и выше;
 * если все шкалы в норме — «Дыхание 4-7-8» и Pomodoro. Возвращает id техник.
 */
export function dassTips(levels: DassLevels): string[] {
  const raised = scalesFrom(levels, 'mild');
  return raised.length > 0 ? raised.map((scale) => TIP_FOR_SCALE[scale]) : TIPS_WHEN_NORMAL;
}

/**
 * Какую карточку показать над шкалами (docs/07):
 * talk — хотя бы одна шкала «Высокий» или «Крайне высокий»: «стоит поговорить со специалистом»;
 * gentle — самый высокий уровень «Умеренный»: мягкая карточка; none — карточки нет.
 */
export function dassAdvice(levels: DassLevels): 'talk' | 'gentle' | 'none' {
  const worst = rank(worstLevel(levels));
  if (worst >= rank('high')) return 'talk';
  return worst === rank('moderate') ? 'gentle' : 'none';
}
