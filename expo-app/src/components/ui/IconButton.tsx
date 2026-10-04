import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, type IconName } from '@/components/brand';
import { useTheme } from '@/theme';
import { focusRing, isFocused } from './focus';

// Размер иконки по умолчанию — как у крестика в шапке (.ibtn в макетах).
const ICON_SIZE = 22;

type Props = {
  icon: IconName;
  /** Что делает кнопка: «Закрыть», «Назад к техникам». Обязателен — текста у кнопки нет. */
  accessibilityLabel: string;
  onPress?: () => void;
  iconSize?: number;
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Круглая кнопка-иконка 48×48 без фона: «Назад», «Закрыть». */
export function IconButton({ icon, accessibilityLabel, onPress, iconSize = ICON_SIZE, color, disabled, style }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      aria-disabled={!!disabled}
      style={(state) => [
        {
          width: t.size.touch,
          height: t.size.touch,
          borderRadius: t.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: state.pressed ? t.color.surfaceAlt : 'transparent',
        },
        focusRing(t, isFocused(state)),
        style,
      ]}
    >
      <Icon name={icon} size={iconSize} color={disabled ? t.color.textMuted : (color ?? t.color.text)} />
    </Pressable>
  );
}
