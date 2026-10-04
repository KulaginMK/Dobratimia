import type { BreathScheme } from '@/data/techniques';

export type BreathPhaseKind = 'inhale' | 'hold' | 'exhale';

/** Схемы дыхания по секундам (docs/07): 4-6 — вдох 4, выдох 6; 4-7-8 и 5-5-5 — с задержкой. */
export const BREATH_SCHEMES: Record<BreathScheme, { kind: BreathPhaseKind; seconds: number }[]> = {
  '4-6': [
    { kind: 'inhale', seconds: 4 },
    { kind: 'exhale', seconds: 6 },
  ],
  '4-7-8': [
    { kind: 'inhale', seconds: 4 },
    { kind: 'hold', seconds: 7 },
    { kind: 'exhale', seconds: 8 },
  ],
  '5-5-5': [
    { kind: 'inhale', seconds: 5 },
    { kind: 'hold', seconds: 5 },
    { kind: 'exhale', seconds: 5 },
  ],
};

export const BREATH_SCHEME_IDS = Object.keys(BREATH_SCHEMES) as BreathScheme[];
export const DEFAULT_SCHEME: BreathScheme = '4-7-8';
export const DEFAULT_CYCLES = 4;
const MAX_CYCLES = 60;

/** Круг сжат до 0,72 и растёт до 1 на вдохе. */
export const MIN_SCALE = 0.72;

/** Подписи фаз из макета Meditation. */
export const PHASE_TEXT: Record<BreathPhaseKind, { name: string; hint: string }> = {
  inhale: { name: 'Вдох', hint: 'круг растёт на вдохе' },
  hold: { name: 'Задержите дыхание', hint: 'круг стоит, пока вы не дышите' },
  exhale: { name: 'Выдох', hint: 'круг сжимается на выдохе' },
};

export function parseScheme(value: string | string[] | undefined): BreathScheme {
  return BREATH_SCHEME_IDS.find((id) => id === value) ?? DEFAULT_SCHEME;
}

export function parseCycles(value: string | string[] | undefined): number {
  const cycles = Number(value);
  return Number.isInteger(cycles) && cycles >= 1 && cycles <= MAX_CYCLES ? cycles : DEFAULT_CYCLES;
}

export function totalMs(scheme: BreathScheme, cycles: number): number {
  return BREATH_SCHEMES[scheme].reduce((sum, phase) => sum + phase.seconds, 0) * 1000 * cycles;
}

export type BreathPosition = {
  /** Все циклы пройдены. */
  done: boolean;
  /** Номер цикла с единицы. */
  cycle: number;
  phaseIndex: number;
  kind: BreathPhaseKind;
  /** Сколько секунд фазы осталось: «Вдох · 4» считает 4, 3, 2, 1. */
  secondsLeft: number;
  msLeft: number;
  /** Размер круга в этот момент: 0,72…1, меняется линейно по секундам фазы. */
  scale: number;
};

/** Где мы в практике через elapsedMs миллисекунд после начала. Время — единственный источник правды. */
export function breathPosition(elapsedMs: number, scheme: BreathScheme, cycles: number): BreathPosition {
  const phases = BREATH_SCHEMES[scheme];
  const cycleMs = phases.reduce((sum, phase) => sum + phase.seconds, 0) * 1000;
  if (elapsedMs >= cycleMs * cycles) {
    const last = phases.length - 1;
    return { done: true, cycle: cycles, phaseIndex: last, kind: phases[last].kind, secondsLeft: 0, msLeft: 0, scale: MIN_SCALE };
  }
  const inCycle = Math.max(0, elapsedMs) % cycleMs;
  let start = 0;
  let phaseIndex = 0;
  while (inCycle >= start + phases[phaseIndex].seconds * 1000) {
    start += phases[phaseIndex].seconds * 1000;
    phaseIndex += 1;
  }
  const phase = phases[phaseIndex];
  const phaseMs = phase.seconds * 1000;
  const msLeft = start + phaseMs - inCycle;
  const progress = 1 - msLeft / phaseMs;
  const scale =
    phase.kind === 'inhale'
      ? MIN_SCALE + (1 - MIN_SCALE) * progress
      : phase.kind === 'exhale'
        ? 1 - (1 - MIN_SCALE) * progress
        : 1;
  return {
    done: false,
    cycle: Math.floor(Math.max(0, elapsedMs) / cycleMs) + 1,
    phaseIndex,
    kind: phase.kind,
    secondsLeft: Math.ceil(msLeft / 1000),
    msLeft,
    scale,
  };
}

/** Размер круга в конце фазы — к нему идёт анимация. */
export function phaseEndScale(kind: BreathPhaseKind): number {
  return kind === 'exhale' ? MIN_SCALE : 1;
}
