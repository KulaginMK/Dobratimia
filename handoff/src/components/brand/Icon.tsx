import React from 'react';
import Svg from 'react-native-svg';
import { useTheme } from '../../theme';
import { iconShapes, type IconName } from './shapes';
import { SvgShapes } from './SvgShapes';

export type { IconName };
export { iconNames } from './shapes';

type Props = {
  name: IconName;
  /** По умолчанию 24 (size.icon). В карточке-списке — 32 (size.iconLarge). */
  size?: number;
  /** По умолчанию color.text. Вторая часть иконки — тот же цвет с прозрачностью 32%. */
  color?: string;
  /** Текст для TalkBack. Без него иконка декоративная и скрыта от скринридера. */
  title?: string;
};

/** Иконка «мягкие формы», сетка 48. */
export function Icon({ name, size, color, title }: Props) {
  const theme = useTheme();
  const s = size ?? theme.size.icon;
  return (
    <Svg
      width={s}
      height={s}
      viewBox="0 0 48 48"
      accessible={!!title}
      accessibilityLabel={title}
      accessibilityElementsHidden={!title}
      importantForAccessibility={title ? 'yes' : 'no-hide-descendants'}
    >
      <SvgShapes shapes={iconShapes[name]} current={color ?? theme.color.text} />
    </Svg>
  );
}
