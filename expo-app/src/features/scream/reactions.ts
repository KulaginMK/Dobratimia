import type { TimkaMotion, TimkaPose } from '@/components/brand';

export type Reaction = {
  /** Нижняя граница диапазона, усл. дБ. */
  from: number;
  /** Диапазон, как в «Шкале реакций»: «80–99». */
  range: string;
  /** Короткая строка в «Шкале реакций». */
  short: string;
  /** Заголовок карточки-реакции на экране результата. */
  title: string;
  /** Текст под заголовком. */
  body: string;
  /** В макете Scream диапазон выделен цветом color.primary. */
  accent?: boolean;
  /** Как Тимка реагирует на пик (TIMKA-MOTION.md, пункт 11). */
  timka: { pose: TimkaPose; motion: TimkaMotion };
};

// Юмор в приложении уместен только здесь (docs/02).
// Готова только реакция 80–99. У остальных заголовки — черновые из docs/07, а пояснения — ЗАГЛУШКИ:
// написаны, чтобы карточка не была пустой, и ждут текста владельца (docs/10).
export const REACTIONS: Reaction[] = [
  {
    from: 0,
    range: 'до 60',
    short: 'Шёпот в библиотеке',
    title: 'Шёпот в библиотеке',
    // ЗАГЛУШКА
    body: 'Тихо — тоже считается. Если хочется громче, попробуйте ещё раз: библиотекарь не услышит.',
    timka: { pose: 'hello', motion: 'idle' },
  },
  {
    from: 60,
    range: '60–79',
    short: 'Уверенно, с последней парты',
    title: 'Уверенно, с последней парты',
    // ЗАГЛУШКА
    body: 'Преподаватель услышал бы и без микрофона. Можно добавить громкости, а можно на этом и остановиться.',
    timka: { pose: 'hello', motion: 'flutter' },
  },
  {
    from: 80,
    range: '80–99',
    short: 'Сосед по комнате проснулся',
    title: 'Поздравляем, вы, вероятно, разбудили соседа по комнате',
    body: 'Если пар ещё остался — можно повторить. Соседу потом расскажете, что это была дыхательная практика.',
    accent: true,
    timka: { pose: 'loud', motion: 'flutter' },
  },
  {
    from: 100,
    range: '100+',
    short: 'Легенда общежития',
    title: 'Легенда общежития',
    // ЗАГЛУШКА
    body: 'Вас услышали на всех этажах. Вахтёру скажете, что репетировали доклад.',
    timka: { pose: 'loud', motion: 'blown' },
  },
];

/** Реакция по пику замера. */
export function reactionFor(peak: number): Reaction {
  return REACTIONS.findLast((reaction) => peak >= reaction.from) ?? REACTIONS[0];
}
