import React, { useId } from 'react';
import { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { tokenByPath, useTheme } from '../../theme';
import type { Shape } from './shapes';

const TAGS: Record<string, React.ComponentType<any>> = {
  path: Path,
  circle: Circle,
  ellipse: Ellipse,
  rect: Rect,
  g: G,
  defs: Defs,
  linearGradient: LinearGradient,
  stop: Stop,
};

const COLOR_PROPS = new Set(['fill', 'stroke', 'stopColor']);

type Props = {
  shapes: Shape[];
  /** Чем заменить '$current' (цвет иконки). */
  current?: string;
  /** Один цвет для всех заливок и обводок (монохромный логотип). */
  mono?: string;
};

/** Рисует фигуры из shapes.ts внутри <Svg>. Подставляет токены темы и делает id градиентов уникальными. */
export function SvgShapes({ shapes, current, mono }: Props) {
  const theme = useTheme();
  const prefix = 'dt' + useId().replace(/[^a-zA-Z0-9]/g, '');

  const resolve = (key: string, value: string): string => {
    if (key === 'id') return prefix + value;
    if (mono && COLOR_PROPS.has(key) && value !== 'none') return mono;
    if (value.startsWith('url(#')) return `url(#${prefix}${value.slice(5)}`;
    if (value === '$current') return current ?? theme.color.text;
    if (value.startsWith('$')) return tokenByPath(theme, value.slice(1)) ?? value;
    return value;
  };

  const render = (list: Shape[]): React.ReactNode =>
    list.map((s, i) => {
      if (mono && (s.t === 'defs' || s.t === 'linearGradient')) return null;
      const Tag = TAGS[s.t];
      if (!Tag) return null;
      const props: Record<string, string> = {};
      for (const [k, v] of Object.entries(s.p)) props[k] = resolve(k, v);
      return (
        <Tag key={i} {...props}>
          {s.c ? render(s.c) : null}
        </Tag>
      );
    });

  return <>{render(shapes)}</>;
}
