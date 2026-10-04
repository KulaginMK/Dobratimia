import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { focusRing, isFocused } from './focus';

// Размеры из веб-эталона bundle.css (.dt-indicator).
const ITEM_MIN_HEIGHT = 52;
const ITEM_PAD_H = 6;
const ITEM_GAP = 5;
const ROW_GAP = 2;
const ROW_PAD_H = 6;
const DOT = 8;
const DOT_ACTIVE = 24;
const DOT_MS = 200;
const FONT_SIZE = 12;
const LINE_HEIGHT = 16;
const MAX_FONT_SCALE = 1.3;
const PILL_MIN_HEIGHT = 36;
const PILL_PAD_H = 14;
const DOTS_GAP = 4;

const DEFAULT_SCREENS = ['Анатомия', 'Техники', 'Главная', 'Специалисты', 'Слово'];

type Props = {
  /** Названия слева направо. По умолчанию лента: Анатомия, Техники, Главная, Специалисты, Слово. */
  screens?: string[];
  /** Индекс текущего экрана. */
  current?: number;
  defaultCurrent?: number;
  /** labels — точки с подписями; dots — только точки, активный экран подписан. */
  variant?: 'labels' | 'dots';
  /** Как называть пункт для скринридера: «Главная, экран 3 из 5» или «Статистика, вкладка 2 из 2». */
  itemNoun?: 'экран' | 'вкладка';
  onSelect?: (index: number) => void;
};

/** Индикатор ленты экранов внизу. По нему можно перейти к любому экрану; сверху граница color.border. */
export function ScreenIndicator({
  screens = DEFAULT_SCREENS,
  current,
  defaultCurrent = 2,
  variant = 'labels',
  itemNoun = 'экран',
  onSelect,
}: Props) {
  const t = useTheme();
  const [inner, setInner] = useState(defaultCurrent);
  const active = current ?? inner;
  const dots = variant === 'dots';

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: dots ? 'center' : 'space-between',
        gap: dots ? DOTS_GAP : ROW_GAP,
        paddingHorizontal: ROW_PAD_H,
        borderTopWidth: 1,
        borderTopColor: t.color.border,
      }}
    >
      {screens.map((name, i) => {
        const isActive = i === active;
        const pill = dots && isActive;
        return (
          <Pressable
            key={name}
            onPress={() => {
              if (current === undefined) setInner(i);
              onSelect?.(i);
            }}
            accessibilityRole="tab"
            accessibilityLabel={`${name}, ${itemNoun} ${i + 1} из ${screens.length}`}
            aria-selected={isActive}
            style={(state) => [
              {
                minHeight: ITEM_MIN_HEIGHT,
                minWidth: t.size.touch,
                paddingHorizontal: ITEM_PAD_H,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: t.radius.sm,
              },
              focusRing(t, isFocused(state)),
            ]}
          >
            {pill ? (
              <View
                style={{
                  minHeight: PILL_MIN_HEIGHT,
                  paddingHorizontal: PILL_PAD_H,
                  borderRadius: t.radius.full,
                  backgroundColor: t.color.primary,
                  justifyContent: 'center',
                }}
              >
                <Label name={name} color={t.color.onPrimary} bold />
              </View>
            ) : (
              <View style={{ alignItems: 'center', gap: ITEM_GAP }}>
                <Dot active={isActive} />
                {dots ? null : (
                  <Label name={name} color={isActive ? t.color.primary : t.color.textMuted} bold={isActive} />
                )}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function Label({ name, color, bold }: { name: string; color: string; bold: boolean }) {
  const t = useTheme();
  return (
    <Text
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      style={{
        fontFamily: bold ? t.fontFamily.text[700] : t.fontFamily.text[500],
        fontSize: FONT_SIZE,
        lineHeight: LINE_HEIGHT,
        color,
      }}
    >
      {name}
    </Text>
  );
}

/** Точка 8×8; у активного экрана вытягивается в полоску 24×8 цвета color.primary. */
function Dot({ active }: { active: boolean }) {
  const t = useTheme();
  const width = useSharedValue(active ? DOT_ACTIVE : DOT);
  useEffect(() => {
    width.set(withTiming(active ? DOT_ACTIVE : DOT, { duration: DOT_MS, easing: Easing.out(Easing.cubic) }));
  }, [active, width]);
  const style = useAnimatedStyle(() => ({ width: width.get() }));
  return (
    <Animated.View
      style={[
        { height: DOT, borderRadius: DOT / 2, backgroundColor: active ? t.color.primary : t.color.textMuted },
        style,
      ]}
    />
  );
}
