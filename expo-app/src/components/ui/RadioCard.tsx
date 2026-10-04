import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { focusRing, isFocused } from './focus';

// Размеры из макета OnbUniversity (.uni, .radio, .abbr).
const MIN_HEIGHT = 68;
const PAD_V = 10;
const PAD_H = 16;
const RADIUS = 18;
const BORDER = 1.5;
const GAP = 14;
const RADIO = 24;
const RADIO_BORDER = 2;
const RADIO_DOT = 12;
const TITLE_SIZE = 16;
const TITLE_LINE = 22;
const TEXT_GAP = 2;

type Props = {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
};

/** Вариант выбора «один из списка» в виде карточки: вуз, ответ теста. Выбранный отмечен точкой, а не только цветом. */
export function RadioCard({ title, description, selected, onPress }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      aria-checked={selected}
      style={(state) => [
        {
          minHeight: MIN_HEIGHT,
          paddingVertical: PAD_V,
          paddingHorizontal: PAD_H,
          borderRadius: RADIUS,
          borderWidth: BORDER,
          borderColor: selected ? t.color.primary : t.color.border,
          backgroundColor: selected ? t.color.primarySoft : t.color.surface,
          flexDirection: 'row',
          alignItems: 'center',
          gap: GAP,
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      <View
        style={{
          width: RADIO,
          height: RADIO,
          borderRadius: t.radius.full,
          borderWidth: RADIO_BORDER,
          borderColor: selected ? t.color.primary : t.color.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {selected ? (
          <View
            style={{
              width: RADIO_DOT,
              height: RADIO_DOT,
              borderRadius: t.radius.full,
              backgroundColor: t.color.primary,
            }}
          />
        ) : null}
      </View>
      <View style={{ flex: 1, gap: TEXT_GAP }}>
        <Text
          style={{
            fontFamily: t.fontFamily.display[800],
            fontSize: TITLE_SIZE,
            lineHeight: TITLE_LINE,
            color: selected ? t.color.onPrimarySoft : t.color.text,
          }}
        >
          {title}
        </Text>
        {description ? (
          <Text style={[t.type.caption, { color: selected ? t.color.onPrimarySoft : t.color.textMuted }]}>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
