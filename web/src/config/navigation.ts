export type NavItem = {
  path: string
  label: string
  icon: string
  accent?: 'scream'
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Главная', icon: '🏠' },
  { path: '/scream', label: 'Крик', icon: '🔥', accent: 'scream' },
  { path: '/dass', label: 'DASS-21', icon: '📋' },
  { path: '/meditation', label: 'Медитации', icon: '🧘' },
  { path: '/psychoeducation', label: 'Анатомия', icon: '🧬' },
  { path: '/techniques', label: 'Техники', icon: '💡' },
  { path: '/goodword', label: 'Доброе слово', icon: '💌' },
  { path: '/map', label: 'Карта', icon: '🗺️' },
  { path: '/about', label: 'О проекте', icon: 'ℹ️' },
]

export const HOME_SLIDES = [
  { path: '/scream', icon: '🔥', title: 'Крик', desc: 'Анонимно выплесните эмоции — текстом или голосом', color: '#ef4444' },
  { path: '/dass', icon: '📋', title: 'DASS-21', desc: 'Оценка депрессии, тревоги и стресса за 5 минут', color: '#10b981' },
  { path: '/meditation', icon: '🧘', title: 'Медитации', desc: 'Дыхание и ambient-звуки природы', color: '#3b82f6' },
  { path: '/psychoeducation', icon: '🧬', title: 'Анатомия стресса', desc: 'Что происходит с телом и как помочь себе', color: '#8b5cf6' },
  { path: '/techniques', icon: '💡', title: 'Техники', desc: 'Проверенные методы самопомощи', color: '#f59e0b' },
  { path: '/goodword', icon: '💌', title: 'Доброе слово', desc: 'Тёплая поддержка в один клик', color: '#ec4899' },
] as const
