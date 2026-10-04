import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/brand';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';

// Размеры из макетов (.pull на Техниках и Подборе, .handle на Медитациях и Избранных).
const PILL_GAP = 6;
const PILL_FONT = 14;
const PILL_LINE = 20;
const PILL_ICON = 18;
const HANDLE_WIDTH = 40;
const HANDLE_HEIGHT = 4;
const HANDLE_GAP = 4;
const HANDLE_PAD_TOP = 12;

type Props = {
  /** «Потяните вниз — медитации и Pomodoro», «Свайп вверх — к техникам». */
  label: string;
  /** pill — плашка со стрелкой вниз на экране ленты; handle — ручка с подписью на экране, выехавшем сверху. */
  variant?: 'pill' | 'handle';
  /** Для скринридера, если подпись про жест непонятна на слух: «Назад к техникам». */
  accessibilityLabel?: string;
  /** То же, что свайп вниз/вверх — для тех, кто не догадается или не может свайпать. */
  onPress?: () => void;
};

/** Подсказка о вертикальном жесте. Нажимается как кнопка. */
export function PullHint({ label, variant = 'pill', accessibilityLabel, onPress }: Props) {
  const t = useTheme();

  if (variant === 'handle') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={(state) => [
          {
            minHeight: t.size.touch,
            paddingTop: HANDLE_PAD_TOP,
            alignItems: 'center',
            gap: HANDLE_GAP,
            borderRadius: t.radius.sm,
          },
          focusRing(t, isFocused(state)),
        ]}
      >
        <View
          style={{
            width: HANDLE_WIDTH,
            height: HANDLE_HEIGHT,
            borderRadius: HANDLE_HEIGHT / 2,
            backgroundColor: t.color.borderStrong,
          }}
        />
        <Text style={[t.type.caption, { color: t.color.textMuted, textAlign: 'center' }]}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={(state) => [
        {
          minHeight: t.size.touch,
          paddingHorizontal: t.space.sm,
          borderRadius: t.radius.lg,
          backgroundColor: t.color.surfaceAlt,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: PILL_GAP,
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      <View style={{ transform: [{ rotate: '90deg' }] }}>
        <Icon name="chevronRight" size={PILL_ICON} color={t.color.text} />
      </View>
      <Text
        style={{
          flexShrink: 1,
          fontFamily: t.fontFamily.text[600],
          fontSize: PILL_FONT,
          lineHeight: PILL_LINE,
          color: t.color.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
