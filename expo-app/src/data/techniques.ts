import type { IconName } from '@/components/brand';
import { TEXT_NEEDED } from './placeholders';

/** Схемы дыхания: вдох-выдох или вдох-задержка-выдох, в секундах. */
export type BreathScheme = '4-6' | '4-7-8' | '5-5-5';

/** Фильтры списка техник: «До 3 минут», «Перед сном», «Перед экзаменом». */
export type TechniqueFilter = 'short' | 'sleep' | 'exam';

export const TECHNIQUE_FILTERS: { id: TechniqueFilter; label: string }[] = [
  { id: 'short', label: 'До 3 минут' },
  { id: 'sleep', label: 'Перед сном' },
  { id: 'exam', label: 'Перед экзаменом' },
];

/** Крупная цифра схемы на экране техники: «4 · вдох носом». */
export type TechniquePhase = { value: string; label: string };

export type Technique = {
  id: string;
  title: string;
  icon: IconName;
  /** «2 минуты». */
  duration: string;
  /** Для чего техника, строкой в списке: «при тревоге и перед сном». */
  summary: string;
  /** То же метками на экране техники: «при тревоге», «перед сном». */
  tags: string[];
  filters: TechniqueFilter[];
  phases?: TechniquePhase[];
  /** «Как делать» по шагам. */
  steps: string[];
  /** «Почему это работает». */
  why: string;
  /** Связанная схема дыхания: с ней открывается таймер по кнопке «Начать с таймером». */
  breathScheme?: BreathScheme;
  /** pomodoro — карточка в списке открывает не экран техники, а таймер Pomodoro. */
  opens?: 'pomodoro';
};

// Готов текст только у «Дыхания 4-7-8» (макет Technique). Шаги и «почему работает» остальных техник
// должен написать и проверить психолог (docs/07, docs/10).
// Фильтры расставлены по подписям из макета; распределение техник по фильтрам тоже ждёт психолога.
export const TECHNIQUES: Technique[] = [
  {
    id: 'breath-4-7-8',
    title: 'Дыхание 4-7-8',
    icon: 'breath',
    duration: '2 минуты',
    summary: 'при тревоге и перед сном',
    tags: ['при тревоге', 'перед сном'],
    filters: ['short', 'sleep'],
    phases: [
      { value: '4', label: 'вдох носом' },
      { value: '7', label: 'задержка' },
      { value: '8', label: 'выдох ртом' },
    ],
    steps: [
      'Сядьте удобно, плечи опустите. Кончик языка — за верхними зубами.',
      'Вдохните носом на 4 счёта, задержите дыхание на 7.',
      'Медленно выдохните ртом на 8 счётов, с лёгким звуком «ф-ф-ф».',
      'Повторите 4 цикла. Если кружится голова — дышите в обычном ритме.',
    ],
    why: 'Длинный выдох помогает телу переключиться из режима «бей или беги» в режим отдыха. Многим так легче уснуть.',
    breathScheme: '4-7-8',
  },
  {
    id: 'progressive-relaxation',
    title: 'Прогрессивная релаксация',
    icon: 'specialist',
    duration: '10 минут',
    summary: 'снимает зажимы в теле',
    tags: ['снимает зажимы в теле'],
    filters: [],
    steps: [TEXT_NEEDED],
    why: TEXT_NEEDED,
  },
  {
    id: 'thought-diary',
    title: 'Дневник мыслей',
    icon: 'diary',
    duration: '5 минут',
    summary: 'разобрать, что тревожит',
    tags: ['разобрать, что тревожит'],
    filters: [],
    steps: [TEXT_NEEDED],
    why: TEXT_NEEDED,
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro',
    icon: 'techniques',
    duration: '25 + 5 минут',
    summary: 'учёба без выгорания',
    tags: ['учёба без выгорания'],
    filters: ['exam'],
    steps: [],
    why: '',
    opens: 'pomodoro',
  },
  {
    id: 'grounding-5-4-3-2-1',
    title: 'Заземление 5-4-3-2-1',
    icon: 'sprout',
    duration: '3 минуты',
    summary: 'когда накрывает паника',
    tags: ['когда накрывает паника'],
    filters: ['short'],
    steps: [TEXT_NEEDED],
    why: TEXT_NEEDED,
  },
  {
    id: 'body-scan',
    title: 'Сканирование тела',
    icon: 'heart',
    duration: '8 минут',
    summary: 'после ночной смены',
    tags: ['после ночной смены'],
    filters: [],
    steps: [TEXT_NEEDED],
    why: TEXT_NEEDED,
  },
];

export function techniqueById(id: string | undefined): Technique | null {
  return TECHNIQUES.find((technique) => technique.id === id) ?? null;
}
