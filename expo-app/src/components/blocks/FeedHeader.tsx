import React from 'react';
import { Text, View } from 'react-native';
import { useAccessibilityFocus } from '@/features/navigation/useAccessibilityFocus';
import { useTheme } from '@/theme';
import { SosRound } from './SosRound';
import { useTopInset } from './useTopInset';

type Props = {
  /** Заголовок экрана ленты: «Подбор специалиста», «Доброе слово». */
  title: string;
  /** Подпись под заголовком: «Проверенные способы снять напряжение». */
  subtitle?: string;
  /** Экран сейчас текущий в ленте: на его заголовок переходит фокус TalkBack. */
  active: boolean;
  onSosPress: () => void;
  /** false — если над шапкой уже есть блок с отступом под статусбар (PullHint на Техниках). */
  inset?: boolean;
};

/** Шапка экрана ленты: заголовок h1 и круглая SOS справа. */
export function FeedHeader({ title, subtitle, active, onSosPress, inset = true }: Props) {
  const t = useTheme();
  const topInset = useTopInset();
  const titleRef = useAccessibilityFocus(active);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: subtitle ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: t.space.sm,
        paddingTop: inset ? topInset : t.space.md,
        paddingHorizontal: t.space.screen,
      }}
    >
      <View style={{ flexShrink: 1, gap: t.space.xxs }}>
        <Text ref={titleRef} accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
          {title}
        </Text>
        {subtitle ? <Text style={[t.type.caption, { color: t.color.textMuted }]}>{subtitle}</Text> : null}
      </View>
      <SosRound onPress={onSosPress} />
    </View>
  );
}
