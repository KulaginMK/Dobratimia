import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/brand';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';
import { SosRound } from './SosRound';

// Размеры из макета Home (.round, .rbtn). Диаметр — токен size.roundAction (72).
const GAP = 6;
const ICON_SIZE = 30;
const BORDER = 1.5;

type Props = {
  icon: IconName;
  label: string;
  onPress: () => void;
};

/** Круглая кнопка с подписью под ней: «Карта» на Главной. */
export function RoundAction({ icon, label, onPress }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(state) => [
        { alignItems: 'center', gap: GAP, borderRadius: t.radius.md },
        focusRing(t, isFocused(state)),
      ]}
    >
      {({ pressed }) => (
        <>
          <View
            style={{
              width: t.size.roundAction,
              height: t.size.roundAction,
              borderRadius: t.radius.full,
              borderWidth: BORDER,
              borderColor: t.color.borderStrong,
              backgroundColor: pressed ? t.color.surfaceAlt : t.color.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={icon} size={ICON_SIZE} color={t.color.text} />
          </View>
          <Text
            style={{
              fontFamily: t.fontFamily.text[500],
              fontSize: t.type.caption.fontSize,
              lineHeight: t.type.caption.lineHeight,
              color: t.color.text,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** Круглая SOS с подписью под ней — пара к «Карте» на Главной. Подпись декоративная: кнопку называет сама SOS. */
export function SosAction({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: GAP }}>
      <SosRound size="lg" onPress={onPress} />
      <Text
        aria-hidden
        style={{
          fontFamily: t.fontFamily.text[500],
          fontSize: t.type.caption.fontSize,
          lineHeight: t.type.caption.lineHeight,
          color: t.color.text,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
