import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { focusRing, isFocused } from './focus';

// Размеры из макетов (.seg). Высота сегмента в макетах 44 — увеличена до нормы касания 48 (docs/04).
const PAD = 4;
const GAP = 4;
const FONT_SIZE = 15;
const LINE_HEIGHT = 20;
// Тема в профиле (макет Profile): три сегмента, подпись «Как в системе» — шрифт мельче, чтобы она шла в одну строку.
const DENSE_FONT_SIZE = 14;

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Что переключаем: «Тон фраз», «Тема оформления». */
  accessibilityLabel: string;
  /** Три сегмента с длинными подписями: шрифт и поля меньше. */
  dense?: boolean;
};

/** Сегменты-вкладки: «Сахарный / С перчиком», «Голосом / Выплеснуть текстом», тема в профиле. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  dense,
}: Props<T>) {
  const t = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        gap: GAP,
        padding: PAD,
        borderRadius: t.radius.full,
        backgroundColor: t.color.surfaceAlt,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            aria-selected={selected}
            style={(state) => [
              {
                flex: 1,
                minHeight: t.size.touch,
                paddingHorizontal: dense ? t.space.xxs : t.space.xs,
                borderRadius: t.radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? t.color.surface : 'transparent',
                boxShadow: selected ? t.shadow.sm : undefined,
              },
              focusRing(t, isFocused(state)),
            ]}
          >
            <Text
              style={{
                fontFamily: t.fontFamily.text[600],
                fontSize: dense ? DENSE_FONT_SIZE : FONT_SIZE,
                lineHeight: LINE_HEIGHT,
                textAlign: 'center',
                color: selected ? t.color.text : t.color.textMuted,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
