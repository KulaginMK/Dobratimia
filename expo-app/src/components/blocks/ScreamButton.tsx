import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';

// Размеры из макета Home (.ring, .scream, .scream-t). Диаметр кнопки — токен size.scream (188).
const RING = 236;
const TITLE_SIZE = 42;
const TITLE_LINE = 46;
const TITLE_SPACING = 1.26;
const SUBTITLE_SIZE = 14;
const SUBTITLE_LINE = 18;
const GAP = 2;
// Надпись живёт внутри круга фиксированного размера — системный шрифт увеличивает её не больше чем на 30%.
const MAX_FONT_SCALE = 1.3;

type Props = {
  onPress: () => void;
};

/** Главная кнопка приложения — «КРИК» в мягком кольце. Единственная крупная кнопка color.primary на Главной. */
export function ScreamButton({ onPress }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="КРИК — выпустить пар"
      style={(state) => [
        {
          width: RING,
          height: RING,
          borderRadius: t.radius.full,
          backgroundColor: t.color.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      {({ pressed }) => (
        <View
          style={{
            width: t.size.scream,
            height: t.size.scream,
            borderRadius: t.radius.full,
            backgroundColor: pressed ? t.color.primaryPressed : t.color.primary,
            alignItems: 'center',
            justifyContent: 'center',
            gap: GAP,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }}
        >
          <Text
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            style={{
              fontFamily: t.fontFamily.display[900],
              fontSize: TITLE_SIZE,
              lineHeight: TITLE_LINE,
              letterSpacing: TITLE_SPACING,
              color: t.color.onPrimary,
            }}
          >
            КРИК
          </Text>
          <Text
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            style={{
              fontFamily: t.fontFamily.text[500],
              fontSize: SUBTITLE_SIZE,
              lineHeight: SUBTITLE_LINE,
              color: t.color.onPrimary,
            }}
          >
            выпустить пар
          </Text>
        </View>
      )}
    </Pressable>
  );
}
