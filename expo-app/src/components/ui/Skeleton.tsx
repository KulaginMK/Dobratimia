import React, { useEffect, useState } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

// Размеры из веб-эталона bundle.css (.dt-skel).
const LINE_HEIGHT = 14;
const LINES_GAP = 10;
const ITEM_GAP = 14;
const ICON = 48;
const PULSE_MS = 1600;
const PULSE_MIN = 0.55;
const DEFAULT_LINES = 3;
const DEFAULT_CARD_HEIGHT = 120;
const LINE_WIDTHS: DimensionValue[] = ['100%', '92%', '64%', '80%', '48%'];
const LAST_LINE_WIDTH: DimensionValue = '60%';
// Скелетон показывается, только если загрузка дольше 300 мс (docs/04).
const SHOW_AFTER_MS = 300;

type Props = {
  /** text — строки; listItem — квадрат и две строки; card — блок по высоте; circle — круг. */
  variant?: 'text' | 'listItem' | 'card' | 'circle';
  /** Число строк для variant="text". */
  lines?: number;
  /** Высота для variant="card". */
  height?: number;
  /** Диаметр для variant="circle". */
  size?: number;
};

/** Заглушка загрузки в форме будущего контента — вместо спиннера на весь экран. */
export function Skeleton({ variant = 'text', lines = DEFAULT_LINES, height = DEFAULT_CARD_HEIGHT, size }: Props) {
  const t = useTheme();
  const circle = size ?? t.size.avatar;

  if (variant === 'circle') {
    return (
      <View aria-hidden>
        <Bone style={{ width: circle, height: circle, borderRadius: t.radius.full }} />
      </View>
    );
  }
  if (variant === 'card') {
    return (
      <View aria-hidden>
        <Bone style={{ height, borderRadius: t.radius.xl }} />
      </View>
    );
  }
  if (variant === 'listItem') {
    return (
      <View aria-hidden style={{ flexDirection: 'row', alignItems: 'center', gap: ITEM_GAP }}>
        <Bone style={{ width: ICON, height: ICON, borderRadius: t.radius.md }} />
        <View style={{ flex: 1, gap: LINES_GAP }}>
          <Bone style={{ width: '62%', height: LINE_HEIGHT, borderRadius: t.radius.sm }} />
          <Bone style={{ width: '38%', height: LINE_HEIGHT, borderRadius: t.radius.sm }} />
        </View>
      </View>
    );
  }
  return (
    <View accessible role="status" accessibilityLabel="Загрузка" style={{ gap: LINES_GAP }}>
      {Array.from({ length: lines }, (_, i) => (
        <Bone
          key={i}
          style={{
            width: i === lines - 1 ? LAST_LINE_WIDTH : LINE_WIDTHS[i % LINE_WIDTHS.length],
            height: LINE_HEIGHT,
            borderRadius: t.radius.sm,
          }}
        />
      ))}
    </View>
  );
}

type BoneStyle = { width?: DimensionValue; height: number; borderRadius: number };

/** Один блок скелетона. Пульсация прозрачности 1,6 с; при «Уменьшить движение» Reanimated её не запускает. */
function Bone({ style }: { style: BoneStyle }) {
  const t = useTheme();
  const opacity = useSharedValue(1);
  useEffect(() => {
    const half = { duration: PULSE_MS / 2, easing: Easing.inOut(Easing.ease) };
    opacity.set(withRepeat(withSequence(withTiming(PULSE_MIN, half), withTiming(1, half)), -1));
  }, [opacity]);
  const pulse = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return <Animated.View style={[{ backgroundColor: t.color.skeleton }, style, pulse]} />;
}

/** true, только если загрузка длится дольше 300 мс: быстрые ответы не мигают скелетоном. */
export function useSkeletonVisible(loading: boolean): boolean {
  const [visible, setVisible] = useState(false);
  if (!loading && visible) setVisible(false);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [loading]);
  return visible;
}
