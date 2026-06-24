import type { DassResult, LevelTone } from '@/lib/dass-scoring'

export type Recommendation = {
  id: string
  icon: string
  title: string
  description: string
  href: string
  priority?: 'sos'
}

const TONE_RANK: Record<LevelTone, number> = {
  normal: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
  extreme: 4,
}

function toneAtLeast(tone: LevelTone, min: LevelTone): boolean {
  return TONE_RANK[tone] >= TONE_RANK[min]
}

function needsSos(result: DassResult): boolean {
  return (['depression', 'anxiety', 'stress'] as const).some((s) =>
    toneAtLeast(result.levels[s].tone, 'severe'),
  )
}

export function getDassRecommendations(result: DassResult): Recommendation[] {
  const items: Recommendation[] = []
  const seen = new Set<string>()

  const add = (rec: Recommendation) => {
    if (seen.has(rec.id)) return
    seen.add(rec.id)
    items.push(rec)
  }

  if (needsSos(result)) {
    add({
      id: 'sos',
      icon: '🆘',
      title: 'Нужна поддержка',
      description: 'Телефон доверия — круглосуточно, анонимно',
      href: '/resources',
      priority: 'sos',
    })
  }

  if (toneAtLeast(result.levels.stress.tone, 'moderate')) {
    add({
      id: 'med-46',
      icon: '🧘',
      title: 'Дыхание 4-6',
      description: 'Успокаивает нервную систему при стрессе',
      href: '/meditation?mode=0',
    })
    add({
      id: 'anat-muscles',
      icon: '🧬',
      title: 'Мышцы и стресс',
      description: 'Как напряжение отражается на теле',
      href: '/psychoeducation',
    })
  }

  if (toneAtLeast(result.levels.anxiety.tone, 'moderate')) {
    add({
      id: 'med-478',
      icon: '🫁',
      title: 'Дыхание 4-7-8',
      description: 'Снижает тревогу и успокаивает дыхание',
      href: '/meditation?mode=1',
    })
    add({
      id: 'anat-lungs',
      icon: '🧬',
      title: 'Лёгкие и тревога',
      description: 'Почему дыхание становится поверхностным',
      href: '/psychoeducation',
    })
  }

  if (toneAtLeast(result.levels.depression.tone, 'moderate')) {
    add({
      id: 'goodword',
      icon: '💌',
      title: 'Доброе слово',
      description: 'Тёплая поддержка в один клик',
      href: '/goodword',
    })
    add({
      id: 'techniques',
      icon: '💡',
      title: 'Техники самопомощи',
      description: 'Дневник мыслей, релаксация, паузы',
      href: '/techniques',
    })
  }

  if (items.filter((i) => i.priority !== 'sos').length === 0) {
    add({
      id: 'med-default',
      icon: '🧘',
      title: 'Медитации',
      description: 'Дыхательные практики на каждый день',
      href: '/meditation',
    })
    add({
      id: 'techniques-default',
      icon: '💡',
      title: 'Техники',
      description: 'Проверенные методы самопомощи',
      href: '/techniques',
    })
  }

  return items.slice(0, 4)
}

export function getOrganActions(organId: string): Recommendation[] {
  const map: Record<string, Recommendation[]> = {
    brain: [
      {
        id: 'brain-med',
        icon: '🧘',
        title: 'Дыхание 4-7-8',
        description: 'Помогает успокоить мысли',
        href: '/meditation?mode=1',
      },
    ],
    heart: [
      {
        id: 'heart-med',
        icon: '🧘',
        title: 'Дыхание 4-6',
        description: 'Замедляет пульс при стрессе',
        href: '/meditation?mode=0',
      },
    ],
    lungs: [
      {
        id: 'lungs-med',
        icon: '🫁',
        title: 'Дыхательная практика',
        description: 'Диафрагмальное дыхание',
        href: '/meditation?mode=0',
      },
    ],
    stomach: [
      {
        id: 'stomach-tech',
        icon: '💡',
        title: 'Техники расслабления',
        description: 'Снять напряжение в теле',
        href: '/techniques',
      },
    ],
    muscles: [
      {
        id: 'muscles-tech',
        icon: '💪',
        title: 'Прогрессивная релаксация',
        description: 'Пошаговое расслабление мышц',
        href: '/techniques',
      },
    ],
    adrenals: [
      {
        id: 'adrenals-med',
        icon: '🧘',
        title: 'Короткая пауза',
        description: '2–3 минуты спокойного дыхания',
        href: '/meditation?mode=0',
      },
    ],
    immune: [
      {
        id: 'immune-goodword',
        icon: '💌',
        title: 'Доброе слово',
        description: 'Поддержка для восстановления сил',
        href: '/goodword',
      },
    ],
  }
  return map[organId] ?? []
}
