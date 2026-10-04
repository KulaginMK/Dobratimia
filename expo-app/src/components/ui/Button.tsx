import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, type Theme } from '../../theme';
import { Icon, type IconName } from '../brand/Icon';

// Размеры из веб-эталона bundle.css (.dt-btn): допустимы внутри компонента (CLAUDE.md, правило 1).
const LG_RADIUS = 20;
const PAD_MD = 22;
const PAD_LG = 26;
const PAD_TEXT = 12;
const ICON_MD = 22;
const ICON_LG = 26;

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'sos' | 'deep';

type Props = {
  /** primary — главное действие (одно на экран); secondary — мягкое; outline — отмена;
   *  text — «Подробнее»; sos — экстренная помощь; deep — крупная акцентная (DASS-21). */
  variant?: ButtonVariant;
  /** md — 52, lg — 64. */
  size?: 'md' | 'lg';
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  /** Обязателен, если у кнопки нет текста (только иконка). */
  accessibilityLabel?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

function colors(t: Theme, variant: ButtonVariant, pressed: boolean) {
  switch (variant) {
    case 'primary':
      return { bg: pressed ? t.color.primaryPressed : t.color.primary, fg: t.color.onPrimary };
    case 'secondary':
      return { bg: t.color.primarySoft, fg: t.color.onPrimarySoft };
    case 'outline':
      return { bg: pressed ? t.color.surfaceAlt : 'transparent', fg: t.color.text, border: t.color.borderStrong };
    case 'text':
      return { bg: pressed ? t.color.surfaceAlt : 'transparent', fg: t.color.primary };
    case 'sos':
      return { bg: t.color.sos, fg: t.color.onSos };
    case 'deep':
      return { bg: t.color.secondary, fg: t.color.onSecondary };
  }
}

/** Кнопка. Нажатие — масштаб 98%, у primary — цвет color.primaryPressed. Область касания ≥ 48. */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  disabled,
  onPress,
  accessibilityLabel,
  children,
  style,
}: Props) {
  const t = useTheme();
  const lg = size === 'lg';
  const iconOnly = !children;
  const iconSize = lg ? ICON_LG : ICON_MD;
  const height = lg ? t.size.buttonLarge : t.size.button;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      aria-disabled={!!disabled}
      style={(state) => {
        const { pressed } = state;
        // focused приходит в вебе (react-native-web) — рисуем кольцо фокуса color.focus.
        const focused = (state as { focused?: boolean }).focused;
        const c = disabled
          ? { bg: t.color.surfaceAlt, fg: t.color.textMuted, border: undefined }
          : colors(t, variant, pressed);
        return [
          {
            minHeight: height,
            minWidth: t.size.touch,
            paddingHorizontal: iconOnly ? 0 : variant === 'text' ? PAD_TEXT : lg ? PAD_LG : PAD_MD,
            paddingVertical: iconOnly ? 0 : t.space.xs,
            width: iconOnly ? height : fullWidth ? '100%' : undefined,
            borderRadius: lg ? LG_RADIUS : t.radius.lg,
            backgroundColor: c.bg,
            borderWidth: c.border ? 1.5 : 0,
            borderColor: c.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
            outlineWidth: focused ? 2 : 0,
            outlineStyle: 'solid',
            outlineColor: t.color.focus,
            outlineOffset: 2,
          } as ViewStyle,
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const fg = disabled ? t.color.textMuted : colors(t, variant, pressed).fg;
        return (
          <>
            {icon ? <Icon name={icon} size={iconSize} color={fg} /> : null}
            {children != null ? (
              <Text
                style={[
                  { textAlign: 'center', flexShrink: 1 },
                  t.type.button,
                  {
                    color: fg,
                    fontSize: lg ? 17 : 16,
                    fontFamily: variant === 'sos' ? t.fontFamily.text[700] : t.type.button.fontFamily,
                  },
                ]}
              >
                {children}
              </Text>
            ) : null}
            {iconRight ? <Icon name={iconRight} size={iconSize} color={fg} /> : null}
          </>
        );
      }}
    </Pressable>
  );
}

/** Помогает ставить кнопки в ряд без лишней обёртки. */
export function ButtonRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>{children}</View>;
}
