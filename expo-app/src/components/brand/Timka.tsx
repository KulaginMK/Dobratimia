import React from 'react';
import { View } from 'react-native';
import Svg from 'react-native-svg';
import { timkaShapes } from './shapes';
import { SvgShapes } from './SvgShapes';

export type TimkaPose = 'hello' | 'breathe' | 'sleep';

const LABELS: Record<TimkaPose, string> = {
  hello: 'Тимка машет рукой',
  breathe: 'Тимка спокойно дышит',
  sleep: 'Тимка спит',
};

type Props = {
  /** hello — онбординг и вход, breathe — медитации, sleep — пустые состояния. */
  pose?: TimkaPose;
  /** По умолчанию 160. */
  size?: number;
  title?: string;
};

/**
 * Маскот Тимка — тёплое зёрнышко с ростком.
 * Только онбординг, медитации и пустые состояния. Не в SOS, не в результатах DASS-21, не у специалистов, не в ошибках.
 */
export function Timka({ pose = 'hello', size = 160, title }: Props) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={title ?? LABELS[pose]}>
      <Svg width={size} height={size} viewBox="0 -6 120 120">
        <SvgShapes shapes={timkaShapes[pose]} />
      </Svg>
    </View>
  );
}
