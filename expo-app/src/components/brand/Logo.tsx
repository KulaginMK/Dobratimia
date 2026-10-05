import React from 'react';
import { Text, View } from 'react-native';
import Svg from 'react-native-svg';
import { useTheme } from '../../theme';
import { logoShapes } from './shapes';
import { SvgShapes } from './SvgShapes';

type Props = {
  /** horizontal — знак и надпись в строку; stacked — надпись под знаком; mark — только знак. */
  variant?: 'horizontal' | 'stacked' | 'mark';
  /** Высота знака. Не меньше 24. По умолчанию 40. */
  size?: number;
  /** Один цвет для монохромной версии, например '#2C1F1A' или '#FFFFFF'. */
  mono?: string;
  /** stacked: ширина, в которую должна поместиться надпись. Если знак слишком велик, он уменьшается вместе с ней. */
  maxWidth?: number;
};

// Надпись «Добратимия» шире высоты знака примерно в 3,83 раза (кегль 0,58 от неё); взято с запасом.
const WORD_WIDTH_RATIO = 3.9;

/**
 * Знак «Две половины»: голова, две половины-объятия, росток внутри.
 * Цвета — токены logo.*, в тёмной теме переключаются сами.
 * Надпись — Nunito 900, кегль 0,58 от высоты знака, зазор 8.
 */
export function Logo({ variant = 'horizontal', size = 40, mono, maxWidth }: Props) {
  const theme = useTheme();
  const fit = variant === 'stacked' && maxWidth ? Math.floor(maxWidth / WORD_WIDTH_RATIO) : size;
  const s = Math.max(24, Math.min(size, fit));
  const mark = (
    <Svg width={s} height={s} viewBox="0 0 64 64">
      <SvgShapes shapes={logoShapes} mono={mono} />
    </Svg>
  );
  if (variant === 'mark') {
    return (
      <View accessible accessibilityRole="image" accessibilityLabel="Добратимия">
        {mark}
      </View>
    );
  }
  const word = (
    <Text
      style={{
        fontFamily: theme.fontFamily.display[900],
        fontSize: Math.round(s * 0.58),
        lineHeight: Math.round(s * 0.58 * 1.15),
        color: mono ?? theme.color.text,
      }}
    >
      Добратимия
    </Text>
  );
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Добратимия"
      style={{
        flexDirection: variant === 'horizontal' ? 'row' : 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {mark}
      {word}
    </View>
  );
}
