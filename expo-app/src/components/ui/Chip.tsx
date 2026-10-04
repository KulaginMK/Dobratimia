import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/brand';
import { useTheme } from '@/theme';
import { focusRing, isFocused, pressedState } from './focus';

// Размеры из веб-эталона bundle.css (.dt-chip) и макетов (.tagc).
const HEIGHT = 40;
const PAD_H = 16;
const BORDER = 1.5;
const GAP = 6;
const FONT_SIZE = 15;
const LINE_HEIGHT = 20;
const CHECK_SIZE = 16;
const ICON_SIZE = 18;
const BADGE_PAD_V = 5;
const BADGE_PAD_H = 12;

type Props = {
  selected?: boolean;
  defaultSelected?: boolean;
  /** Иконка вместо галочки, например message для «Онлайн». */
  icon?: IconName;
  disabled?: boolean;
  onChange?: (selected: boolean) => void;
  children: React.ReactNode;
};

/** Чип-переключатель: фильтры, выбор специализаций, подсказки. Видимая высота 40, область касания 48. */
export function Chip({ selected, defaultSelected, icon, disabled, onChange, children }: Props) {
  const t = useTheme();
  const [inner, setInner] = useState(!!defaultSelected);
  const sel = selected ?? inner;
  const fg = disabled ? t.color.textMuted : sel ? t.color.onPrimarySoft : t.color.text;
  const slop = (t.size.touch - HEIGHT) / 2;

  const toggle = () => {
    if (selected === undefined) setInner(!sel);
    onChange?.(!sel);
  };

  return (
    <Pressable
      onPress={toggle}
      disabled={disabled}
      hitSlop={{ top: slop, bottom: slop }}
      accessibilityRole="button"
      aria-disabled={!!disabled}
      {...pressedState(sel)}
      style={(state) => [
        {
          minHeight: HEIGHT,
          paddingHorizontal: PAD_H,
          marginVertical: slop,
          borderRadius: t.radius.full,
          borderWidth: BORDER,
          borderColor: sel ? t.color.primary : t.color.border,
          backgroundColor: sel ? t.color.primarySoft : t.color.surfaceAlt,
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: GAP,
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      {sel && !icon ? <Icon name="check" size={CHECK_SIZE} color={fg} /> : null}
      {icon ? <Icon name={icon} size={ICON_SIZE} color={fg} /> : null}
      <Text
        style={{
          fontFamily: sel ? t.fontFamily.text[600] : t.fontFamily.text[500],
          fontSize: FONT_SIZE,
          lineHeight: LINE_HEIGHT,
          color: fg,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

/** Чип-бейдж без нажатия: специализации в карточке специалиста. */
export function ChipBadge({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={{
        paddingVertical: BADGE_PAD_V,
        paddingHorizontal: BADGE_PAD_H,
        borderRadius: t.radius.full,
        backgroundColor: t.color.surfaceAlt,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          fontFamily: t.fontFamily.text[500],
          fontSize: t.type.caption.fontSize,
          lineHeight: t.type.caption.lineHeight,
          color: t.color.text,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
