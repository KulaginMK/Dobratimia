import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { Timka } from '@/components/brand';
import { useTheme } from '@/theme';

// Размеры из макета Meditation.
const OUTER = 270;
const INNER = 224;
const TIMKA = 170;

type Props = {
  /** Размер внутреннего круга: 0,72 — сжат, 1 — раскрыт. Меняется строго по секундам схемы. */
  scale: SharedValue<number>;
};

/** Дыхательный круг с Тимкой: растёт на вдохе, стоит на задержке, сжимается на выдохе. */
export function BreathCircle({ scale }: Props) {
  const t = useTheme();
  const innerStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
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
        <Timka pose="breathe" size={TIMKA} />
      </Animated.View>
    </View>
  );
}
