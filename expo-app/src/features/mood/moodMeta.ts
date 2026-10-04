import { MOODS } from '@/components/blocks/MoodPicker';
import type { MoodLevel } from '@/data/local/mood';
import type { Theme } from '@/theme';

/** Слово уровня: «Тяжело», «Грустно», «Ровно», «Хорошо», «Отлично». */
export function moodLabel(level: MoodLevel): string {
  return MOODS.find((mood) => mood.level === level)?.label ?? '';
}

/** Цвет уровня в дневнике — как в макете Diary. Рядом с цветом всегда стоит слово. */
export function moodColor(t: Theme, level: MoodLevel): string {
  switch (level) {
    case 1:
      return t.color.secondary;
    case 2:
      return t.logo.warm;
    case 3:
      return t.color.accent;
    case 4:
      return t.logo.leaf;
    default:
      return t.color.growth;
  }
}
