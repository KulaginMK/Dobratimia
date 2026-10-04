import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/brand';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';

// Размеры из макета Sos (.pick).
const MIN_HEIGHT = 64;
const PAD_V = 8;
const PAD_H = 16;
const RADIUS = 20;
const BORDER = 1.5;
const GAP = 14;
const ICON_BOX = 44;
const ICON_BOX_RADIUS = 14;
const ICON_SIZE = 26;
const CHEVRON_SIZE = 20;

type Props = {
  icon: IconName;
  title: string;
  caption?: string;
  onPress: () => void;
};

/** Строка-переход: иконка, заголовок, подпись и стрелка. «Выберите свой вуз» на экране SOS. */
export function LinkRow({ icon, title, caption, onPress }: Props) {
  const t = useTheme();
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
          borderWidth: BORDER,
          borderColor: t.color.borderStrong,
          backgroundColor: state.pressed ? t.color.surfaceAlt : t.color.surface,
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
          backgroundColor: t.color.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={ICON_SIZE} color={t.color.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[t.type.bodyStrong, { color: t.color.text }]}>{title}</Text>
        {caption ? <Text style={[t.type.caption, { color: t.color.textMuted }]}>{caption}</Text> : null}
      </View>
      <Icon name="chevronRight" size={CHEVRON_SIZE} color={t.color.text} />
    </Pressable>
  );
}
