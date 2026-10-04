import React from 'react';
import { Text, View } from 'react-native';
import { useAccessibilityFocus } from '@/features/navigation/useAccessibilityFocus';
import { useTheme } from '@/theme';
import { SosRound } from './SosRound';
import { useTopInset } from './useTopInset';

type Props = {
  /** Заголовок экрана ленты: «Подбор специалиста», «Доброе слово». */
  title: string;
  /** Экран сейчас текущий в ленте: на его заголовок переходит фокус TalkBack. */
  active: boolean;
  onSosPress: () => void;
  /** false — если над шапкой уже есть блок с отступом под статусбар (PullHint на Техниках). */
  inset?: boolean;
};

/** Шапка экрана ленты: заголовок h1 и круглая SOS справа. */
export function FeedHeader({ title, active, onSosPress, inset = true }: Props) {
  const t = useTheme();
  const topInset = useTopInset();
  const titleRef = useAccessibilityFocus(active);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: t.space.sm,
        paddingTop: inset ? topInset : t.space.md,
        paddingHorizontal: t.space.screen,
      }}
    >
      <Text ref={titleRef} accessibilityRole="header" style={[t.type.h1, { flexShrink: 1, color: t.color.text }]}>
        {title}
      </Text>
      <SosRound onPress={onSosPress} />
    </View>
  );
}
