export type DassScale = 'depression' | 'anxiety' | 'stress'

export type LevelTone = 'normal' | 'mild' | 'moderate' | 'severe' | 'extreme'

export type DassResult = {
  depression: number
  anxiety: number
  stress: number
  levels: Record<DassScale, { text: string; tone: LevelTone }>
}

const DEPRESSION_IDX = [2, 4, 9, 12, 15, 16, 20]
const ANXIETY_IDX = [1, 3, 6, 8, 14, 18, 19]
const STRESS_IDX = [0, 5, 7, 10, 11, 13, 17]

const LEVELS: Record<
  DassScale,
  { max: number; text: string; tone: LevelTone }[]
> = {
  depression: [
    { max: 9, text: 'Норма', tone: 'normal' },
    { max: 13, text: 'Легкая', tone: 'mild' },
    { max: 20, text: 'Умеренная', tone: 'moderate' },
    { max: 27, text: 'Тяжелая', tone: 'severe' },
    { max: Infinity, text: 'Крайне тяжелая', tone: 'extreme' },
  ],
  anxiety: [
    { max: 7, text: 'Норма', tone: 'normal' },
    { max: 9, text: 'Легкая', tone: 'mild' },
    { max: 14, text: 'Умеренная', tone: 'moderate' },
    { max: 19, text: 'Тяжелая', tone: 'severe' },
    { max: Infinity, text: 'Крайне тяжелая', tone: 'extreme' },
  ],
  stress: [
    { max: 14, text: 'Норма', tone: 'normal' },
    { max: 18, text: 'Легкая', tone: 'mild' },
    { max: 25, text: 'Умеренная', tone: 'moderate' },
    { max: 33, text: 'Тяжелая', tone: 'severe' },
    { max: Infinity, text: 'Крайне тяжелая', tone: 'extreme' },
  ],
}

function sumIndices(answers: (number | null)[], indices: number[]) {
  return indices.reduce((s, i) => s + (answers[i] ?? 0), 0) * 2
}

function getLevel(score: number, scale: DassScale) {
  const row = LEVELS[scale].find((l) => score <= l.max)!
  return { text: row.text, tone: row.tone }
}

export function scoreDass(answers: (number | null)[]): DassResult {
  const depression = sumIndices(answers, DEPRESSION_IDX)
  const anxiety = sumIndices(answers, ANXIETY_IDX)
  const stress = sumIndices(answers, STRESS_IDX)

  return {
    depression,
    anxiety,
    stress,
    levels: {
      depression: getLevel(depression, 'depression'),
      anxiety: getLevel(anxiety, 'anxiety'),
      stress: getLevel(stress, 'stress'),
    },
  }
}

export const levelToneClass: Record<LevelTone, string> = {
  normal: 'bg-emerald-100 text-emerald-800',
  mild: 'bg-amber-100 text-amber-800',
  moderate: 'bg-orange-100 text-orange-800',
  severe: 'bg-red-100 text-red-800',
  extreme: 'bg-red-200 text-red-900',
}
