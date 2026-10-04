import React, { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { useTheme } from '@/theme';

// Размеры по макету Meditation (ползунок громкости).
const HEIGHT = 32;
const TRACK = 6;
const THUMB = 20;
const DRAG_START = 4;
// Шаг для скринридера и клавиатуры.
const A11Y_STEP = 10;

type Props = {
  /** Значение от min до max. */
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Что регулируем: «Громкость звука». */
  accessibilityLabel: string;
};

/** Ползунок: тянется пальцем, нажимается в любом месте дорожки, управляется TalkBack и стрелками с клавиатуры. */
export function Slider({ value, onChange, min = 0, max = 100, accessibilityLabel }: Props) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const share = max > min ? (Math.min(max, Math.max(min, value)) - min) / (max - min) : 0;
  const travel = Math.max(0, width - THUMB);

  const set = (next: number) => onChange(Math.round(Math.min(max, Math.max(min, next))));
  const setFromX = (x: number) => {
    if (travel > 0) set(min + ((x - THUMB / 2) / travel) * (max - min));
  };

  const drag = Gesture.Pan()
    .activeOffsetX([-DRAG_START, DRAG_START])
    .onUpdate((e) => {
      scheduleOnRN(setFromX, e.x);
    });
  const tap = Gesture.Tap().onEnd((e) => {
    scheduleOnRN(setFromX, e.x);
  });

  // Стрелки на клавиатуре — только в вебе; пропса onKeyDown в типах React Native нет.
  const keyboard = {
    onKeyDown: (event: { key: string }) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') set(value + A11Y_STEP);
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') set(value - A11Y_STEP);
    },
  };

  return (
    <GestureDetector gesture={Gesture.Race(drag, tap)}>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessible
        focusable
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment') set(value + A11Y_STEP);
          if (event.nativeEvent.actionName === 'decrement') set(value - A11Y_STEP);
        }}
        {...keyboard}
        style={{ flex: 1, height: HEIGHT, justifyContent: 'center' }}
      >
        <View style={{ height: TRACK, borderRadius: TRACK / 2, backgroundColor: t.color.border, overflow: 'hidden' }}>
          <View style={{ width: share * travel + THUMB / 2, height: TRACK, backgroundColor: t.color.primary }} />
        </View>
        <View
          style={{
            position: 'absolute',
            left: share * travel,
            width: THUMB,
            height: THUMB,
            borderRadius: t.radius.full,
            backgroundColor: t.color.primary,
          }}
        />
      </View>
    </GestureDetector>
  );
}
