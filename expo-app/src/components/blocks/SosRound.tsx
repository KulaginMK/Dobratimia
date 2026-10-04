import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '@/theme';
import { focusRing, isFocused } from '@/components/ui/focus';

// Кегль и разрядка надписи из макетов: 13 в шапке экранов ленты, 21 на Главной.
const FONT_MD = 13;
const FONT_LG = 21;
const LETTER_SPACING_LG = 0.63;

type Props = {
  /** md — 48×48 в шапке экрана ленты; lg — 72×72 на Главной рядом с «Картой». */
  size?: 'md' | 'lg';
  onPress?: () => void;
};

/** Круглая кнопка SOS цвета color.sos. Видна на каждом экране ленты, не прячется в меню. */
export function SosRound({ size = 'md', onPress }: Props) {
  const t = useTheme();
  const lg = size === 'lg';
  const diameter = lg ? t.size.roundAction : t.size.touch;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="SOS — экстренная помощь"
      style={(state) => [
        {
          width: diameter,
          height: diameter,
          borderRadius: t.radius.full,
          backgroundColor: t.color.sos,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transform: [{ scale: state.pressed ? 0.98 : 1 }],
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      <Text
        style={{
          fontFamily: t.fontFamily.display[900],
          fontSize: lg ? FONT_LG : FONT_MD,
          letterSpacing: lg ? LETTER_SPACING_LG : undefined,
          color: t.color.onSos,
        }}
      >
        SOS
      </Text>
    </Pressable>
  );
}
