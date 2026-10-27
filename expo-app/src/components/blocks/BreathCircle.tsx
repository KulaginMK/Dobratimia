import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { BreathingTimka, type BreathFace } from '@/components/brand';
import { MIN_SCALE, type BreathPhaseKind } from '@/features/meditation/breath';
import { useTheme } from '@/theme';

// Размеры из макета Meditation.
const OUTER = 270;
const INNER = 224;
const TIMKA = 170;
const FACES: Record<BreathPhaseKind, BreathFace> = { inhale: 'in', hold: 'hold', exhale: 'out' };

type Props = {
  /** Размер внутреннего круга: 0,72 — сжат, 1 — раскрыт. Меняется строго по секундам схемы. */
  scale: SharedValue<number>;
  kind: BreathPhaseKind;
  /** Практика идёт, а не ждёт «Начать» и не на паузе: пока не идёт, Тимка дремлет. */
  running: boolean;
  /** Практика закончилась: Тимка открывает глаза. */
  done?: boolean;
  /** false — экран сейчас не виден: Тимка стоит и не тратит батарею. */
  active?: boolean;
};

/**
 * Дыхательный круг с Тимкой: растёт на вдохе, стоит на задержке, сжимается на выдохе.
 * Тимка наполняется вместе с кругом и никогда не расходится с ним, лицо меняется по фазе (TIMKA-MOTION.md, пункты 4 и 5).
 */
export function BreathCircle({ scale, kind, running, done, active }: Props) {
  const t = useTheme();
  const innerStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const breath = useDerivedValue(() => (scale.get() - MIN_SCALE) / (1 - MIN_SCALE));
  return (
    <View
      aria-hidden
      style={{
        width: OUTER,
        height: OUTER,
        borderRadius: t.radius.full,
        backgroundColor: t.color.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            width: INNER,
            height: INNER,
            borderRadius: t.radius.full,
            backgroundColor: t.color.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          },
          innerStyle,
        ]}
      >
        <BreathingTimka
          level={breath}
          face={done ? 'look' : running ? FACES[kind] : 'rest'}
          size={TIMKA}
          active={active}
        />
      </Animated.View>
    </View>
  );
}
