import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { svgA11y } from '@/components/brand';
import { useTheme } from '@/theme';

// Размеры из макета Pomodoro: кольцо 280, радиус 124, толщина 18.
const SIZE = 280;
const RADIUS = 124;
const STROKE = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TIME_SIZE = 64;
const TIME_LINE = 70;
const TEXT_GAP = 4;
const DOT = 14;
const DOT_BORDER = 2;
const DOTS_GAP = 10;
// Время в круге фиксированного размера — системный шрифт увеличивает его не больше чем на 20%.
const MAX_FONT_SCALE = 1.2;

type RingProps = {
  /** Доля оставшегося времени: 1 — кольцо полное, 0 — пустое. */
  remaining: number;
  /** «16:05». */
  time: string;
  /** «до перерыва». */
  caption: string;
  /** Для скринридера: «Осталось 16 минут 5 секунд». */
  accessibilityLabel: string;
  /** Картинка над временем: Тимка в перерыве. */
  top?: React.ReactNode;
};

/** Кольцевой таймер: дуга показывает, сколько времени осталось. */
export function TimerRing({ remaining, time, caption, accessibilityLabel, top }: RingProps) {
  const t = useTheme();
  const share = Math.min(1, Math.max(0, remaining));
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} {...svgA11y()}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={t.color.surfaceAlt} strokeWidth={STROKE} />
        {share > 0 ? (
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={t.color.primary}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - share)}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        ) : null}
      </Svg>
      <View
        accessible
        role="timer"
        accessibilityLabel={accessibilityLabel}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          alignItems: 'center',
          justifyContent: 'center',
          gap: TEXT_GAP,
        }}
      >
        {top}
        <Text
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={{
            fontFamily: t.fontFamily.display[900],
            fontSize: TIME_SIZE,
            lineHeight: TIME_LINE,
            color: t.color.text,
            fontVariant: ['tabular-nums'],
          }}
        >
          {time}
        </Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>{caption}</Text>
      </View>
    </View>
  );
}

type DotsProps = {
  total: number;
  /** Сколько «помидоров» уже закончено. */
  done: number;
  /** «Помидор 2 из 4». */
  label: string;
};

/** Точки-«помидоры»: закрашенные — законченные. Рядом подпись словами. */
export function TomatoDots({ total, done, label }: DotsProps) {
  const t = useTheme();
  return (
    <View accessible accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'center', gap: DOTS_GAP }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: DOT,
            height: DOT,
            borderRadius: t.radius.full,
            backgroundColor: i < done ? t.color.primary : t.color.surfaceAlt,
            borderWidth: i < done ? 0 : DOT_BORDER,
            borderColor: t.color.borderStrong,
          }}
        />
      ))}
      <Text style={[t.type.caption, { color: t.color.textMuted }]}>{label}</Text>
    </View>
  );
}
