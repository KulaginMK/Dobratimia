import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';

// Высота полосы из макета DassQuestion.
const HEIGHT = 8;

type Props = {
  /** Сколько сделано, например номер вопроса. */
  value: number;
  /** Сколько всего. */
  max: number;
  /** Что измеряем: «Прогресс теста». */
  accessibilityLabel: string;
};

/** Полоса прогресса: фон color.surfaceAlt, заполнение color.primary. */
export function ProgressBar({ value, max, accessibilityLabel }: Props) {
  const t = useTheme();
  const share = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      style={{
        height: HEIGHT,
        borderRadius: HEIGHT / 2,
        backgroundColor: t.color.surfaceAlt,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${share * 100}%`,
          height: HEIGHT,
          borderRadius: HEIGHT / 2,
          backgroundColor: t.color.primary,
        }}
      />
    </View>
  );
}
