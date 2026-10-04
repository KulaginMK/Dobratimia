import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/brand';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';

// Размеры из макета Techniques (.rec, .ric, .t).
const MIN_HEIGHT = 72;
const PAD_V = 10;
const PAD_H = 14;
const RADIUS = 20;
const GAP = 14;
const ICON_BOX = 48;
const ICON_BOX_RADIUS = 14;
const ICON_SIZE = 30;
const TITLE_SIZE = 17;
const TITLE_LINE = 22;
const TEXT_GAP = 2;
const CHEVRON_SIZE = 20;

type Props = {
  icon: IconName;
  title: string;
  caption?: string;
  /** primary — иконка на терракотовой подложке (список техник); neutral — на нейтральной (советы в результатах теста). */
  tone?: 'primary' | 'neutral';
  onPress: () => void;
};

/** Карточка-строка списка: иконка, заголовок, подпись и стрелка. Нажимается целиком. */
export function ListItemCard({ icon, title, caption, tone = 'primary', onPress }: Props) {
  const t = useTheme();
  const primary = tone === 'primary';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={(state) => [
        {
          minHeight: MIN_HEIGHT,
          paddingVertical: PAD_V,
          paddingHorizontal: PAD_H,
          borderRadius: RADIUS,
          backgroundColor: t.color.surface,
          boxShadow: state.pressed ? t.shadow.md : t.shadow.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: GAP,
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      <View
        style={{
          width: ICON_BOX,
          height: ICON_BOX,
          borderRadius: ICON_BOX_RADIUS,
          backgroundColor: primary ? t.color.primarySoft : t.color.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={ICON_SIZE} color={primary ? t.color.onPrimarySoft : t.color.primary} />
      </View>
      <View style={{ flex: 1, gap: TEXT_GAP }}>
        <Text
          style={{
            fontFamily: t.fontFamily.display[800],
            fontSize: TITLE_SIZE,
            lineHeight: TITLE_LINE,
            color: t.color.text,
          }}
        >
          {title}
        </Text>
        {caption ? <Text style={[t.type.caption, { color: t.color.textMuted }]}>{caption}</Text> : null}
      </View>
      <Icon name="chevronRight" size={CHEVRON_SIZE} color={t.color.text} />
    </Pressable>
  );
}
