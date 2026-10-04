import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/theme';

// Размеры из макета Diary: столбик тем выше, чем лучше настроение.
const HEIGHT = 84;
const COLUMN_WIDTH = 36;
const COLUMN_GAP = 6;
const BAR_WIDTH = 24;
const BAR_RADIUS = 8;
const BAR_BASE = 12;
const BAR_STEP = 12;
const LABEL_SIZE = 12;
const LABEL_LINE = 16;

export type WeekBar = {
  /** Ключ дня — для списка. */
  key: string;
  /** «Пн», «Вт»… */
  weekday: string;
  /** Уровень 1–5; null — в этот день отметки нет. */
  level: number | null;
  /** Цвет уровня. */
  color?: string;
  /** Для скринридера: «Понедельник: хорошо». */
  accessibilityLabel: string;
};

/** Семь столбиков «настроение по дням». Цвет дублируется высотой столбика и подписью для скринридера. */
export function MoodWeekBars({ days }: { days: WeekBar[] }) {
  const t = useTheme();
  return (
    <View style={{ height: HEIGHT, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      {days.map((day) => (
        <View
          key={day.key}
          accessible
          accessibilityLabel={day.accessibilityLabel}
          style={{ width: COLUMN_WIDTH, alignItems: 'center', gap: COLUMN_GAP }}
        >
          {day.level ? (
            <View
              style={{
                width: BAR_WIDTH,
                height: BAR_BASE + day.level * BAR_STEP,
                borderRadius: BAR_RADIUS,
                backgroundColor: day.color,
              }}
            />
          ) : null}
          <Text
            style={{
              fontFamily: t.type.caption.fontFamily,
              fontSize: LABEL_SIZE,
              lineHeight: LABEL_LINE,
              color: t.color.textMuted,
            }}
          >
            {day.weekday}
          </Text>
        </View>
      ))}
    </View>
  );
}
