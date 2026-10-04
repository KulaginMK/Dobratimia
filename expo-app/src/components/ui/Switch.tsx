import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Icon } from '@/components/brand';
import { useTheme } from '@/theme';
import { focusRing, isFocused } from './focus';

// Размеры из веб-эталона bundle.css (.dt-switch).
const ROW_MIN_HEIGHT = 56;
const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 32;
const TRACK_BORDER = 1.5;
const THUMB = 23;
const THUMB_INSET = 3;
const THUMB_TRAVEL = 24;
const CHECK_SIZE = 14;
const LABEL_LINE = 22;
const TEXT_GAP = 2;
const DISABLED_OPACITY = 0.55;

type Props = {
  /** Что включается. */
  label: string;
  /** Вторая строка, например расписание: «Каждый день в 21:00». */
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
};

/** Переключатель с подписью. Нажимается вся строка; состояние видно не только по цвету — у включённого галочка. */
export function Switch({ label, description, checked, defaultChecked, disabled, onChange }: Props) {
  const t = useTheme();
  const [inner, setInner] = useState(!!defaultChecked);
  const on = checked ?? inner;

  const progress = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    progress.set(withTiming(on ? 1 : 0, { duration: t.motion.press, easing: Easing.out(Easing.cubic) }));
  }, [on, progress, t.motion.press]);
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.get() * THUMB_TRAVEL }],
  }));

  const toggle = () => {
    if (checked === undefined) setInner(!on);
    onChange?.(!on);
  };

  return (
    <Pressable
      onPress={toggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      aria-checked={on}
      aria-disabled={!!disabled}
      style={(state) => [
        {
          minHeight: ROW_MIN_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: t.space.md,
          opacity: disabled ? DISABLED_OPACITY : 1,
          borderRadius: t.radius.sm,
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      <View style={{ flexShrink: 1, gap: TEXT_GAP }}>
        <Text style={[t.type.body, { lineHeight: LABEL_LINE, color: t.color.text }]}>{label}</Text>
        {description ? <Text style={[t.type.caption, { color: t.color.textMuted }]}>{description}</Text> : null}
      </View>
      <View
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: t.radius.full,
          borderWidth: TRACK_BORDER,
          borderColor: on ? t.color.primary : t.color.borderStrong,
          backgroundColor: on ? t.color.primary : t.color.surfaceAlt,
          flexShrink: 0,
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: THUMB_INSET,
              left: THUMB_INSET,
              width: THUMB,
              height: THUMB,
              borderRadius: t.radius.full,
              backgroundColor: on ? t.color.onPrimary : t.color.borderStrong,
              alignItems: 'center',
              justifyContent: 'center',
            },
            thumbStyle,
          ]}
        >
          {on ? <Icon name="check" size={CHECK_SIZE} color={t.color.primary} /> : null}
        </Animated.View>
      </View>
    </Pressable>
  );
}
