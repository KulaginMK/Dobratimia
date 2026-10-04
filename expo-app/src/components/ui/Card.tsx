import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, type Theme } from '@/theme';
import { focusRing, isFocused } from './focus';

// Нажатие — масштаб 0,99 (docs/04).
const PRESSED_SCALE = 0.99;

export type CardVariant = 'surface' | 'soft' | 'outline' | 'sos';

type Props = {
  /** surface — белая с мягкой тенью; soft — терракотовая подложка; outline — плоская с рамкой; sos — бережный блок. */
  variant?: CardVariant;
  /** Нажимается целиком. Вместе с onPress карточка становится кнопкой. */
  interactive?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Цвета карточки. В React Native цвет текста не наследуется от контейнера,
 * поэтому тексты внутри карточки берут fg отсюда.
 */
export function cardColors(t: Theme, variant: CardVariant = 'surface') {
  switch (variant) {
    case 'soft':
      return { bg: t.color.primarySoft, fg: t.color.onPrimarySoft };
    case 'sos':
      return { bg: t.color.sosSoft, fg: t.color.onSosSoft };
    default:
      return { bg: t.color.surface, fg: t.color.text };
  }
}

/** Карточка-контейнер: радиус radius.xl, внутренний отступ space.lg. */
export function Card({ variant = 'surface', interactive, onPress, accessibilityLabel, children, style }: Props) {
  const t = useTheme();
  const base: ViewStyle = {
    backgroundColor: cardColors(t, variant).bg,
    borderRadius: t.radius.xl,
    padding: t.space.lg,
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: t.color.border,
    boxShadow: variant === 'surface' ? t.shadow.sm : undefined,
  };

  if (!interactive && !onPress) {
    return <View style={[base, style]}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={(state) => [
        base,
        state.pressed && { boxShadow: t.shadow.md, transform: [{ scale: PRESSED_SCALE }] },
        focusRing(t, isFocused(state)),
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
