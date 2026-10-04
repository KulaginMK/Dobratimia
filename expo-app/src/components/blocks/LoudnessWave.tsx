import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';

// Размеры из макетов ScreamLive и ScreamResult (.wave, .bar).
const SHAPES = {
  live: { bars: 36, height: 120, width: 5, radius: 3 },
  result: { bars: 48, height: 56, width: 4, radius: 2 },
};
// Высота столбика без звука — точка.
const MIN_BAR = 6;

type Props = {
  /** live — последние 36 уровней, новые справа; result — весь замер, сжатый до 48 столбиков. */
  variant: 'live' | 'result';
  levels: number[];
  /** Уровень, при котором столбик занимает всю высоту. */
  max: number;
  /** «Волна громкости», «Запись громкости за 6 секунд». */
  accessibilityLabel: string;
};

/** Весь замер в заданном числе столбиков: в каждом — самый громкий уровень своего отрезка. */
function fit(levels: number[], bars: number): number[] {
  if (levels.length === 0) return [];
  return Array.from({ length: bars }, (_, i) => {
    const start = Math.floor((i * levels.length) / bars);
    const end = Math.max(start + 1, Math.floor(((i + 1) * levels.length) / bars));
    return Math.max(...levels.slice(start, end));
  });
}

/** Волна громкости КРИКа. Столбики без звука — точки цвета color.border. */
export function LoudnessWave({ variant, levels, max, accessibilityLabel }: Props) {
  const t = useTheme();
  const shape = SHAPES[variant];
  const shown = variant === 'live' ? levels.slice(-shape.bars) : fit(levels, shape.bars);
  // В живой волне звук прижат к правому краю: слева — ещё пустые места.
  const offset = shape.bars - shown.length;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={{ height: shape.height, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
    >
      {Array.from({ length: shape.bars }, (_, i) => {
        const level = i >= offset ? shown[i - offset] : null;
        const share = level === null ? 0 : Math.min(1, Math.max(0, level / max));
        const newest = variant === 'live' && level !== null && i === shape.bars - 1;
        return (
          <View
            key={i}
            style={{
              width: shape.width,
              height: MIN_BAR + (shape.height - MIN_BAR) * share,
              borderRadius: shape.radius,
              backgroundColor:
                level === null ? t.color.border : newest ? t.color.primaryPressed : t.color.primary,
            }}
          />
        );
      })}
    </View>
  );
}
